import { Controller, Post, Get, Body, Headers, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RawBody } from '@/common/decorators/raw-body.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initiate')
  @Throttle({ payment: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  initiatePayment(@Body() dto: InitiatePaymentDto, @CurrentUser('id') userId: string) {
    return this.paymentsService.initiate(userId, dto);
  }

  @Public()
  @Throttle({ payment: { limit: 20, ttl: 60000 } })
  @Post('webhook/mtn')
  handleMtnWebhook(@Body() body: unknown, @Headers() headers: Record<string, string>) {
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    return this.paymentsService.handleMtnWebhook(rawBody, headers);
  }

  @Public()
  @Throttle({ payment: { limit: 20, ttl: 60000 } })
  @Post('webhook/orange')
  handleOrangeWebhook(@Body() body: unknown, @Headers() headers: Record<string, string>) {
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    return this.paymentsService.handleOrangeWebhook(rawBody, headers);
  }

  @Public()
  @Throttle({ payment: { limit: 20, ttl: 60000 } })
  @Post('webhook/stripe')
  handleStripeWebhook(@RawBody() rawBody: string, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleStripeWebhook(rawBody, sig);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getHistory(@CurrentUser('id') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }

  @Post('flutterwave/initiate')
  @Throttle({ payment: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Flutterwave Standard checkout — returns hosted payment URL' })
  initiateFlutterwave(@Body() dto: InitiatePaymentDto, @CurrentUser('id') userId: string) {
    return this.paymentsService.initiateFlutterwave(userId, dto);
  }

  @Public()
  @Throttle({ payment: { limit: 20, ttl: 60000 } })
  @Post('webhook/flutterwave')
  @ApiOperation({ summary: 'Flutterwave webhook (verif-hash verification)' })
  handleFlutterwaveWebhook(@Body() body: Record<string, any>, @Headers() headers: Record<string, string>) {
    return this.paymentsService.handleFlutterwaveWebhook(body, headers);
  }

  @Get('flutterwave/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Flutterwave payment after redirect callback' })
  verifyFlutterwave(
    @Query('tx_ref') txRef: string,
    @Query('transaction_id') transactionId: string,
    @CurrentUser('id') _userId: string,
  ) {
    return this.paymentsService.verifyFlutterwaveCallback(txRef, transactionId);
  }
}
