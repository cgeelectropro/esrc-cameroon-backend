import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  DATABASE_URL: Joi.string().default('postgresql://esrc_user:esrc_password@localhost:5432/esrc_db'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  JWT_SECRET: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().min(32).required(),
      otherwise: Joi.string().min(16).default('dev-jwt-secret-change-in-production-min-32-chars'),
    }),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().min(32).required(),
      otherwise: Joi.string().min(16).default('dev-refresh-secret-change-in-production'),
    }),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  PAYMENT_SANDBOX: Joi.string().trim().valid('0', '1').optional(),
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().when('STRIPE_SECRET_KEY', {
    is: Joi.string().min(1).required(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  MTN_MOMO_WEBHOOK_SECRET: Joi.string().optional(),
  ORANGE_WEBHOOK_SECRET: Joi.string().optional(),

  AWS_REGION: Joi.string().optional(),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_S3_BUCKET: Joi.string().optional(),
  SUPABASE_URL: Joi.string().uri().optional(),
  SUPABASE_SERVICE_KEY: Joi.string().optional(),
  SUPABASE_SMTP_USER: Joi.string().optional(),
  SUPABASE_SMTP_PASS: Joi.string().optional(),
  OPENAI_API_KEY: Joi.string().optional(),
  HUGGINGFACE_API_KEY: Joi.string().optional(),
  ANTHROPIC_API_KEY: Joi.string().optional(),
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM: Joi.string().optional(),
  FLW_PUBLIC_KEY: Joi.string().optional(),
  FLW_SECRET_KEY: Joi.string().optional(),
  FLW_ENCRYPTION_KEY: Joi.string().optional(),
  FLW_WEBHOOK_HASH: Joi.string().optional(),
});
