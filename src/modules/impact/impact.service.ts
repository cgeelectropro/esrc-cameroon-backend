import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ImpactService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalLearners, coursesPublished, certificatesIssued, researchPublications, advisorySessions, eventsHosted, partnerOrgs] = await Promise.all([
      this.prisma.user.count({ where: { role: 'LEARNER' } }),
      this.prisma.course.count({ where: { status: 'PUBLISHED' as any } }),
      this.prisma.certificate.count(),
      this.prisma.publication.count({ where: { isApproved: true } }),
      this.prisma.advisorySession.count(),
      this.prisma.event.count({ where: { isPublished: true } }),
      this.prisma.user.count({ where: { role: 'PARTNER' } }),
    ]);
    const countriesReached = await this.prisma.user.groupBy({
      by: ['country'],
      _count: true,
    });
    const fellowsHosted = await this.prisma.user.count({ where: { role: 'FELLOW' } });
    const entrepreneursSupported = await this.prisma.enrollment.count();

    return {
      totalLearners,
      coursesPublished,
      countriesReached: countriesReached.length,
      certificatesIssued,
      researchPublications,
      advisorySessions,
      eventsHosted,
      fellowsHosted,
      partnerOrganizations: partnerOrgs,
      entrepreneursSupported,
    };
  }
}
