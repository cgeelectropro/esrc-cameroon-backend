import { IsString, IsOptional, IsArray, IsUrl, MinLength } from 'class-validator';

export class SubmitInstructorRequestDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsArray()
  expertise?: string[];

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  motivation?: string;
}
