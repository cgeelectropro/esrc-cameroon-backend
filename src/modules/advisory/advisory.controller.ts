import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdvisoryService } from './advisory.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { BookSessionDto } from './dto/book-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateSessionAdminDto } from './dto/create-session-admin.dto';
import { UpdateAdvisorProfileDto } from './dto/update-advisor-profile.dto';

@ApiTags('advisory')
@Controller('advisory')
export class AdvisoryController {
  constructor(private advisoryService: AdvisoryService) {}

  @Public()
  @Get('advisors')
  @ApiOperation({ summary: 'List available advisors' })
  getAdvisors() {
    return this.advisoryService.getAdvisors();
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Book advisory session' })
  book(@Body() dto: BookSessionDto, @CurrentUser('id') userId: string) {
    return this.advisoryService.book(userId, dto);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user advisory sessions (as the learner who booked them)' })
  getSessions(@CurrentUser('id') userId: string) {
    return this.advisoryService.getSessions(userId);
  }

  @Get('my-sessions')
  @Roles('INSTRUCTOR', 'ADMIN', 'FELLOW')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sessions booked with the current user as advisor' })
  getMySessionsAsAdvisor(@CurrentUser('id') advisorId: string) {
    return this.advisoryService.getSessionsAsAdvisor(advisorId);
  }

  @Patch('sessions/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an advisory session (user)' })
  cancelSession(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.advisoryService.cancelSession(id, userId);
  }

  @Get('admin/advisors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all advisors with stats' })
  getAdminAdvisors() {
    return this.advisoryService.getAdminAdvisors();
  }

  @Patch('admin/advisors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update advisor profile (title, org, expertise, bio)' })
  updateAdvisorProfile(@Param('id') id: string, @Body() dto: UpdateAdvisorProfileDto) {
    return this.advisoryService.updateAdvisorProfile(id, dto);
  }

  @Delete('admin/advisors/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: remove advisor role (demote to LEARNER)' })
  removeAdvisorRole(@Param('id') id: string) {
    return this.advisoryService.removeAdvisorRole(id);
  }

  @Get('admin/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all advisory sessions' })
  getAllSessions(@Query() query: any) {
    return this.advisoryService.getAllSessions(query);
  }

  @Patch('admin/sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: update advisory session status/notes' })
  updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.advisoryService.updateSession(id, dto);
  }

  @Delete('admin/sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete advisory session' })
  deleteSession(@Param('id') id: string) {
    return this.advisoryService.deleteSession(id);
  }

  @Post('admin/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create advisory session manually' })
  createSession(@Body() dto: CreateSessionAdminDto) {
    return this.advisoryService.createSession(dto);
  }
}
