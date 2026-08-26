import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreateSuccessStoryDto, UpdateSuccessStoryDto } from './dto/success-story.dto';
import { CreateFundingSourceDto, UpdateFundingSourceDto } from './dto/funding-source.dto';
import { CreateTimelineMilestoneDto, UpdateTimelineMilestoneDto } from './dto/timeline-milestone.dto';
import { CreateRegionalImpactDto, UpdateRegionalImpactDto } from './dto/regional-impact.dto';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { CreateAboutStatDto, UpdateAboutStatDto } from './dto/about-stat.dto';
import { UpsertPlatformInfoDto } from './dto/platform-info.dto';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Public()
  @Get('testimonials')
  @ApiOperation({ summary: 'List testimonials' })
  getTestimonials() {
    return this.contentService.getTestimonials();
  }

  @Public()
  @Get('impact-metrics')
  @ApiOperation({ summary: 'Get impact metrics and success stories' })
  getImpactMetrics() {
    return this.contentService.getImpactMetrics();
  }

  @Public()
  @Get('funding-sources')
  @ApiOperation({ summary: 'List funding sources' })
  getFundingSources() {
    return this.contentService.getFundingSources();
  }

  @Public()
  @Get('regional-impacts')
  @ApiOperation({ summary: 'List regional impact data' })
  getRegionalImpacts() {
    return this.contentService.getRegionalImpacts();
  }

  @Public()
  @Get('timeline-milestones')
  @ApiOperation({ summary: 'List timeline milestones' })
  getTimelineMilestones() {
    return this.contentService.getTimelineMilestones();
  }

  @Public()
  @Get('sdgs')
  @ApiOperation({ summary: 'List SDG alignments' })
  getSdgs() {
    return this.contentService.getSdgs();
  }

  @Public()
  @Get('platform-info')
  @ApiOperation({ summary: 'Get platform info (founded, team, etc.)' })
  getPlatformInfo() {
    return this.contentService.getPlatformInfo();
  }

  // ── Admin: Success Stories ────────────────────────────────────────────────
  @Get('admin/success-stories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminGetSuccessStories() { return this.contentService.adminGetSuccessStories(); }

  @Post('admin/success-stories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminCreateSuccessStory(@Body() dto: CreateSuccessStoryDto) { return this.contentService.adminCreateSuccessStory(dto); }

  @Patch('admin/success-stories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminUpdateSuccessStory(@Param('id') id: string, @Body() dto: UpdateSuccessStoryDto) { return this.contentService.adminUpdateSuccessStory(id, dto); }

  @Delete('admin/success-stories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminDeleteSuccessStory(@Param('id') id: string) { return this.contentService.adminDeleteSuccessStory(id); }

  // ── Admin: Funding Sources ────────────────────────────────────────────────
  @Get('admin/funding-sources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminGetFundingSources() { return this.contentService.adminGetFundingSources(); }

  @Post('admin/funding-sources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminCreateFundingSource(@Body() dto: CreateFundingSourceDto) { return this.contentService.adminCreateFundingSource(dto); }

  @Patch('admin/funding-sources/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminUpdateFundingSource(@Param('id') id: string, @Body() dto: UpdateFundingSourceDto) { return this.contentService.adminUpdateFundingSource(id, dto); }

  @Delete('admin/funding-sources/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminDeleteFundingSource(@Param('id') id: string) { return this.contentService.adminDeleteFundingSource(id); }

  // ── Admin: Timeline ───────────────────────────────────────────────────────
  @Get('admin/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminGetTimeline() { return this.contentService.adminGetTimeline(); }

  @Post('admin/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminCreateTimelineMilestone(@Body() dto: CreateTimelineMilestoneDto) { return this.contentService.adminCreateTimelineMilestone(dto); }

  @Patch('admin/timeline/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminUpdateTimelineMilestone(@Param('id') id: string, @Body() dto: UpdateTimelineMilestoneDto) { return this.contentService.adminUpdateTimelineMilestone(id, dto); }

  @Delete('admin/timeline/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminDeleteTimelineMilestone(@Param('id') id: string) { return this.contentService.adminDeleteTimelineMilestone(id); }

  // ── Admin: Regional Impacts ───────────────────────────────────────────────
  @Get('admin/regional-impacts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminGetRegionalImpacts() { return this.contentService.adminGetRegionalImpacts(); }

  @Post('admin/regional-impacts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminCreateRegionalImpact(@Body() dto: CreateRegionalImpactDto) { return this.contentService.adminCreateRegionalImpact(dto); }

  @Patch('admin/regional-impacts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminUpdateRegionalImpact(@Param('id') id: string, @Body() dto: UpdateRegionalImpactDto) { return this.contentService.adminUpdateRegionalImpact(id, dto); }

  @Delete('admin/regional-impacts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminDeleteRegionalImpact(@Param('id') id: string) { return this.contentService.adminDeleteRegionalImpact(id); }

  // ── Admin: Platform Info ──────────────────────────────────────────────────
  @Get('admin/platform-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminGetPlatformInfo() { return this.contentService.adminGetPlatformInfo(); }

  @Post('admin/platform-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminUpsertPlatformInfo(@Body() dto: UpsertPlatformInfoDto) {
    return this.contentService.adminUpsertPlatformInfo(dto.key, dto.value);
  }

  // ── Public: Team Members ──────────────────────────────────────────────────
  @Public()
  @Get('team')
  @ApiOperation({ summary: 'Get active team members' })
  getTeamMembers() { return this.contentService.getTeamMembers(); }

  // ── Admin: Team Members ───────────────────────────────────────────────────
  @Get('admin/team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminGetTeamMembers() { return this.contentService.adminGetTeamMembers(); }

  @Post('admin/team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminCreateTeamMember(@Body() dto: CreateTeamMemberDto) { return this.contentService.adminCreateTeamMember(dto); }

  @Patch('admin/team/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminUpdateTeamMember(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) { return this.contentService.adminUpdateTeamMember(id, dto); }

  @Delete('admin/team/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminDeleteTeamMember(@Param('id') id: string) { return this.contentService.adminDeleteTeamMember(id); }

  // ── Public: About Stats ───────────────────────────────────────────────────
  @Public()
  @Get('about-stats')
  @ApiOperation({ summary: 'Get about page stats' })
  getAboutStats() { return this.contentService.getAboutStats(); }

  // ── Admin: About Stats ────────────────────────────────────────────────────
  @Get('admin/about-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminGetAboutStats() { return this.contentService.adminGetAboutStats(); }

  @Post('admin/about-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminCreateAboutStat(@Body() dto: CreateAboutStatDto) { return this.contentService.adminCreateAboutStat(dto); }

  @Patch('admin/about-stats/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminUpdateAboutStat(@Param('id') id: string, @Body() dto: UpdateAboutStatDto) { return this.contentService.adminUpdateAboutStat(id, dto); }

  @Delete('admin/about-stats/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  adminDeleteAboutStat(@Param('id') id: string) { return this.contentService.adminDeleteAboutStat(id); }
}
