import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import validationSchema from './config/validation.schema';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ResearchModule } from './modules/research/research.module';
import { EventsModule } from './modules/events/events.module';
import { AdvisoryModule } from './modules/advisory/advisory.module';
import { CommunityModule } from './modules/community/community.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AiModule } from './modules/ai/ai.module';
import { StorageModule } from './modules/storage/storage.module';
import { SearchModule } from './modules/search/search.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ImpactModule } from './modules/impact/impact.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContentModule } from './modules/content/content.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    // In-memory response cache for public, read-heavy, non-personalized GET
    // endpoints (course listings, content pages, events, advisors). No Redis
    // is provisioned in production, so this uses the default in-memory store
    // — fine for a single-instance deployment. Only applied per-route via
    // @UseInterceptors(CacheInterceptor) on @Public() endpoints; never on
    // authenticated/personalized routes, since the cache key doesn't vary
    // per user.
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60s
      max: 500, // cap entries to bound memory use
    }),
    // Rate limiting: tiered by endpoint sensitivity
    // auth: 10 requests per minute (protect against brute-force)
    // payment: 20 requests per minute (prevent abuse)
    // default: 100 requests per minute (general API rate limit)
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 10,
      },
      {
        name: 'payment',
        ttl: 60000, // 1 minute
        limit: 20,
      },
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    PaymentsModule,
    ResearchModule,
    EventsModule,
    AdvisoryModule,
    CommunityModule,
    OpportunitiesModule,
    NotificationsModule,
    AiModule,
    StorageModule,
    SearchModule,
    CertificatesModule,
    AnalyticsModule,
    ImpactModule,
    InstructorModule,
    BlogModule,
    ContentModule,
    HealthModule,
    EmailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
