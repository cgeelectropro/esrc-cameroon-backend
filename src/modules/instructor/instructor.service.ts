import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class InstructorService {
  constructor(private prisma: PrismaService) {}

  async getCourses(userId: string, role: string) {
    const isAdmin = role === 'ADMIN';
    const profile = isAdmin ? null : await this.prisma.instructorProfile.findFirst({
      where: { userId },
    });
    // Admins see every course regardless of author; instructors see their own.
    // Branching on role (not "has a profile") matters because an admin who has
    // ever created a course gets an auto-created profile too, which previously
    // made them fall into the "instructor" branch and lose visibility into
    // everyone else's courses.
    return this.prisma.course.findMany({
      where: isAdmin ? {} : { instructorId: profile?.id ?? '__none__' },
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

  async getCourseById(courseId: string, userId: string, role: string) {
    const isAdmin = role === 'ADMIN';
    const profile = isAdmin ? null : await this.prisma.instructorProfile.findFirst({
      where: { userId },
    });
    return this.prisma.course.findFirst({
      where: isAdmin ? { id: courseId } : { id: courseId, instructorId: profile?.id ?? '__none__' },
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
