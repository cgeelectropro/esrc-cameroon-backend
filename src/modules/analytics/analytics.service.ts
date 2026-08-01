import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUsers(query: { page?: number; limit?: number } = {}) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, limit };
  }

  async getModeration() {
    return {
      pendingPublications: await this.prisma.publication.count({ where: { isApproved: false } }),
      pendingOpportunities: await this.prisma.opportunity.count({ where: { isApproved: false } }),
    };
  }

  async getAnalytics() {
    const [users, courses, enrollments, payments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' as any } }),
      this.prisma.enrollment.count(),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);
    return {
      totalUsers: users,
      totalCourses: courses,
      totalEnrollments: enrollments,
      totalRevenue: payments._sum.amount || 0,
    };
  }
}
