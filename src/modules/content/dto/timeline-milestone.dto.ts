import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateTimelineMilestoneDto {
  @IsInt()
  year: number;

  @IsString()
  event: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateTimelineMilestoneDto {
  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
