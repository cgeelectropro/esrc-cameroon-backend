import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { SectionsController } from './sections.controller';
import { LessonsController } from './lessons.controller';
import { CoursesService } from './courses.service';
import { EnrollmentsService } from './enrollments.service';
import { SectionsService } from './sections.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CoursesController, SectionsController, LessonsController],
  providers: [CoursesService, EnrollmentsService, SectionsService],
  exports: [CoursesService, EnrollmentsService, SectionsService],
})
export class CoursesModule {}
