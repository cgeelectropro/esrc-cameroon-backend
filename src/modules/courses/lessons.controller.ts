import {
  Controller,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('lessons')
@Controller('lessons')
@Roles('INSTRUCTOR', 'ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(private sectionsService: SectionsService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update lesson' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto, @CurrentUser('id') userId: string) {
    return this.sectionsService.updateLesson(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lesson' })
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.sectionsService.deleteLesson(id, userId);
  }
}
