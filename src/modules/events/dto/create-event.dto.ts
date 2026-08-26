import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const EVENT_TYPES = ['WORKSHOP', 'WEBINAR', 'CONFERENCE', 'BOOTCAMP', 'NETWORKING', 'HACKATHON'];
const CURRENCIES = ['XAF', 'USD', 'EUR'];

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleFr?: string;

  @IsString()
  description: string;

  @IsIn(EVENT_TYPES)
  type: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsIn(CURRENCIES)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
