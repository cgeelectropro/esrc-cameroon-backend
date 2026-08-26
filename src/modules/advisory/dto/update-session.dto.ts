import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '@prisma/client';

export class UpdateSessionDto {
  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
