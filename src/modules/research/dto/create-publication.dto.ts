import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsUrl,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleFr?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  abstract: string;

  @ApiProperty({ type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  authors: string[];

  @ApiProperty({
    enum: ['POLICY_BRIEF', 'WORKING_PAPER', 'JOURNAL_ARTICLE', 'REPORT', 'DATASET'],
  })
  @IsEnum(['POLICY_BRIEF', 'WORKING_PAPER', 'JOURNAL_ARTICLE', 'REPORT', 'DATASET'])
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doi?: string;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [Number], default: [] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(17, { each: true })
  sdgGoals?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
