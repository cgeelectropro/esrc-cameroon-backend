import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { EnrollmentsService } from './enrollments.service';
import { SectionsService } from './sections.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { AddReviewDto } from './dto/add-review.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
    private sectionsService: SectionsService,
  ) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List all active course categories' })
  getCategories() {
    return this.coursesService.getCategories();
  }

  @Public()
  @Get()
  findAll(@Query() filter: CourseFilterDto) {
    return this.coursesService.findAll(filter);
  }

  @Get('preview/:id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preview any course including DRAFT (admin/instructor only)' })
  previewCourse(@Param('id') id: string, @CurrentUser('role') role: string) {
    return this.coursesService.findOne(id, role);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateCourseDto, @CurrentUser('id') userId: string) {
    return this.coursesService.create(dto, userId);
  }

  @Patch(':id')
  @Roles('INSTRUCTOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: Partial<CreateCourseDto>, @CurrentUser('id') userId: string) {
    return this.coursesService.update(id, dto, userId);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  enroll(@Param('id') courseId: string, @CurrentUser('id') userId: string) {
    return this.enrollmentsService.enroll(userId, courseId);
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProgress(@Param('id') courseId: string, @CurrentUser('id') userId: string) {
    return this.enrollmentsService.getProgress(userId, courseId);
  }

  @Post(':courseId/lessons/:lessonId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  completeLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.completeLesson(userId, courseId, lessonId);
  }

  @Post(':id/sections')
  @Roles('INSTRUCTOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create section for a course' })
  createSection(
    @Param('id') courseId: string,
    @Body() dto: CreateSectionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.sectionsService.createSection(courseId, dto, userId);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addReview(
    @Param('id') courseId: string,
    @Body() dto: AddReviewDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.coursesService.addReview(userId, courseId, dto);
  }

  @Public()
  @Get(':courseId/reviews')
  getCourseReviews(@Param('courseId') courseId: string) {
    return this.coursesService.getCourseReviews(courseId);
  }

  @Get(':courseId/lessons/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getLessonDetail(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.getLessonDetail(userId, courseId, lessonId);
  }
}
