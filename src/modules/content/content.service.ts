import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getTestimonials() {
    return this.prisma.testimonial.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getImpactMetrics() {
    const [metrics, stories] = await Promise.all([
      this.prisma.impactMetric.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.successStory.findMany({ orderBy: { order: 'asc' } }),
    ]);
    return { metrics, stories };
  }

  async getFundingSources() {
    return this.prisma.fundingSource.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getRegionalImpacts() {
    return this.prisma.regionalImpact.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getTimelineMilestones() {
    return this.prisma.timelineMilestone.findMany({
      orderBy: { year: 'asc' },
    });
  }

  async getSdgs() {
    return this.prisma.sdg.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getPlatformInfo() {
    const rows = await this.prisma.platformInfo.findMany();
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      map[r.key] = r.value;
    });
    return map;
  }

  // ── Admin: Success Stories ────────────────────────────────────────────────
  async adminGetSuccessStories() {
    return this.prisma.successStory.findMany({ orderBy: { order: 'asc' } });
  }
  async adminCreateSuccessStory(data: any) {
    return this.prisma.successStory.create({ data });
  }
  async adminUpdateSuccessStory(id: string, data: any) {
    return this.prisma.successStory.update({ where: { id }, data });
  }
  async adminDeleteSuccessStory(id: string) {
    return this.prisma.successStory.delete({ where: { id } });
  }

  // ── Admin: Funding Sources ────────────────────────────────────────────────
  async adminGetFundingSources() {
    return this.prisma.fundingSource.findMany({ orderBy: { order: 'asc' } });
  }
  async adminCreateFundingSource(data: any) {
    return this.prisma.fundingSource.create({ data });
  }
  async adminUpdateFundingSource(id: string, data: any) {
    return this.prisma.fundingSource.update({ where: { id }, data });
  }
  async adminDeleteFundingSource(id: string) {
    return this.prisma.fundingSource.delete({ where: { id } });
  }

  // ── Admin: Timeline Milestones ────────────────────────────────────────────
  async adminGetTimeline() {
    return this.prisma.timelineMilestone.findMany({ orderBy: { year: 'asc' } });
  }
  async adminCreateTimelineMilestone(data: any) {
    return this.prisma.timelineMilestone.create({ data });
  }
  async adminUpdateTimelineMilestone(id: string, data: any) {
    return this.prisma.timelineMilestone.update({ where: { id }, data });
  }
  async adminDeleteTimelineMilestone(id: string) {
    return this.prisma.timelineMilestone.delete({ where: { id } });
  }

  // ── Admin: Regional Impacts ───────────────────────────────────────────────
  async adminGetRegionalImpacts() {
    return this.prisma.regionalImpact.findMany({ orderBy: { order: 'asc' } });
  }
  async adminCreateRegionalImpact(data: any) {
    return this.prisma.regionalImpact.create({ data });
  }
  async adminUpdateRegionalImpact(id: string, data: any) {
    return this.prisma.regionalImpact.update({ where: { id }, data });
  }
  async adminDeleteRegionalImpact(id: string) {
    return this.prisma.regionalImpact.delete({ where: { id } });
  }

  // ── Admin: Platform Info ──────────────────────────────────────────────────
  async adminGetPlatformInfo() {
    return this.prisma.platformInfo.findMany();
  }
  async adminUpsertPlatformInfo(key: string, value: string) {
    return this.prisma.platformInfo.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ── Public: Team Members ──────────────────────────────────────────────────
  async getTeamMembers() {
    return this.prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  // ── Admin: Team Members ───────────────────────────────────────────────────
  async adminGetTeamMembers() {
    return this.prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
  }
  async adminCreateTeamMember(data: any) {
    return this.prisma.teamMember.create({ data });
  }
  async adminUpdateTeamMember(id: string, data: any) {
    return this.prisma.teamMember.update({ where: { id }, data });
  }
  async adminDeleteTeamMember(id: string) {
    return this.prisma.teamMember.delete({ where: { id } });
  }

  // ── Public: About Stats ───────────────────────────────────────────────────
  async getAboutStats() {
    return this.prisma.aboutStat.findMany({ orderBy: { order: 'asc' } });
  }

  // ── Admin: About Stats ────────────────────────────────────────────────────
  async adminGetAboutStats() {
    return this.prisma.aboutStat.findMany({ orderBy: { order: 'asc' } });
  }
  async adminCreateAboutStat(data: any) {
    return this.prisma.aboutStat.create({ data });
  }
  async adminUpdateAboutStat(id: string, data: any) {
    return this.prisma.aboutStat.update({ where: { id }, data });
  }
  async adminDeleteAboutStat(id: string) {
    return this.prisma.aboutStat.delete({ where: { id } });
  }
}
