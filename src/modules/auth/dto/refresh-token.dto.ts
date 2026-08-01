import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefreshTokenDto {
  @ApiProperty({ description: 'Refresh token from login response' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
