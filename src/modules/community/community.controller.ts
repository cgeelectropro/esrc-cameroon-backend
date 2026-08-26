import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { ReplyDto } from './dto/reply.dto';
import { AdminUpdatePostDto } from './dto/admin-update-post.dto';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Public()
  @Get('forum')
  getForumPosts(@Query() query: any) {
    return this.communityService.getForumPosts(query);
  }

  @Public()
  @Get('forum/:id')
  getForumPost(@Param('id') id: string) {
    return this.communityService.getForumPost(id);
  }

  @Post('forum')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createPost(@Body() dto: CreatePostDto, @CurrentUser('id') userId: string) {
    return this.communityService.createPost(userId, dto);
  }

  @Post('forum/:id/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reply(@Param('id') postId: string, @Body() dto: ReplyDto, @CurrentUser('id') userId: string) {
    return this.communityService.reply(postId, userId, dto.content);
  }

  @Get('admin/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all forum posts' })
  adminGetForumPosts(@Query() query: any) {
    return this.communityService.adminGetForumPosts(query);
  }

  @Patch('admin/posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: pin/unpin or update forum post' })
  adminUpdateForumPost(@Param('id') id: string, @Body() dto: AdminUpdatePostDto) {
    return this.communityService.adminUpdateForumPost(id, dto);
  }

  @Delete('admin/posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete forum post and its replies' })
  adminDeleteForumPost(@Param('id') id: string) {
    return this.communityService.adminDeleteForumPost(id);
  }

  @Delete('admin/replies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: delete a forum reply' })
  adminDeleteForumReply(@Param('id') id: string) {
    return this.communityService.adminDeleteForumReply(id);
  }
}
