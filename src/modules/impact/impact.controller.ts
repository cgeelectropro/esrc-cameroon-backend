import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ImpactService } from './impact.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('impact')
@Controller('impact')
export class ImpactController {
  constructor(private impactService: ImpactService) {}

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Get platform impact stats' })
  getStats() {
    return this.impactService.getStats();
  }
}
