import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Course ID to enroll in' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Payment method',
    enum: ['mtn_momo', 'orange_money', 'stripe', 'paypal', 'flutterwave'],
  })
  @IsString()
  @IsIn(['mtn_momo', 'orange_money', 'stripe', 'paypal', 'flutterwave'])
  method: string;

  @ApiPropertyOptional({ description: 'Amount (defaults to course price)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency', enum: ['XAF', 'USD', 'EUR'] })
  @IsOptional()
  @IsIn(['XAF', 'USD', 'EUR'])
  currency?: string;

  @ApiPropertyOptional({ description: 'Phone number for mobile money' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
