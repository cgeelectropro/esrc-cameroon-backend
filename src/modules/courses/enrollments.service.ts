import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private email: EmailService,
  ) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUniqueOrThrow({ where: { id: courseId } });
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    if (course.isFree || course.price === 0) {
      const enrollment = await this.prisma.enrollment.create({
        data: { userId, courseId },
        include: { course: true },
      });
      await this.prisma.course.update({
        where: { id: courseId },
        data: { studentCount: { increment: 1 } },
      });
      await this.notificationsService.create(userId, {
        title: 'Enrollment Confirmed!',
        body: `You are now enrolled in ${course.title}`,
        type: 'course_update',
      });
      // Send enrollment confirmation email
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
      if (user) {
        this.email.sendEnrollmentConfirmation(user.email, user.firstName, course.title, courseId).catch(() => null);
      }
      return enrollment;
    }

    return { requiresPayment: true, courseId, amount: course.price, currency: course.currency };
  }

  async getProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: { include: { sections: { include: { lessons: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } } },
        completions: true,
      },
    });
    const totalLessons = enrollment.course.sections.flatMap((s) => s.lessons).length;
    const completed = enrollment.completions.length;
    const progress = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
    return { progress, completed, total: totalLessons, enrollment };
  }

  async completeLesson(userId: string, courseId: string, lessonId: string) {
    const enrollment = await this.prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId } },
      include: { course: { include: { sections: { include: { lessons: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } } } },
    });
    await this.prisma.lessonCompletion.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
      create: { enrollmentId: enrollment.id, lessonId },
      update: {},
    });
    const totalLessons = enrollment.course.sections.flatMap((s) => s.lessons).length;
    const completed = await this.prisma.lessonCompletion.count({
      where: { enrollmentId: enrollment.id },
    });
    const progress = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPct: progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });
    if (progress === 100) {
      await this.prisma.certificate.create({
        data: {
          userId,
          courseId,
          courseName: enrollment.course.title,
        },
      });
      await this.notificationsService.create(userId, {
        title: 'Certificate Issued!',
        body: `Your certificate for ${enrollment.course.title} is ready.`,
        type: 'certificate',
      });
      // Send certificate email
      const cert = await this.prisma.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } });
      const certUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
      if (certUser && cert) {
        this.email.sendCertificateIssued(certUser.email, certUser.firstName, enrollment.course.title, cert.verificationCode).catch(() => null);
      }
    }
    return { progress, completed, total: totalLessons };
  }

  async getLessonDetail(userId: string, courseId: string, lessonId: string) {
    // Verify enrollment
    await this.prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId, courseId } },
    });
    const lesson = await this.prisma.lesson.findUniqueOrThrow({
      where: { id: lessonId },
      include: { section: { select: { courseId: true } } },
    });
    if (lesson.section.courseId !== courseId) {
      throw new Error('Lesson does not belong to this course');
    }
    return lesson;
  }
}
