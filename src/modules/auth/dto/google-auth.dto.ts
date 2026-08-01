import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token from @react-oauth/google GoogleLogin component' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
