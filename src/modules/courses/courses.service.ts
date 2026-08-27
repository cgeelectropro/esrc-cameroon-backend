import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { AddReviewDto } from './dto/add-review.dto';
import { CourseLevel, Language } from '@prisma/client';
import { EmailService } from '@/modules/email/email.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private notifications: NotificationsService,
  ) {}

  async getCategories() {
    return this.prisma.courseCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findAll(filter: CourseFilterDto) {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (filter.category) where.category = filter.category;
    if (filter.level) where.level = filter.level as CourseLevel;
    if (filter.language) where.language = filter.language as Language;
    if (filter.isFree !== undefined) where.isFree = filter.isFree;
    if (filter.minRating) where.avgRating = { gte: filter.minRating };
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          instructor: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
          sections: { include: { lessons: true }, orderBy: { order: 'asc' } },
        },
        orderBy: filter.sortBy === 'rating' ? { avgRating: 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userRole?: string) {
    const privileged = userRole === 'ADMIN' || userRole === 'INSTRUCTOR';
    const course = await this.prisma.course.findFirst({
      where: privileged ? { id } : { id, status: 'PUBLISHED' },
      include: {
        instructor: { include: { user: { select: { firstName: true, lastName: true, avatar: true, bio: true } } } },
        sections: { include: { lessons: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        reviews: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } }, take: 10 },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(dto: CreateCourseDto, userId: string) {
    // Find or auto-create an InstructorProfile.
    // Admins bypass the approval flow — their profile is created on demand.
    let instructor = await this.prisma.instructorProfile.findFirst({
      where: { userId },
    });
    if (!instructor) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, firstName: true, lastName: true } });
      if (user?.role === 'ADMIN') {
        instructor = await this.prisma.instructorProfile.create({
          data: { userId, title: 'Administrator', expertise: [], isVerified: true },
        });
      } else {
        throw new NotFoundException('Instructor profile not found. Your instructor application must be approved before you can create courses.');
      }
    }
    return this.prisma.course.create({
      data: {
        title: dto.title,
        titleFr: dto.titleFr,
        description: dto.description,
        descriptionFr: dto.descriptionFr,
        price: dto.price ?? 0,
        isFree: dto.isFree ?? false,
        level: dto.level as CourseLevel,
        category: dto.category,
        language: (dto.language as Language) ?? 'EN',
        thumbnail: dto.thumbnail,
        instructorId: instructor.id,
        requirements: dto.requirements ?? [],
        outcomes: dto.outcomes ?? [],
        tags: dto.tags ?? [],
        targetAudience: dto.targetAudience ?? [],
        materialsIncluded: dto.materialsIncluded ?? [],
        status: (dto.status as any) ?? 'DRAFT',
        salePrice: dto.salePrice,
      },
    });
  }

  async update(id: string, dto: Partial<CreateCourseDto>, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { instructor: { select: { userId: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructor.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('You can only update your own courses');
    }
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.titleFr !== undefined) data.titleFr = dto.titleFr;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.descriptionFr !== undefined) data.descriptionFr = dto.descriptionFr;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.salePrice !== undefined) data.salePrice = dto.salePrice;
    if (dto.isFree !== undefined) data.isFree = dto.isFree;
    if (dto.level !== undefined) data.level = dto.level as CourseLevel;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.language !== undefined) data.language = dto.language as Language;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail;
    if (dto.previewVideo !== undefined) data.previewVideo = dto.previewVideo;
    if (dto.requirements !== undefined) data.requirements = dto.requirements;
    if (dto.outcomes !== undefined) data.outcomes = dto.outcomes;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.totalDuration !== undefined) data.totalDuration = dto.totalDuration;
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async getCourseReviews(courseId: string) {
    return this.prisma.review.findMany({
      where: { courseId },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async addReview(userId: string, courseId: string, dto: AddReviewDto) {
    const review = await this.prisma.review.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
    });
    const agg = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.course.update({
      where: { id: courseId },
      data: { avgRating: agg._avg.rating || 0, reviewCount: agg._count },
    });

    // Notify instructor of new review
    const courseWithInstructor = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: { include: { user: { select: { id: true, email: true, firstName: true } } } } },
    });
    const reviewer = await this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
    if (courseWithInstructor && reviewer && courseWithInstructor.instructor.userId !== userId) {
      const reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
      this.notifications.create(courseWithInstructor.instructor.userId, {
        title: 'New Course Review',
        body: `${reviewerName} rated ${courseWithInstructor.title} ${dto.rating}/5 stars.`,
        type: 'course_review',
        data: { courseId, rating: dto.rating },
      }).catch(() => null);
      this.email.sendNewCourseReviewToInstructor(
        courseWithInstructor.instructor.user.email,
        courseWithInstructor.instructor.user.firstName,
        courseWithInstructor.title,
        dto.rating,
        reviewerName,
      ).catch(() => null);
    }

    return review;
  }
}
