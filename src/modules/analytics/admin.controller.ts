import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { EmailService } from '@/modules/email/email.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private adminService: AdminService,
    private email: EmailService,
  ) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Platform analytics' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // ─── Users ──────────────────────────────────────────────────────────────────
  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(@Query() query: Record<string, string>) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get single user' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user role/status' })
  updateUser(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateUser(id, body);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Hard delete user' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/bulk-delete')
  @ApiOperation({ summary: 'Bulk delete users' })
  bulkDeleteUsers(@Body() body: { ids: string[] }) {
    return this.adminService.bulkDeleteUsers(body.ids);
  }

  // ─── Categories ─────────────────────────────────────────────────────────────
  @Get('categories')
  @ApiOperation({ summary: 'List all course categories' })
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create course category' })
  createCategory(@Body() body: Record<string, unknown>) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update course category' })
  updateCategory(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete course category' })
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // ─── Courses ────────────────────────────────────────────────────────────────
  @Get('courses')
  @ApiOperation({ summary: 'List all courses' })
  getCourses(@Query() query: Record<string, string>) {
    return this.adminService.getCourses(query);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get single course' })
  getCourse(@Param('id') id: string) {
    return this.adminService.getCourse(id);
  }

  @Patch('courses/:id')
  @ApiOperation({ summary: 'Update course' })
  updateCourse(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateCourse(id, body);
  }

  @Delete('courses/:id')
  @ApiOperation({ summary: 'Permanently delete course' })
  deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  // ─── Events ─────────────────────────────────────────────────────────────────
  @Get('events')
  @ApiOperation({ summary: 'List all events' })
  getEvents(@Query() query: Record<string, string>) {
    return this.adminService.getEvents(query);
  }

  @Post('events')
  @ApiOperation({ summary: 'Create event' })
  createEvent(@Body() body: Record<string, unknown>) {
    return this.adminService.createEvent(body);
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update event' })
  updateEvent(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateEvent(id, body);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete event' })
  deleteEvent(@Param('id') id: string) {
    return this.adminService.deleteEvent(id);
  }

  // ─── Publications ──────────────────────────────────────────────────────────
  @Get('publications')
  @ApiOperation({ summary: 'List all publications' })
  getPublications(@Query() query: Record<string, string>) {
    return this.adminService.getPublications(query);
  }

  @Patch('publications/:id')
  @ApiOperation({ summary: 'Approve/reject/edit publication' })
  updatePublication(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updatePublication(id, body);
  }

  @Delete('publications/:id')
  @ApiOperation({ summary: 'Delete publication' })
  deletePublication(@Param('id') id: string) {
    return this.adminService.deletePublication(id);
  }

  // ─── Opportunities ─────────────────────────────────────────────────────────
  @Get('opportunities')
  @ApiOperation({ summary: 'List all opportunities' })
  getOpportunities(@Query() query: Record<string, string>) {
    return this.adminService.getOpportunities(query);
  }

  @Post('opportunities')
  @ApiOperation({ summary: 'Create opportunity' })
  createOpportunity(@Body() body: Record<string, unknown>) {
    return this.adminService.createOpportunity(body);
  }

  @Patch('opportunities/:id')
  @ApiOperation({ summary: 'Update opportunity' })
  updateOpportunity(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateOpportunity(id, body);
  }

  @Delete('opportunities/:id')
  @ApiOperation({ summary: 'Delete opportunity' })
  deleteOpportunity(@Param('id') id: string) {
    return this.adminService.deleteOpportunity(id);
  }

  // ─── Testimonials ──────────────────────────────────────────────────────────
  @Get('testimonials')
  @ApiOperation({ summary: 'List all testimonials' })
  getTestimonials() {
    return this.adminService.getTestimonials();
  }

  @Post('testimonials')
  @ApiOperation({ summary: 'Create testimonial' })
  createTestimonial(@Body() body: Record<string, unknown>) {
    return this.adminService.createTestimonial(body);
  }

  @Patch('testimonials/:id')
  @ApiOperation({ summary: 'Update testimonial' })
  updateTestimonial(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateTestimonial(id, body);
  }

  @Delete('testimonials/:id')
  @ApiOperation({ summary: 'Delete testimonial' })
  deleteTestimonial(@Param('id') id: string) {
    return this.adminService.deleteTestimonial(id);
  }

  // ─── Moderation ────────────────────────────────────────────────────────────
  @Get('moderation')
  @ApiOperation({ summary: 'Get moderation queue' })
  getModeration() {
    return this.adminService.getModeration();
  }

  @Post('moderation/approve')
  @ApiOperation({ summary: 'Approve a content item' })
  approveItem(@Body() body: { type: string; id: string }) {
    return this.adminService.approveItem(body.type, body.id);
  }

  @Post('moderation/reject')
  @ApiOperation({ summary: 'Reject a content item' })
  rejectItem(@Body() body: { type: string; id: string; reason?: string }) {
    return this.adminService.rejectItem(body.type, body.id);
  }

  // ─── Metrics ───────────────────────────────────────────────────────────────
  @Get('metrics')
  @ApiOperation({ summary: 'Get impact metrics' })
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Patch('metrics/:id')
  @ApiOperation({ summary: 'Update impact metric' })
  updateMetric(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateMetric(id, body);
  }

  // ─── Blog ──────────────────────────────────────────────────────────────────
  @Get('blog')
  @ApiOperation({ summary: 'List all blog posts' })
  getBlogPosts(@Query() query: Record<string, string>) {
    return this.adminService.getBlogPosts(query);
  }

  @Post('blog')
  @ApiOperation({ summary: 'Create blog post' })
  createBlogPost(@Body() body: Record<string, unknown>) {
    return this.adminService.createBlogPost(body);
  }

  @Patch('blog/:id')
  @ApiOperation({ summary: 'Update blog post' })
  updateBlogPost(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.updateBlogPost(id, body);
  }

  @Delete('blog/:id')
  @ApiOperation({ summary: 'Delete blog post' })
  deleteBlogPost(@Param('id') id: string) {
    return this.adminService.deleteBlogPost(id);
  }

  // ─── Email ─────────────────────────────────────────────────────────────────
  @Get('email/status')
  @ApiOperation({ summary: 'Check if SMTP email is configured' })
  emailStatus() {
    return { configured: this.email.isConfigured() };
  }

  @Post('email/test')
  @ApiOperation({ summary: 'Send a test email to verify SMTP configuration' })
  testEmail(@Body() body: { to?: string }) {
    return this.email.sendTestEmail(body.to ?? 'goodnessemma05@gmail.com');
  }

  @Get('email/broadcast/preview')
  @ApiOperation({ summary: 'Preview how many users a broadcast will reach' })
  async broadcastPreview(@Query('role') role?: string) {
    const count = await this.adminService.getBroadcastTargetCount(role);
    return { success: true, data: { count, role: role || 'all' } };
  }

  @Post('email/broadcast')
  @ApiOperation({ summary: 'Send broadcast email to all (or filtered) active users' })
  async broadcastEmail(@Body() body: { subject: string; message: string; role?: string }) {
    if (!body.subject?.trim() || !body.message?.trim()) {
      return { success: false, error: 'subject and message are required' };
    }
    const targets = await this.adminService.getBroadcastTargets(body.role);
    if (targets.length === 0) {
      return { success: false, error: 'No active users found for the selected filter' };
    }

    let sent = 0;
    let failed = 0;
    for (const user of targets) {
      try {
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4f6f9;">
            <div style="background:#1B5E20;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:20px;">NextGen Platform</h1>
            </div>
            <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;">
              <p style="color:#333;font-size:15px;">Hi ${user.firstName},</p>
              <div style="color:#444;font-size:15px;line-height:1.6;white-space:pre-wrap;">${body.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
              <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
              <p style="color:#999;font-size:12px;">You received this message from the NextGen Platform team.</p>
            </div>
          </div>
        `;
        await this.email.send({ to: user.email, subject: body.subject, html });
        sent++;
      } catch {
        failed++;
      }
    }
    return { success: true, data: { sent, failed, total: targets.length } };
  }
}
