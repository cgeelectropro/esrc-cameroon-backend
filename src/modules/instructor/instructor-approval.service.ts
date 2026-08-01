import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { EmailService } from '@/modules/email/email.service';
import { SubmitInstructorRequestDto } from './dto/submit-instructor-request.dto';
import { ReviewInstructorRequestDto, ReviewAction } from './dto/review-instructor-request.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InstructorApprovalService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private email: EmailService,
    private config: ConfigService,
  ) {}

  /** Called when an instructor registers — creates their pending request */
  async submitRequest(userId: string, dto: SubmitInstructorRequestDto) {
    const existing = await this.prisma.instructorApprovalRequest.findUnique({
      where: { userId },
    });
    if (existing) {
      if (existing.status === 'APPROVED') {
        throw new BadRequestException('Your instructor application has already been approved.');
      }
      if (existing.status === 'PENDING') {
        throw new BadRequestException('You already have a pending instructor application.');
      }
      // Rejected — allow resubmission
      return this.prisma.instructorApprovalRequest.update({
        where: { userId },
        data: {
          ...dto,
          status: 'PENDING',
          reviewedById: null,
          reviewedAt: null,
          adminNotes: null,
          rejectionReason: null,
        },
      });
    }

    const request = await this.prisma.instructorApprovalRequest.create({
      data: { userId, ...dto },
    });

    // Notify all admins
    await this.notifyAdmins(userId, request.id);

    return request;
  }

  /** Get the current user's request status */
  async getMyRequestStatus(userId: string) {
    const request = await this.prisma.instructorApprovalRequest.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        title: true,
        organization: true,
        expertise: true,
        rejectionReason: true,
        adminNotes: true,
        createdAt: true,
        reviewedAt: true,
      },
    });
    return request;
  }

  /** Admin: list all requests with optional status filter */
  async listRequests(status?: string, page = 1, limit = 20) {
    const where = status ? { status: status as any } : {};
    const [requests, total] = await Promise.all([
      this.prisma.instructorApprovalRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              country: true,
              city: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.instructorApprovalRequest.count({ where }),
    ]);

    return { requests, total, page, limit };
  }

  /** Admin: get a single request */
  async getRequest(id: string) {
    const request = await this.prisma.instructorApprovalRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            country: true,
            city: true,
            bio: true,
            createdAt: true,
          },
        },
      },
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  /** Count pending requests (for admin badge) */
  async countPending() {
    return this.prisma.instructorApprovalRequest.count({
      where: { status: 'PENDING' },
    });
  }

  /** Admin: approve or reject a request */
  async reviewRequest(id: string, adminId: string, dto: ReviewInstructorRequestDto) {
    const request = await this.prisma.instructorApprovalRequest.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been reviewed.');
    }

    if (dto.action === ReviewAction.APPROVE) {
      // Update request
      await this.prisma.instructorApprovalRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNotes: dto.adminNotes,
        },
      });

      // Create InstructorProfile so the user can use their instructor dashboard
      await this.prisma.instructorProfile.upsert({
        where: { userId: request.userId },
        create: {
          userId: request.userId,
          title: request.title,
          organization: request.organization,
          expertise: request.expertise,
          isVerified: true,
        },
        update: { isVerified: true },
      });

      // Notify instructor (in-app + email)
      await this.notifications.create(request.userId, {
        title: 'Instructor Application Approved!',
        body: `Congratulations! Your instructor application has been approved. You can now log in and start creating courses.${dto.adminNotes ? ` Note from admin: ${dto.adminNotes}` : ''}`,
        type: 'INSTRUCTOR_APPROVED',
        data: { requestId: id },
      });
      this.email.sendInstructorApproved(request.user.email, request.user.firstName, dto.adminNotes).catch(() => null);

    } else {
      await this.prisma.instructorApprovalRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedById: adminId,
          reviewedAt: new Date(),
          adminNotes: dto.adminNotes,
          rejectionReason: dto.rejectionReason,
        },
      });

      // Notify instructor with reason (in-app + email)
      await this.notifications.create(request.userId, {
        title: 'Instructor Application Update',
        body: `We regret to inform you that your instructor application was not approved at this time.${dto.rejectionReason ? ` Reason: ${dto.rejectionReason}` : ''} You may reapply after addressing the feedback.`,
        type: 'INSTRUCTOR_REJECTED',
        data: { requestId: id, reason: dto.rejectionReason },
      });
      this.email.sendInstructorRejected(request.user.email, request.user.firstName, dto.rejectionReason).catch(() => null);
    }

    return { success: true, action: dto.action };
  }

  private async notifyAdmins(applicantUserId: string, requestId: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true, email: true, firstName: true },
    });

    const applicant = await this.prisma.user.findUnique({
      where: { id: applicantUserId },
      select: { firstName: true, lastName: true, email: true },
    });

    const applicantName = `${applicant?.firstName} ${applicant?.lastName}`;

    await Promise.all(
      admins.map((admin) =>
        this.notifications.create(admin.id, {
          title: 'New Instructor Application',
          body: `${applicantName} (${applicant?.email}) has applied to become an instructor. Review their application now.`,
          type: 'NEW_INSTRUCTOR_REQUEST',
          data: { requestId, applicantId: applicantUserId },
        }),
      ),
    );

    // Email all admins
    admins.forEach((admin) => {
      if (admin.email) {
        this.email.sendNewInstructorRequestToAdmin(admin.email, applicantName, applicant?.email || '', requestId).catch(() => null);
      }
    });
  }
}
