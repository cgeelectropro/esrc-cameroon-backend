import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstructorApprovalService } from './instructor-approval.service';
import { SubmitInstructorRequestDto } from './dto/submit-instructor-request.dto';
import { ReviewInstructorRequestDto } from './dto/review-instructor-request.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('instructor-approval')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('instructor-approval')
export class InstructorApprovalController {
  constructor(private approvalService: InstructorApprovalService) {}

  /** POST /instructor-approval/submit — instructor submits request after registration */
  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit instructor approval request' })
  submitRequest(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitInstructorRequestDto,
  ) {
    return this.approvalService.submitRequest(userId, dto);
  }

  /** GET /instructor-approval/status — check own request status */
  @Get('status')
  @ApiOperation({ summary: 'Get own instructor request status' })
  getMyStatus(@CurrentUser('id') userId: string) {
    return this.approvalService.getMyRequestStatus(userId);
  }

  /** GET /instructor-approval/admin/list — admin: list all requests */
  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: list instructor requests' })
  listRequests(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.approvalService.listRequests(
      status,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /** GET /instructor-approval/admin/pending-count — badge count for sidebar */
  @Get('admin/pending-count')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: count pending requests' })
  async getPendingCount() {
    const count = await this.approvalService.countPending();
    return { count };
  }

  /** GET /instructor-approval/admin/:id — admin: get single request */
  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: get instructor request detail' })
  getRequest(@Param('id') id: string) {
    return this.approvalService.getRequest(id);
  }

  /** PATCH /instructor-approval/admin/:id/review — admin: approve or reject */
  @Patch('admin/:id/review')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: approve or reject instructor request' })
  reviewRequest(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ReviewInstructorRequestDto,
  ) {
    return this.approvalService.reviewRequest(id, adminId, dto);
  }
}
