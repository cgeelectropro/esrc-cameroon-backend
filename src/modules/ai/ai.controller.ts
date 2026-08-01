import { Controller, Get, Post, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
// AI routes accept flexible JSON bodies — bypass the global forbidNonWhitelisted pipe
@UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
export class AiController {
  constructor(private aiService: AiService) {}

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI assistant' })
  chat(
    @Body() body: Record<string, unknown>,
    @CurrentUser('id') userId: string,
  ) {
    // Accept both { messages: [...] } and legacy { message, history } shapes
    let messages: { role: string; content: string }[] = [];
    if (Array.isArray(body['messages']) && (body['messages'] as unknown[]).length > 0) {
      messages = body['messages'] as { role: string; content: string }[];
    } else if (typeof body['message'] === 'string') {
      const history = Array.isArray(body['history'])
        ? (body['history'] as { role: string; content: string }[])
        : [];
      messages = [...history, { role: 'user', content: body['message'] }];
    }
    return this.aiService.chat(userId || 'anonymous', messages);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get course recommendations' })
  getRecommendations(@CurrentUser('id') userId: string) {
    return this.aiService.getRecommendations(userId);
  }

  @Post('validate-idea')
  @ApiOperation({ summary: 'Validate business idea' })
  validateIdea(@Body() body: Record<string, unknown>, @CurrentUser('id') userId: string) {
    return this.aiService.validateBusinessIdea(userId, String(body['idea'] ?? ''));
  }

  @Post('generate-quiz')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Generate quiz from content' })
  generateQuiz(@Body() body: Record<string, unknown>) {
    return this.aiService.generateQuiz(
      String(body['lessonContent'] ?? ''),
      Number(body['numQuestions'] ?? 5),
    );
  }
}
