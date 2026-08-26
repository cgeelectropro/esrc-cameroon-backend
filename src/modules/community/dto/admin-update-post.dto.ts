import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AdminUpdatePostDto {
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsString()
  category?: string;
}
