import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { RegisterDto } from './dto/register.dto';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hash = dto.password ? await bcrypt.hash(dto.password, 12) : null;

    const validRoles = ['LEARNER', 'INSTRUCTOR', 'FELLOW', 'PARTNER'];
    const requestedRole = dto.role && validRoles.includes(dto.role) ? dto.role : 'LEARNER';

    // Instructors are created as LEARNER until approved by admin
    const assignedRole = requestedRole === 'INSTRUCTOR' ? 'LEARNER' : requestedRole;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        googleId: (dto as any).googleId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: assignedRole as 'LEARNER' | 'FELLOW' | 'PARTNER',
        country: dto.country || 'CM',
        city: dto.city,
        preferredLanguage: (dto.preferredLanguage as 'EN' | 'FR' | 'BOTH') || 'EN',
        bio: dto.goals,
        interests:
          dto.interests?.length ?
            { create: dto.interests.map((c) => ({ category: c as string })) }
          : undefined,
      },
    });

    // If they registered as instructor, create a pending approval request
    if (requestedRole === 'INSTRUCTOR') {
      await this.prisma.instructorApprovalRequest.create({
        data: {
          userId: user.id,
          title: (dto as any).instructorTitle || 'Instructor',
          organization: (dto as any).organization,
          expertise: (dto as any).expertise || [],
          bio: dto.goals,
          phone: (dto as any).phone,
          linkedinUrl: (dto as any).linkedinUrl,
          motivation: (dto as any).motivation,
          status: 'PENDING',
        },
      });

      // Notify all admins
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true },
      });
      await Promise.all(
        admins.map((admin) =>
          this.notifications.create(admin.id, {
            title: 'New Instructor Application',
            body: `${user.firstName} ${user.lastName} (${user.email}) has applied to become an instructor. Review their application now.`,
            type: 'NEW_INSTRUCTOR_REQUEST',
            data: { applicantId: user.id },
          }),
        ),
      );
    }

    // Send welcome email (fire-and-forget)
    this.email.sendWelcome(user.email, user.firstName).catch(() => null);

    const loginResult = await this.login(user);
    // Attach pendingInstructorApproval flag so frontend can redirect to wait page
    return {
      ...loginResult,
      pendingInstructorApproval: requestedRole === 'INSTRUCTOR',
    };
  }

  async loginWithGoogle(idToken: string) {
    const clientId = this.config.get<string>('google.clientId');
    const client = new OAuth2Client(clientId);

    let ticket;
    try {
      ticket = await client.verifyIdToken({ idToken, audience: clientId });
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    const payload = ticket.getPayload();
    if (!payload?.email) throw new UnauthorizedException('Google token missing email');

    const { sub: googleId, email, given_name, family_name, picture } = payload;

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      if (!user.googleId) {
        // Link existing email account to Google on first OAuth sign-in
        await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: user.avatar || picture },
        });
        user = await this.prisma.user.findUnique({ where: { id: user.id } });
      }
      return this.login(user!);
    }

    // New user — return Google profile so frontend can complete registration
    return {
      needsProfileCompletion: true,
      googleProfile: {
        googleId,
        email,
        firstName: given_name || '',
        lastName: family_name || '',
        avatar: picture || null,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('jwt.secret'),
        expiresIn: this.config.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpiresIn'),
      }),
    ]);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash, lastLoginAt: new Date() },
    });

    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        bio: true,
        country: true,
        city: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    return { accessToken, refreshToken, user: fullUser };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { success: true };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) return null;
    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    return valid ? user : null;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) throw new UnauthorizedException();
    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new UnauthorizedException();
    return this.login(user);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If an account exists with this email, you will receive a password reset link.' };
    }
    // Generate a short-lived reset token (JWT, 1h)
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'password-reset' },
      { secret: this.config.get('jwt.secret'), expiresIn: '1h' },
    );
    const frontendUrl = this.config.get<string>('frontendUrl') || 'https://nextgen-en.com';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    this.email.sendForgotPassword(user.email, user.firstName, resetUrl).catch(() => null);
    return { message: 'If an account exists with this email, you will receive a password reset link.' };
  }

  async refreshFromToken(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token required');
    const payload = this.jwtService.decode(refreshToken) as { sub?: string };
    if (!payload?.sub) throw new UnauthorizedException('Invalid refresh token');
    return this.refreshTokens(payload.sub, refreshToken);
  }
}
