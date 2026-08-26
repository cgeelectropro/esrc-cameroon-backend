import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('instructor')
@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR', 'ADMIN')
@ApiBearerAuth()
export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  @Get('courses')
  @ApiOperation({ summary: 'List instructor courses with sections and lessons (admins see all)' })
  getCourses(@CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.instructorService.getCourses(userId, role);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by id for editing (instructor owns it; admin can access any)' })
  getCourseById(@Param('id') courseId: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.instructorService.getCourseById(courseId, userId, role);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get instructor revenue' })
  getRevenue(@CurrentUser('id') userId: string) {
    return this.instructorService.getRevenue(userId);
  }
}
