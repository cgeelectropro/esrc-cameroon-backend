import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
// compression is CJS-only; default import fails at runtime
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bodyParser = require('body-parser');

/** Ensure admin users always have ADMIN role (idempotent safety fix) */
async function ensureAdminRoles() {
  const prisma = new PrismaClient();
  try {
    const adminEmails = ['goodnessemma05@gmail.com', 'mfondoumwilliam@gmail.com'];
    await prisma.user.updateMany({
      where: { email: { in: adminEmails } },
      data: { role: 'ADMIN' },
    });
  } catch {
    // Non-fatal — DB may not be ready yet on first boot
  } finally {
    await prisma.$disconnect();
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const rawBodyBuffer = (req: any, _res: any, buf: Buffer) => {
    if (req.headers['stripe-signature'] && buf?.length) {
      req.rawBody = buf.toString('utf8');
    }
  };
  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));

  app.use(helmet());
  app.use(compression());
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = frontendUrl.split(',').map((u) => u.trim());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((allowed) => origin === allowed || origin.endsWith('.vercel.app'))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new LoggingInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('ESRC Cameroon API')
    .setDescription('Backend API for the ESRC Cameroon Learning Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('courses', 'Course management')
    .addTag('payments', 'Payment processing')
    .addTag('research', 'Publications and research')
    .addTag('events', 'Events and registrations')
    .addTag('advisory', 'Advisory sessions')
    .addTag('community', 'Forums and networking')
    .addTag('opportunities', 'Jobs and fellowships')
    .addTag('ai', 'AI assistant and recommendations')
    .addTag('impact', 'Impact statistics')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await ensureAdminRoles();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`ESRC API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
