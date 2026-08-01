import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { type?: string; isRemote?: boolean; deadlineBefore?: string }) {
    const where: any = { isApproved: true };
    if (query.type) where.type = query.type;
    if (query.isRemote !== undefined) where.isRemote = query.isRemote;
    if (query.deadlineBefore) where.deadline = { lte: new Date(query.deadlineBefore) };
    return this.prisma.opportunity.findMany({
      where,
      orderBy: { deadline: 'asc' },
      take: 50,
    });
  }

  async apply(userId: string, opportunityId: string) {
    const existing = await this.prisma.application.findUnique({
      where: { userId_opportunityId: { userId, opportunityId } },
    });
    if (existing) throw new ConflictException('Already applied');
    const app = await this.prisma.application.create({
      data: { userId, opportunityId },
    });
    return { applicationId: app.id };
  }
}
