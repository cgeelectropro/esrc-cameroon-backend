import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('sections')
@Controller('sections')
@Roles('INSTRUCTOR', 'ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SectionsController {
  constructor(private sectionsService: SectionsService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update section' })
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto, @CurrentUser('id') userId: string) {
    return this.sectionsService.updateSection(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete section' })
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.sectionsService.deleteSection(id, userId);
  }

  @Post(':id/lessons')
  @ApiOperation({ summary: 'Create lesson in section' })
  createLesson(
    @Param('id') sectionId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.sectionsService.createLesson(sectionId, dto, userId);
  }
}
