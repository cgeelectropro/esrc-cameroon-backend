import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  findAll() {
    return this.blogService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get blog post by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }
}
