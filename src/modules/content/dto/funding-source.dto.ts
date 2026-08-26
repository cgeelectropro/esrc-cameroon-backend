import { IsString, IsInt, IsOptional, IsArray, Min } from 'class-validator';

export class CreateFundingSourceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibility?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateFundingSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibility?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
