import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('users')
  @ApiOperation({ summary: 'List admin users' })
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.analyticsService.getUsers(query);
  }

  @Get('moderation')
  @ApiOperation({ summary: 'Get moderation queue' })
  getModeration() {
    return this.analyticsService.getModeration();
  }
}
