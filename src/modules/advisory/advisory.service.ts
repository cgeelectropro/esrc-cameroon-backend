import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SessionType } from '@prisma/client';
import { EmailService } from '@/modules/email/email.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class AdvisoryService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private notifications: NotificationsService,
  ) {}

  async getAdvisors() {
    const advisors = await this.prisma.user.findMany({
      where: { role: { in: ['FELLOW', 'INSTRUCTOR', 'ADMIN'] } },
      include: { instructorProfile: true },
      take: 50,
    });
    const sessionCounts = await this.prisma.advisorySession.groupBy({
      by: ['advisorId'],
      _count: true,
    });
    const countMap = new Map(sessionCounts.map((s) => [s.advisorId, s._count]));
    return advisors.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      title: u.instructorProfile?.title || 'Advisor',
      specialization: u.instructorProfile?.expertise?.join(', ') || u.bio || 'Entrepreneurship, Business Strategy',
      image: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
      availability: 'Available',
      bio: u.bio || '',
      sessions: countMap.get(u.id) || 0,
    }));
  }

  async book(userId: string, dto: { advisorId: string; type: string; scheduledAt: string; duration: number }) {
    const session = await this.prisma.advisorySession.create({
      data: {
        userId,
        advisorId: dto.advisorId,
        type: dto.type as SessionType,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration || 60,
      },
    });

    // Send notifications + emails (fire-and-forget)
    const [user, advisor] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true, lastName: true } }),
      this.prisma.user.findUnique({ where: { id: dto.advisorId }, select: { email: true, firstName: true, lastName: true } }),
    ]);

    const scheduledStr = new Date(dto.scheduledAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    const advisorName = advisor ? `${advisor.firstName} ${advisor.lastName}` : 'your advisor';
    const userName = user ? `${user.firstName} ${user.lastName}` : 'a user';

    if (user) {
      this.notifications.create(userId, {
        title: 'Advisory Session Booked',
        body: `Your session with ${advisorName} is scheduled for ${scheduledStr}.`,
        type: 'advisory_booking',
        data: { sessionId: session.id },
      }).catch(() => null);
      this.email.sendAdvisorySessionBooked(user.email, user.firstName, advisorName, dto.type, scheduledStr).catch(() => null);
    }

    if (advisor) {
      this.notifications.create(dto.advisorId, {
        title: 'New Advisory Session',
        body: `${userName} has booked a session with you for ${scheduledStr}.`,
        type: 'advisory_booking',
        data: { sessionId: session.id },
      }).catch(() => null);
      this.email.sendAdvisorySessionToAdvisor(advisor.email, advisor.firstName, userName, dto.type, scheduledStr).catch(() => null);
    }

    return { sessionId: session.id };
  }

  async getSessions(userId: string) {
    return this.prisma.advisorySession.findMany({
      where: { userId },
      include: { advisor: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getAllSessions(query: { page?: string; limit?: string; status?: string; search?: string }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { advisor: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { advisor: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    const [sessions, total] = await Promise.all([
      this.prisma.advisorySession.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          advisor: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.advisorySession.count({ where }),
    ]);
    return { sessions, total, page, limit };
  }

  async updateSession(id: string, dto: { status?: string; notes?: string }) {
    return this.prisma.advisorySession.update({
      where: { id },
      data: dto as any,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        advisor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async deleteSession(id: string) {
    await this.prisma.advisorySession.delete({ where: { id } });
    return { success: true };
  }

  async createSession(dto: { userId: string; advisorId: string; type: string; scheduledAt: string; duration?: number; notes?: string }) {
    const session = await this.prisma.advisorySession.create({
      data: {
        userId: dto.userId,
        advisorId: dto.advisorId,
        type: dto.type as any,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration || 60,
        notes: dto.notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        advisor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return session;
  }

  async cancelSession(id: string, userId: string) {
    const session = await this.prisma.advisorySession.findFirst({ where: { id, userId } });
    if (!session) return { success: false, error: 'Session not found or access denied' };
    if (session.status === 'CANCELLED') return { success: false, error: 'Session already cancelled' };
    await this.prisma.advisorySession.update({ where: { id }, data: { status: 'CANCELLED' as any } });
    return { success: true };
  }

  async updateAdvisorProfile(advisorId: string, dto: { title?: string; organization?: string; expertise?: string[]; bio?: string; isAvailable?: boolean }) {
    // Update the user's instructor profile (or create if missing)
    const existing = await this.prisma.instructorProfile.findUnique({ where: { userId: advisorId } });
    if (existing) {
      await this.prisma.instructorProfile.update({
        where: { userId: advisorId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.organization !== undefined && { organization: dto.organization }),
          ...(dto.expertise !== undefined && { expertise: dto.expertise }),
        },
      });
    } else {
      await this.prisma.instructorProfile.create({
        data: { userId: advisorId, title: dto.title || 'Advisor', expertise: dto.expertise || [], isVerified: true, organization: dto.organization },
      });
    }
    if (dto.bio !== undefined) {
      await this.prisma.user.update({ where: { id: advisorId }, data: { bio: dto.bio } });
    }
    return { success: true };
  }

  async removeAdvisorRole(advisorId: string) {
    // Demote back to LEARNER so they no longer appear as advisor
    await this.prisma.user.update({ where: { id: advisorId }, data: { role: 'LEARNER' as any } });
    return { success: true };
  }

  async getAdminAdvisors() {
    const advisors = await this.prisma.user.findMany({
      where: { role: { in: ['FELLOW', 'INSTRUCTOR', 'ADMIN'] } },
      include: { instructorProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    const sessionCounts = await this.prisma.advisorySession.groupBy({
      by: ['advisorId'],
      _count: true,
    });
    const countMap = new Map(sessionCounts.map((s) => [s.advisorId, s._count]));
    return advisors.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role,
      title: u.instructorProfile?.title || null,
      organization: u.instructorProfile?.organization || null,
      expertise: u.instructorProfile?.expertise || [],
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
      bio: u.bio || '',
      sessionsCount: countMap.get(u.id) || 0,
      createdAt: u.createdAt,
    }));
  }
}
