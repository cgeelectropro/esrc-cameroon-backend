import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  async getDashboard() {
    const [
      totalUsers, totalCourses, totalEvents, totalPublications,
      totalOpportunities, totalEnrollments, pendingPublications,
      pendingOpportunities, recentUsers, recentEnrollments, revenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count({ where: { status: { not: 'TRASH' as any } } }),
      this.prisma.event.count(),
      this.prisma.publication.count(),
      this.prisma.opportunity.count(),
      this.prisma.enrollment.count(),
      this.prisma.publication.count({ where: { isApproved: false } }),
      this.prisma.opportunity.count({ where: { isApproved: false } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true, avatar: true },
      }),
      this.prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          course: { select: { title: true } },
        },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);
    return {
      stats: {
        totalUsers, totalCourses, totalEvents, totalPublications,
        totalOpportunities, totalEnrollments,
        totalRevenue: revenue._sum.amount || 0,
        pendingModeration: pendingPublications + pendingOpportunities,
      },
      recentUsers,
      recentEnrollments,
    };
  }

  async getAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      usersByRole, enrollmentsByMonth, coursesByCategory, topCourses,
    ] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.enrollment.findMany({
        where: { enrolledAt: { gte: thirtyDaysAgo } },
        select: { enrolledAt: true },
        orderBy: { enrolledAt: 'asc' },
      }),
      this.prisma.course.groupBy({ by: ['category'], _count: true, where: { status: 'PUBLISHED' as any } }),
      this.prisma.course.findMany({
        take: 5,
        orderBy: { studentCount: 'desc' },
        where: { status: 'PUBLISHED' as any },
        select: { id: true, title: true, studentCount: true, avgRating: true, category: true },
      }),
    ]);

    return { usersByRole, enrollmentsByMonth, coursesByCategory, topCourses };
  }

  // ─── Users ──────────────────────────────────────────────────────────────────
  async getUsers(query: Record<string, string>) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: Record<string, unknown> = {};
    if (query.role) where.role = query.role.toUpperCase();
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true, role: true,
          country: true, city: true, isActive: true, isEmailVerified: true,
          createdAt: true, lastLoginAt: true, avatar: true,
          _count: { select: { enrollments: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        country: true, city: true, isActive: true, isEmailVerified: true,
        createdAt: true, lastLoginAt: true, avatar: true, bio: true, phone: true,
        _count: { select: { enrollments: true, certificates: true } },
        enrollments: {
          take: 5,
          include: { course: { select: { title: true, thumbnail: true } } },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, data: Record<string, unknown>) {
    const allowed = ['role', 'isActive', 'firstName', 'lastName', 'country', 'city', 'bio', 'isEmailVerified'];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return this.prisma.user.update({ where: { id }, data: updateData });
  }

  async deleteUser(id: string) {
    // Hard delete: remove dependent records first, then delete user
    await this.prisma.lessonCompletion.deleteMany({ where: { enrollment: { userId: id } } });
    await this.prisma.enrollment.deleteMany({ where: { userId: id } });
    await this.prisma.certificate.deleteMany({ where: { userId: id } });
    await this.prisma.advisorySession.deleteMany({ where: { OR: [{ userId: id }, { advisorId: id }] } });
    await this.prisma.payment.deleteMany({ where: { userId: id } });
    await this.prisma.notification.deleteMany({ where: { userId: id } });
    await this.prisma.review.deleteMany({ where: { userId: id } });
    await this.prisma.forumPost.deleteMany({ where: { userId: id } });
    await this.prisma.forumReply.deleteMany({ where: { userId: id } });
    await this.prisma.instructorProfile.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }

  async bulkDeleteUsers(ids: string[]) {
    for (const id of ids) {
      await this.deleteUser(id);
    }
    return { message: `${ids.length} users deleted` };
  }

  // ─── Categories ─────────────────────────────────────────────────────────────
  async getCategories() {
    return this.prisma.courseCategory.findMany({ orderBy: { order: 'asc' } });
  }

  async createCategory(data: Record<string, unknown>) {
    return this.prisma.courseCategory.create({
      data: {
        slug: data.slug as string,
        nameEn: data.nameEn as string,
        nameFr: data.nameFr as string,
        order: (data.order as number) ?? 0,
        isActive: (data.isActive as boolean) ?? true,
      },
    });
  }

  async updateCategory(id: string, data: Record<string, unknown>) {
    const allowed = ['slug', 'nameEn', 'nameFr', 'order', 'isActive'];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return this.prisma.courseCategory.update({ where: { id }, data: updateData });
  }

  async deleteCategory(id: string) {
    await this.prisma.courseCategory.delete({ where: { id } });
    return { message: 'Category deleted' };
  }

  // ─── Courses ────────────────────────────────────────────────────────────────
  async getCourses(query: Record<string, string>) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
          },
          _count: { select: { enrollments: true, sections: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        sections: { include: { lessons: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true, reviews: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async updateCourse(id: string, data: Record<string, unknown>) {
    const allowed = [
      'title', 'titleFr', 'description', 'descriptionFr', 'price', 'salePrice', 'isFree',
      'level', 'category', 'language', 'thumbnail', 'previewVideo', 'status', 'isFeatured',
      'requirements', 'outcomes', 'tags', 'totalDuration',
    ];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return this.prisma.course.update({ where: { id }, data: updateData });
  }

  async deleteCourse(id: string) {
    // Delete dependent records that lack cascade rules before removing the course.
    // Order matters: lessonCompletions reference enrollments, so delete them first.
    await this.prisma.lessonCompletion.deleteMany({ where: { enrollment: { courseId: id } } });
    await this.prisma.enrollment.deleteMany({ where: { courseId: id } });
    await this.prisma.certificate.deleteMany({ where: { courseId: id } });
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course permanently deleted' };
  }

  // ─── Events ─────────────────────────────────────────────────────────────────
  async getEvents(query: Record<string, string>) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.type) where.type = query.type;

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: { _count: { select: { registrations: true } } },
      }),
      this.prisma.event.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createEvent(data: Record<string, unknown>) {
    return this.prisma.event.create({
      data: {
        title: data.title as string,
        titleFr: data.titleFr as string | undefined,
        description: data.description as string,
        type: (data.type as string).toUpperCase() as any,
        startDate: new Date(data.startDate as string),
        endDate: data.endDate ? new Date(data.endDate as string) : undefined,
        location: (data.location as string) ?? '',
        isOnline: (data.isOnline as boolean) ?? false,
        isFree: (data.isFree as boolean) ?? true,
        price: data.price ? parseFloat(data.price as string) : 0,
        currency: ((data.currency as string) ?? 'XAF') as any,
        capacity: data.capacity ? parseInt(data.capacity as string) : undefined,
        thumbnail: data.thumbnail as string | undefined,
      },
    });
  }

  async updateEvent(id: string, data: Record<string, unknown>) {
    const allowed = [
      'title', 'titleFr', 'description', 'type', 'location', 'isOnline',
      'isFree', 'price', 'capacity', 'image', 'isPublished',
    ];
    const updateData: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    if (data.startDate) updateData.startDate = new Date(data.startDate as string);
    if (data.endDate) updateData.endDate = new Date(data.endDate as string);
    if (data.registrationDeadline) updateData.registrationDeadline = new Date(data.registrationDeadline as string);
    return this.prisma.event.update({ where: { id }, data: updateData as any });
  }

  async deleteEvent(id: string) {
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted' };
  }

  // ─── Publications ──────────────────────────────────────────────────────────
  async getPublications(query: Record<string, string>) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { abstract: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isApproved !== undefined) where.isApproved = query.isApproved === 'true';
    if (query.type) where.type = query.type;

    const [items, total] = await Promise.all([
      this.prisma.publication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.publication.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async updatePublication(id: string, data: Record<string, unknown>) {
    const allowed = ['title', 'abstract', 'isApproved', 'type', 'authors', 'tags', 'pdfUrl'];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return this.prisma.publication.update({ where: { id }, data: updateData });
  }

  async deletePublication(id: string) {
    await this.prisma.publication.delete({ where: { id } });
    return { message: 'Publication deleted' };
  }

  // ─── Opportunities ─────────────────────────────────────────────────────────
  async getOpportunities(query: Record<string, string>) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isApproved !== undefined) where.isApproved = query.isApproved === 'true';
    if (query.type) where.type = query.type;

    const [items, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { applications: true } } },
      }),
      this.prisma.opportunity.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createOpportunity(data: Record<string, unknown>) {
    return this.prisma.opportunity.create({
      data: {
        title: data.title as string,
        description: data.description as string,
        type: (data.type as string).toUpperCase() as any,
        organization: data.organization as string,
        location: (data.location as string) ?? '',
        isRemote: (data.isRemote as boolean) ?? false,
        deadline: data.deadline ? new Date(data.deadline as string) : new Date(),
        tags: (data.tags as string[]) ?? [],
        isApproved: true,
        requirements: (data.requirements as string[]) ?? [],
        applicationUrl: (data.applicationUrl as string) ?? '',
      },
    });
  }

  async updateOpportunity(id: string, data: Record<string, unknown>) {
    const allowed = [
      'title', 'description', 'type', 'organization', 'location',
      'isRemote', 'tags', 'isApproved', 'requirements', 'benefits', 'applicationUrl',
    ];
    const updateData: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    if (data.deadline) updateData.deadline = new Date(data.deadline as string);
    return this.prisma.opportunity.update({ where: { id }, data: updateData as any });
  }

  async deleteOpportunity(id: string) {
    await this.prisma.opportunity.delete({ where: { id } });
    return { message: 'Opportunity deleted' };
  }

  // ─── Testimonials ──────────────────────────────────────────────────────────
  async getTestimonials() {
    return this.prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  }

  async createTestimonial(data: Record<string, unknown>) {
    return this.prisma.testimonial.create({
      data: {
        name: data.name as string,
        quote: data.quote as string,
        title: (data.title as string) ?? '',
        location: (data.location as string) ?? '',
        avatar: (data.avatar as string) ?? '',
        order: (data.order as number) ?? 0,
      },
    });
  }

  async updateTestimonial(id: string, data: Record<string, unknown>) {
    const allowed = ['name', 'quote', 'title', 'location', 'avatar', 'order'];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return this.prisma.testimonial.update({ where: { id }, data: updateData });
  }

  async deleteTestimonial(id: string) {
    await this.prisma.testimonial.delete({ where: { id } });
    return { message: 'Testimonial deleted' };
  }

  // ─── Moderation ────────────────────────────────────────────────────────────
  async getModeration() {
    const [publications, opportunities, forumPosts] = await Promise.all([
      this.prisma.publication.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.opportunity.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.forumPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);
    return {
      pendingPublications: publications,
      pendingOpportunities: opportunities,
      recentForumPosts: forumPosts,
      counts: {
        publications: publications.length,
        opportunities: opportunities.length,
        forumPosts: forumPosts.length,
      },
    };
  }

  async approveItem(type: string, id: string) {
    if (type === 'publication') {
      return this.prisma.publication.update({ where: { id }, data: { isApproved: true } });
    }
    if (type === 'opportunity') {
      return this.prisma.opportunity.update({ where: { id }, data: { isApproved: true } });
    }
    throw new NotFoundException('Unknown content type');
  }

  async rejectItem(type: string, id: string) {
    if (type === 'publication') {
      await this.prisma.publication.delete({ where: { id } });
      return { message: 'Publication rejected and removed' };
    }
    if (type === 'opportunity') {
      await this.prisma.opportunity.delete({ where: { id } });
      return { message: 'Opportunity rejected and removed' };
    }
    throw new NotFoundException('Unknown content type');
  }

  // ─── Metrics ───────────────────────────────────────────────────────────────
  async getMetrics() {
    return this.prisma.impactMetric.findMany({ orderBy: { order: 'asc' } });
  }

  async updateMetric(id: string, data: Record<string, unknown>) {
    const allowed = ['label', 'value', 'icon', 'color', 'description'];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return this.prisma.impactMetric.update({ where: { id }, data: updateData });
  }

  // ─── Blog ──────────────────────────────────────────────────────────────────
  async getBlogPosts(query: Record<string, string>) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isPublished !== undefined) where.isPublished = query.isPublished === 'true';

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createBlogPost(data: Record<string, unknown>) {
    return this.prisma.blogPost.create({
      data: {
        title: data.title as string,
        content: data.content as string,
        excerpt: (data.excerpt as string) ?? '',
        slug: (data.slug as string) || (data.title as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        author: data.author as string,
        publishedAt: data.publishedAt ? new Date(data.publishedAt as string) : new Date(),
        isPublished: (data.isPublished as boolean) ?? false,
      },
    });
  }

  async updateBlogPost(id: string, data: Record<string, unknown>) {
    const allowed = [
      'title', 'titleFr', 'content', 'contentFr', 'excerpt',
      'coverImage', 'author', 'tags', 'isPublished',
    ];
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return this.prisma.blogPost.update({ where: { id }, data: updateData });
  }

  async deleteBlogPost(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Blog post deleted' };
  }

  async getBroadcastTargetCount(role?: string): Promise<number> {
    const where: Record<string, unknown> = { isActive: true };
    if (role) where.role = role;
    return this.prisma.user.count({ where });
  }

  async getBroadcastTargets(role?: string): Promise<Array<{ email: string; firstName: string }>> {
    const where: Record<string, unknown> = { isActive: true };
    if (role) where.role = role;
    return this.prisma.user.findMany({
      where,
      select: { email: true, firstName: true },
    });
  }
}
