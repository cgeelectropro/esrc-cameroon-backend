import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Global search' })
  search(@Query('q') q: string, @Query('type') type?: 'courses' | 'publications' | 'events') {
    return this.searchService.search(q || '', type);
  }
}
