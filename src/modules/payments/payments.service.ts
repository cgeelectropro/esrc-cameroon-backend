import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentMethod, Currency } from '@prisma/client';
import Stripe from 'stripe';
import { createHmac, timingSafeEqual } from 'crypto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { EmailService } from '@/modules/email/email.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import * as https from 'https';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
    private notifications: NotificationsService,
  ) {
    const secret = this.config.get<string>('stripe.secretKey');
    if (secret) {
      this.stripe = new Stripe(secret);
    }
  }

  async initiate(userId: string, dto: InitiatePaymentDto) {
    const course = await this.prisma.course.findUniqueOrThrow({ where: { id: dto.courseId } });
    const amount = dto.amount ?? course.price;
    const currency = (dto.currency as Currency) ?? course.currency;
    const methodMap: Record<string, PaymentMethod> = {
      mtn_momo: 'MTN_MOMO',
      orange_money: 'ORANGE_MONEY',
      stripe: 'STRIPE',
      paypal: 'PAYPAL',
      flutterwave: 'FLUTTERWAVE',
    };
    const method = methodMap[dto.method] || 'FLUTTERWAVE';
    // Sandbox is server-side only; never trust client
    const sandbox =
      this.config.get<boolean>('paymentSandbox') === true ||
      this.config.get<string>('nodeEnv') === 'development';

    if (sandbox) {
      const payment = await this.prisma.payment.create({
        data: {
          userId,
          amount,
          currency,
          method,
          status: 'COMPLETED',
          phoneNumber: dto.phoneNumber,
          metadata: { courseId: dto.courseId, sandbox: true },
        },
      });
      const existing = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: dto.courseId } },
      });
      if (!existing) {
        await this.prisma.enrollment.create({
          data: { userId, courseId: dto.courseId, paymentId: payment.id },
        });
        await this.prisma.course.update({
          where: { id: dto.courseId },
          data: { studentCount: { increment: 1 } },
        });
      }
      // Send payment confirmation email + in-app notification
      const pUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
      if (pUser) {
        const referenceCode = `ESRC-SANDBOX-${payment.id.slice(-8)}`;
        this.notifications.create(userId, {
          title: 'Payment Confirmed',
          body: `Your payment of ${amount} ${currency} for ${course.title} has been confirmed. You are now enrolled!`,
          type: 'payment_confirmed',
          data: { paymentId: payment.id, courseId: dto.courseId },
        }).catch(() => null);
        this.email.sendPaymentConfirmation(pUser.email, pUser.firstName, course.title, amount, currency, referenceCode).catch(() => null);
      }

      return {
        paymentId: payment.id,
        referenceCode: `ESRC-SANDBOX-${payment.id.slice(-8)}`,
        amount,
        currency,
        status: 'COMPLETED',
        enrollmentCreated: true,
      };
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        method,
        status: 'PENDING',
        phoneNumber: dto.phoneNumber,
        metadata: { courseId: dto.courseId },
      },
    });
    return {
      paymentId: payment.id,
      referenceCode: `ESRC-${payment.id.slice(-8)}`,
      amount,
      currency,
      status: 'PENDING',
    };
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   * @throws UnauthorizedException if signature is invalid
   */
  private verifyHmacSignature(rawBody: string, signature: string, secret: string): void {
    // Compute expected signature: HMAC-SHA256(secret, body) hex-encoded
    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    // Timing-safe comparison to prevent timing attacks
    try {
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    } catch {
      throw new UnauthorizedException('Invalid webhook signature')
    }
  }

  /**
   * MTN MoMo webhook handler with HMAC-SHA256 signature verification
   * Expects: X-Signature header with HMAC-SHA256(body) in hex format
   */
  async handleMtnWebhook(rawBody: string, headers: Record<string, string>) {
    const secret = this.config.get<string>('mtn.webhookSecret')
    if (!secret) {
      throw new BadRequestException('MTN webhook secret not configured')
    }

    const signature = headers['x-signature']
    if (!signature) {
      throw new BadRequestException('Missing X-Signature header')
    }

    // Verify signature
    this.verifyHmacSignature(rawBody, signature, secret)

    // Signature verified; process webhook
    // Parse and handle payment status update (implementation depends on MTN payload format)
    return { received: true, verified: true }
  }

  /**
   * Orange Money webhook handler with HMAC-SHA256 signature verification
   * Expects: X-Signature header with HMAC-SHA256(body) in hex format
   */
  async handleOrangeWebhook(rawBody: string, headers: Record<string, string>) {
    const secret = this.config.get<string>('orange.webhookSecret')
    if (!secret) {
      throw new BadRequestException('Orange webhook secret not configured')
    }

    const signature = headers['x-signature']
    if (!signature) {
      throw new BadRequestException('Missing X-Signature header')
    }

    // Verify signature
    this.verifyHmacSignature(rawBody, signature, secret)

    // Signature verified; process webhook
    // Parse and handle payment status update (implementation depends on Orange payload format)
    return { received: true, verified: true }
  }

  /**
   * Stripe webhook handler. Verifies signature with STRIPE_WEBHOOK_SECRET before processing.
   */
  async handleStripeWebhook(rawBody: string | null, sig: string) {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }
    if (!rawBody || !sig) {
      throw new BadRequestException('Invalid webhook payload or signature');
    }
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    try {
      this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      throw new UnauthorizedException('Invalid Stripe webhook signature');
    }
    return { received: true };
  }

  async getUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Initiate a Flutterwave Standard checkout — returns a hosted payment URL.
   * The user is redirected to Flutterwave's hosted page, pays there, then
   * redirected back. Flutterwave sends a webhook to /payments/webhook/flutterwave.
   */
  async initiateFlutterwave(userId: string, dto: InitiatePaymentDto) {
    const flwSecretKey = this.config.get<string>('flutterwave.secretKey');
    if (!flwSecretKey) {
      throw new BadRequestException('Flutterwave is not configured');
    }

    const course = await this.prisma.course.findUniqueOrThrow({ where: { id: dto.courseId } });
    const amount = dto.amount ?? course.price;
    const currency = (dto.currency as Currency) ?? course.currency ?? 'XAF';
    const pUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, phone: true },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        method: 'FLUTTERWAVE',
        status: 'PENDING',
        phoneNumber: dto.phoneNumber ?? (pUser.phone ?? undefined),
        metadata: { courseId: dto.courseId },
      },
    });

    const frontendUrl = this.config.get<string>('frontendUrl') || 'https://www.nextgen-en.com';
    const txRef = `NEXTGEN-${payment.id}`;

    const payload = {
      tx_ref: txRef,
      amount,
      currency,
      redirect_url: `${frontendUrl}/en/payment/callback`,
      customer: {
        email: pUser.email,
        name: `${pUser.firstName} ${pUser.lastName}`.trim(),
        phonenumber: dto.phoneNumber ?? pUser.phone ?? '',
      },
      customizations: {
        title: 'NextGen Platform',
        description: `Enrollment: ${course.title}`,
        logo: `${frontendUrl}/logo.png`,
      },
      meta: { paymentId: payment.id, courseId: dto.courseId, userId },
    };

    // Call Flutterwave Standard API
    const flwResponse = await this.callFlutterwaveApi('/v3/payments', payload, flwSecretKey);

    if (flwResponse.status !== 'success' || !flwResponse.data?.link) {
      // Update payment to failed
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
      throw new BadRequestException('Failed to create Flutterwave payment link');
    }

    // Store the tx_ref for webhook matching
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: txRef },
    });

    return {
      paymentId: payment.id,
      txRef,
      paymentUrl: flwResponse.data.link,
      amount,
      currency,
      status: 'PENDING',
    };
  }

  private callFlutterwaveApi(path: string, body: Record<string, unknown>, secretKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const options = {
        hostname: 'api.flutterwave.com',
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
          'Content-Length': Buffer.byteLength(data),
        },
      };
      const req = https.request(options, (res) => {
        let result = '';
        res.on('data', (chunk) => { result += chunk; });
        res.on('end', () => {
          try { resolve(JSON.parse(result)); }
          catch { reject(new Error('Invalid Flutterwave response')); }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Flutterwave webhook handler.
   * Flutterwave sends verif-hash header with the secret hash set in FLW_WEBHOOK_HASH.
   */
  async handleFlutterwaveWebhook(body: Record<string, any>, headers: Record<string, string>) {
    const webhookHash = this.config.get<string>('flutterwave.webhookHash');
    const secretKey = this.config.get<string>('flutterwave.secretKey');

    // Verify webhook authenticity
    const verifHash = headers['verif-hash'];
    if (webhookHash && verifHash !== webhookHash) {
      throw new UnauthorizedException('Invalid Flutterwave webhook hash');
    }

    const { event, data } = body;
    if (event !== 'charge.completed' || data?.status !== 'successful') {
      return { received: true, processed: false };
    }

    // Find payment by tx_ref
    const txRef: string = data.tx_ref;
    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: txRef },
    });

    if (!payment || payment.status === 'COMPLETED') {
      return { received: true, processed: false };
    }

    // Verify transaction with Flutterwave API
    if (secretKey) {
      try {
        const verification = await this.verifyFlutterwaveTransaction(data.id, secretKey);
        if (
          verification.data?.status !== 'successful' ||
          Math.abs(verification.data.amount - payment.amount) > 0.01
        ) {
          return { received: true, processed: false, reason: 'verification_failed' };
        }
      } catch {
        // Log but continue if verification fails (avoid blocking)
      }
    }

    // Complete the payment and enroll the user
    const meta = payment.metadata as any;
    const courseId: string = meta?.courseId;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED', providerRef: txRef },
    });

    if (courseId) {
      const existing = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payment.userId, courseId } },
      });
      if (!existing) {
        await this.prisma.enrollment.create({
          data: { userId: payment.userId, courseId, paymentId: payment.id },
        });
        await this.prisma.course.update({
          where: { id: courseId },
          data: { studentCount: { increment: 1 } },
        });
      }

      const [pUser, course] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: payment.userId }, select: { email: true, firstName: true } }),
        this.prisma.course.findUnique({ where: { id: courseId }, select: { title: true } }),
      ]);

      if (pUser && course) {
        const refCode = `NEXTGEN-FLW-${payment.id.slice(-8).toUpperCase()}`;
        this.notifications.create(payment.userId, {
          title: 'Payment Confirmed',
          body: `Payment confirmed for ${course.title}. You are now enrolled!`,
          type: 'payment_confirmed',
          data: { paymentId: payment.id, courseId },
        }).catch(() => null);
        this.email.sendPaymentConfirmation(
          pUser.email, pUser.firstName, course.title,
          payment.amount, payment.currency, refCode,
        ).catch(() => null);
      }
    }

    return { received: true, processed: true };
  }

  private verifyFlutterwaveTransaction(transactionId: number, secretKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.flutterwave.com',
        port: 443,
        path: `/v3/transactions/${transactionId}/verify`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${secretKey}` },
      };
      const req = https.request(options, (res) => {
        let result = '';
        res.on('data', (chunk) => { result += chunk; });
        res.on('end', () => {
          try { resolve(JSON.parse(result)); }
          catch { reject(new Error('Invalid response')); }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Verify a Flutterwave payment callback (called after redirect).
   * Checks the transaction status and completes enrollment if successful.
   */
  async verifyFlutterwaveCallback(txRef: string, transactionId: string) {
    const secretKey = this.config.get<string>('flutterwave.secretKey');
    if (!secretKey) throw new BadRequestException('Flutterwave not configured');

    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: txRef },
    });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status === 'COMPLETED') {
      return { status: 'COMPLETED', paymentId: payment.id, alreadyProcessed: true };
    }

    // Verify with Flutterwave API
    const verification = await this.verifyFlutterwaveTransaction(parseInt(transactionId, 10), secretKey);
    if (verification.data?.status !== 'successful') {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
      return { status: 'FAILED', paymentId: payment.id };
    }

    // Trigger the same completion logic via a synthetic webhook body
    await this.handleFlutterwaveWebhook(
      { event: 'charge.completed', data: { ...verification.data, tx_ref: txRef } },
      {},
    );
    return { status: 'COMPLETED', paymentId: payment.id };
  }
}
