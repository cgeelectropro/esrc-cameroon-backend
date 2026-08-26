import { IsString } from 'class-validator';

export class UpsertPlatformInfoDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}
