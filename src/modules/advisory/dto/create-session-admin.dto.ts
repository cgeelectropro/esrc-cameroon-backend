import { IsString, IsEnum, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionType } from '@prisma/client';

export class CreateSessionAdminDto {
  @ApiProperty()
  @IsString()
  userId: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
