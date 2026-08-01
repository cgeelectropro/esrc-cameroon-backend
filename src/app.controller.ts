import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  liveness() {
    return { status: 'ok', service: 'esrc-api', timestamp: new Date().toISOString() };
  }
}
