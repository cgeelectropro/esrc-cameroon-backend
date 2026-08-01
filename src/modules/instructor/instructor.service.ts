import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class InstructorService {
  constructor(private prisma: PrismaService) {}

  async getCourses(userId: string) {
    const profile = await this.prisma.instructorProfile.findFirst({
      where: { userId },
    });
    // Admin (no profile) sees all courses; instructor sees own courses
    return this.prisma.course.findMany({
      where: profile ? { instructorId: profile.id } : {},
      include: {
        sections: {
          include: { lessons: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        instructor: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseById(courseId: string, userId: string) {
    const profile = await this.prisma.instructorProfile.findFirst({
      where: { userId },
    });
    // Admin (no profile) can access any course; instructor can only access own
    return this.prisma.course.findFirst({
      where: profile ? { id: courseId, instructorId: profile.id } : { id: courseId },
      include: {
        sections: {
          include: { lessons: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        instructor: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async getRevenue(userId: string) {
    const profile = await this.prisma.instructorProfile.findFirst({
      where: { userId },
    });
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        ...(profile ? { course: { instructorId: profile.id } } : {}),
        paymentId: { not: null },
      },
      include: {
        payment: true,
        course: { select: { title: true } },
      },
    });
    const revenueShare = profile?.revenueShare || 0.7;
    const totalRevenue = enrollments.reduce((sum, e) => sum + (e.payment?.amount || 0), 0);
    const instructorRevenue = totalRevenue * revenueShare;
    return {
      totalRevenue: instructorRevenue,
      avgRevenue: enrollments.length ? instructorRevenue / enrollments.length : 0,
      data: enrollments.map((e) => ({
        courseTitle: e.course.title,
        amount: (e.payment?.amount || 0) * revenueShare,
        date: e.payment?.createdAt,
      })),
    };
  }
}
