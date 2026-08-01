import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
  ) {
    const items = await this.notifications.findByUser(user.id, limit ? parseInt(limit) : 20);
    const unreadCount = items.filter((n) => !n.isRead).length;
    return { success: true, data: items, unreadCount };
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.notifications.markAsRead(user.id, id);
    return { success: true };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: { id: string }) {
    await this.notifications.markAllAsRead(user.id);
    return { success: true };
  }
}
