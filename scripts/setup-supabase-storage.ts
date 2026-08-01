/**
 * Run once to create the Supabase Storage "media" bucket.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx ts-node scripts/setup-supabase-storage.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log('Setting up Supabase Storage...');

  // Create "media" bucket (public so uploaded files are directly accessible)
  const { data, error } = await supabase.storage.createBucket('media', {
    public: true,
    fileSizeLimit: 104857600, // 100MB
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ Bucket "media" already exists');
    } else {
      console.error('✗ Failed to create bucket:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✓ Bucket "media" created successfully');
  }

  // List buckets to confirm
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('Available buckets:', buckets?.map(b => b.name).join(', '));
  console.log('\nSetup complete! Files will be publicly accessible at:');
  console.log(`${supabaseUrl}/storage/v1/object/public/media/<filename>`);
}

setup();
