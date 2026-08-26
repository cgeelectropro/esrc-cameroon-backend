import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResearchService } from './research.service';
import { ResearchFilterDto } from './dto/research-filter.dto';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private researchService: ResearchService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get('publications')
  getPublications(@Query() query: ResearchFilterDto) {
    return this.researchService.findAll(query);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get('publications/:id')
  getPublication(@Param('id') id: string) {
    return this.researchService.findOne(id);
  }

  @Post('publications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FELLOW', 'ADMIN')
  @ApiBearerAuth()
  createPublication(@Body() dto: CreatePublicationDto) {
    return this.researchService.create(dto);
  }

  @Patch('publications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  updatePublication(@Param('id') id: string, @Body() dto: Partial<CreatePublicationDto>) {
    return this.researchService.update(id, dto);
  }

  @Public()
  @Post('publications/:id/download')
  download(@Param('id') id: string) {
    return this.researchService.incrementDownload(id);
  }
}
