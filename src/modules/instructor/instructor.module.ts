import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorApprovalController } from './instructor-approval.controller';
import { InstructorApprovalService } from './instructor-approval.service';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [InstructorController, InstructorApprovalController],
  providers: [InstructorService, InstructorApprovalService],
  exports: [InstructorService, InstructorApprovalService],
})
export class InstructorModule {}
