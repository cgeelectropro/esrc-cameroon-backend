import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminController } from './admin.controller';
import { AnalyticsService } from './analytics.service';
import { AdminService } from './admin.service';

@Module({
  controllers: [AnalyticsController, AdminUsersController, AdminController],
  providers: [AnalyticsService, AdminService],
  exports: [AnalyticsService, AdminService],
})
export class AnalyticsModule {}
