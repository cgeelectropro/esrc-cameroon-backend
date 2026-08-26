import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateRegionalImpactDto {
  @IsString()
  regionId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  learners?: number;

  @IsOptional()
  @IsInt()
  posX?: number;

  @IsOptional()
  @IsInt()
  posY?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateRegionalImpactDto {
  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  learners?: number;

  @IsOptional()
  @IsInt()
  posX?: number;

  @IsOptional()
  @IsInt()
  posY?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
