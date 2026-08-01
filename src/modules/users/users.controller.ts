import { Controller, Get, Put, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateInstructorProfileDto } from './dto/create-instructor-profile.dto';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('instructor-profile')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create or update instructor profile' })
  createInstructorProfile(@CurrentUser('id') userId: string, @Body() dto: CreateInstructorProfileDto) {
    return this.usersService.createOrUpdateInstructorProfile(userId, dto);
  }

  @Get('instructor-profile')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get instructor profile' })
  getInstructorProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getInstructorProfile(userId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.usersService.updateProfile(userId, body);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get user enrollments for My Courses' })
  getEnrollments(@CurrentUser('id') userId: string) {
    return this.usersService.getEnrollments(userId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get user dashboard' })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.usersService.getDashboard(userId);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List user notifications' })
  getNotifications(@CurrentUser('id') userId: string) {
    return this.usersService.getNotifications(userId);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markNotificationRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.markNotificationRead(userId, id);
  }
}
