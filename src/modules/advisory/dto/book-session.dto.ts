import { IsString, IsEnum, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionType } from '@prisma/client';

export class BookSessionDto {
  @ApiProperty()
  @IsString()
  advisorId: string;

  @ApiProperty({ enum: SessionType })
  @IsEnum(SessionType)
  type: SessionType;

  @ApiProperty()
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ default: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;
}
