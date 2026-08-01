import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
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
        phone: true,
        preferredLanguage: true,
        createdAt: true,
        enrollments: { select: { courseId: true } },
        certificates: { select: { id: true, courseId: true, courseName: true, issuedAt: true, verificationCode: true } },
      },
    });
    const { enrollments, certificates, ...rest } = user;
    return {
      ...rest,
      enrolledCourses: enrollments.map((e) => e.courseId),
      completedCourses: certificates.map((c) => c.courseId),
      certificates: certificates.map((c) => ({
        id: c.id,
        courseId: c.courseId,
        courseTitle: c.courseName,
        issuedAt: c.issuedAt,
        verificationCode: c.verificationCode,
      })),
    };
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    const allowed = ['firstName', 'lastName', 'bio', 'city', 'phone', 'preferredLanguage'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: update as Prisma.UserUpdateInput,
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
      },
    });
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNotificationRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async createOrUpdateInstructorProfile(userId: string, dto: { title: string; organization?: string; expertise?: string[] }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true },
    });
    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only instructors can create instructor profiles');
    }
    return this.prisma.instructorProfile.upsert({
      where: { userId },
      create: {
        userId,
        title: dto.title,
        organization: dto.organization,
        expertise: dto.expertise || [],
      },
      update: {
        title: dto.title,
        organization: dto.organization,
        expertise: dto.expertise ?? undefined,
      },
    });
  }

  async getInstructorProfile(userId: string) {
    return this.prisma.instructorProfile.findUnique({
      where: { userId },
    });
  }

  async getEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            sections: { include: { lessons: { select: { id: true } } } },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });
    return enrollments.map((e) => ({
      id: e.id,
      enrollmentId: e.id,
      courseId: e.courseId,
      progress: e.progressPct,
      progressPct: e.progressPct,
      completedAt: e.completedAt,
      course: e.course,
      totalLessons: e.course.sections.flatMap((s) => s.lessons).length,
    }));
  }

  async getDashboard(userId: string) {
    const [user, enrollments, certificates, notifications] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, role: true },
      }),
      this.prisma.enrollment.findMany({
        where: { userId },
        include: { course: { select: { id: true, title: true, thumbnail: true } } },
        take: 5,
      }),
      this.prisma.certificate.findMany({ where: { userId }, take: 5 }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);
    return {
      user,
      enrollments: enrollments.map((e) => ({
        ...e,
        progress: e.progressPct,
        course: e.course,
      })),
      certificates,
      notifications,
      stats: {
        enrolledCourses: await this.prisma.enrollment.count({ where: { userId } }),
        completedCourses: await this.prisma.certificate.count({ where: { userId } }),
        certificates: await this.prisma.certificate.count({ where: { userId } }),
        inProgressCourses: await this.prisma.enrollment.count({
          where: { userId, progressPct: { gt: 0, lt: 100 } },
        }),
        learningHours: Math.round(
          (await this.prisma.lessonCompletion.count({ where: { enrollment: { userId } } })) * 0.25
        ),
      },
    };
  }
}
