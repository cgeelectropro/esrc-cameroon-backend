import { Controller, Get, Post, Param, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll(@Query() query: any) {
    return this.eventsService.findAll(query);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  register(@Param('id') eventId: string, @CurrentUser('id') userId: string) {
    return this.eventsService.register(userId, eventId);
  }
}
