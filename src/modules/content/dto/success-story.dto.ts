import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateSuccessStoryDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  story: string;

  @IsString()
  impact: string;

  @IsString()
  image: string;

  @IsString()
  quote: string;

  @IsInt()
  year: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateSuccessStoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  story?: string;

  @IsOptional()
  @IsString()
  impact?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  quote?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
