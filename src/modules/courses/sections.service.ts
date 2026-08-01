import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  private async assertCourseOwnership(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: { select: { userId: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructor.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('You can only edit your own courses');
    }
    return course;
  }

  async createSection(courseId: string, dto: CreateSectionDto, userId: string) {
    await this.assertCourseOwnership(courseId, userId);
    const maxOrder = await this.prisma.section
      .aggregate({ where: { courseId }, _max: { order: true } })
      .then((r) => (r._max.order ?? -1) + 1);
    return this.prisma.section.create({
      data: { courseId, title: dto.title, order: dto.order ?? maxOrder },
    });
  }

  async updateSection(sectionId: string, dto: UpdateSectionDto, userId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: { include: { instructor: { select: { userId: true } } } } },
    });
    if (!section) throw new NotFoundException('Section not found');
    if (section.course.instructor.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('You can only edit your own courses');
    }
    return this.prisma.section.update({
      where: { id: sectionId },
      data: dto,
    });
  }

  async deleteSection(sectionId: string, userId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: { include: { instructor: { select: { userId: true } } } } },
    });
    if (!section) throw new NotFoundException('Section not found');
    if (section.course.instructor.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('You can only edit your own courses');
    }
    return this.prisma.section.delete({ where: { id: sectionId } });
  }

  async createLesson(sectionId: string, dto: CreateLessonDto, userId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: { include: { instructor: { select: { userId: true } } } } },
    });
    if (!section) throw new NotFoundException('Section not found');
    if (section.course.instructor.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('You can only edit your own courses');
    }
    const maxOrder = await this.prisma.lesson
      .aggregate({ where: { sectionId }, _max: { order: true } })
      .then((r) => (r._max.order ?? -1) + 1);
    return this.prisma.lesson.create({
      data: {
        sectionId,
        title: dto.title,
        type: dto.type,
        videoUrl: dto.videoUrl,
        pdfUrl: dto.pdfUrl,
        duration: dto.duration,
        order: dto.order ?? maxOrder,
        isPreview: dto.isPreview ?? false,
        ...(dto.content !== undefined && { content: dto.content as object }),
      },
    });
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: { include: { instructor: { select: { userId: true } } } } } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.section.course.instructor.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('You can only edit your own courses');
    }
    const { content, ...rest } = dto;
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...rest,
        ...(content !== undefined && { content: content as object }),
      },
    });
  }

  async deleteLesson(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: { include: { instructor: { select: { userId: true } } } } } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.section.course.instructor.userId !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('You can only edit your own courses');
    }
    return this.prisma.lesson.delete({ where: { id: lessonId } });
  }
}
