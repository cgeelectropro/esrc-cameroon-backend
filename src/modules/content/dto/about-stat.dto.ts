import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateAboutStatDto {
  @IsString()
  number: string;

  @IsString()
  labelEn: string;

  @IsString()
  labelFr: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateAboutStatDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  labelEn?: string;

  @IsOptional()
  @IsString()
  labelFr?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
