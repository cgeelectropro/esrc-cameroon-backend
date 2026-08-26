import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdvisoryService } from './advisory.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('advisory')
@Controller('mentors')
export class MentorsController {
  constructor(private advisoryService: AdvisoryService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get()
  @ApiOperation({ summary: 'List mentors (advisors)' })
  getMentors() {
    return this.advisoryService.getAdvisors();
  }
}
