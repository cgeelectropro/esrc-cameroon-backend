import { Module } from '@nestjs/common';
import { AdvisoryController } from './advisory.controller';
import { MentorsController } from './mentors.controller';
import { AdvisoryService } from './advisory.service';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AdvisoryController, MentorsController],
  providers: [AdvisoryService],
  exports: [AdvisoryService],
})
export class AdvisoryModule {}
