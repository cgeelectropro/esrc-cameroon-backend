import { IsString } from 'class-validator';

export class ReplyDto {
  @IsString()
  content: string;
}
