export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV === 'production' ? '' : 'change-me-in-production'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      (process.env.NODE_ENV === 'production' ? '' : 'change-me-refresh'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  aws: {
    region: process.env.AWS_REGION || 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'esrc-cameroon-media',
  },

  mtn: {
    apiKey: process.env.MTN_MOMO_API_KEY,
    apiSecret: process.env.MTN_MOMO_API_SECRET,
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
    environment: process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
    webhookSecret: process.env.MTN_MOMO_WEBHOOK_SECRET,
  },

  orange: {
    webhookSecret: process.env.ORANGE_WEBHOOK_SECRET,
  },

  paymentSandbox: process.env.PAYMENT_SANDBOX === '1',

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  flutterwave: {
    publicKey: process.env.FLW_PUBLIC_KEY,
    secretKey: process.env.FLW_SECRET_KEY,
    encryptionKey: process.env.FLW_ENCRYPTION_KEY,
    webhookHash: process.env.FLW_WEBHOOK_HASH,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },

  email: {
    // Resend (HTTP API — not subject to the outbound SMTP port blocking that
    // broke raw SMTP delivery on Render's free tier). Falls back to SMTP if
    // no Resend key is set, for local/self-hosted setups.
    resendApiKey: process.env.RESEND_API_KEY,
    host: process.env.SMTP_HOST || (process.env.SUPABASE_URL ? 'smtp.supabase.io' : undefined),
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    user: process.env.SMTP_USER || process.env.SUPABASE_SMTP_USER,
    pass: process.env.SMTP_PASS || process.env.SUPABASE_SMTP_PASS,
    from: process.env.SMTP_FROM || 'NextGen Platform <noreply@nextgen-en.com>',
  },

  meilisearch: {
    url: process.env.MEILISEARCH_URL || 'http://localhost:7700',
    masterKey: process.env.MEILISEARCH_MASTER_KEY,
  },
});
