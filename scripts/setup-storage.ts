import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Supabase URL:', supabaseUrl);

  // Check if bucket exists
  const { data: existing, error: getErr } = await supabase.storage.getBucket('media');

  if (getErr && !getErr.message.includes('not found') && !getErr.message.includes('does not exist')) {
    console.error('Error checking bucket:', getErr.message);
  }

  if (existing) {
    console.log('✓ Bucket "media" already exists:', existing.name, '| public:', existing.public);
    // Ensure it's public
    const { error: updateErr } = await supabase.storage.updateBucket('media', { public: true, fileSizeLimit: 104857600 });
    if (updateErr) console.log('Update note:', updateErr.message);
    else console.log('✓ Bucket updated to public: true');
  } else {
    console.log('Creating bucket "media"...');
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    });
    if (error) {
      console.error('✗ Failed to create bucket:', error.message);
      process.exit(1);
    }
    console.log('✓ Bucket "media" created:', data);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
