require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

console.log('SUPABASE_URL:', url ? url.substring(0, 50) : 'MISSING');
console.log('SUPABASE_SERVICE_KEY:', key ? 'present (' + key.length + ' chars)' : 'MISSING');

if (!url || !key) {
  console.error('Missing credentials. Check .env file.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data: existing, error: getErr } = await supabase.storage.getBucket('media');
  console.log('getBucket media:', existing ? 'exists' : 'not found', getErr ? '| err: ' + getErr.message : '');

  if (existing) {
    const { error: upErr } = await supabase.storage.updateBucket('media', { public: true, fileSizeLimit: 104857600 });
    console.log('updateBucket:', upErr ? 'err: ' + upErr.message : 'OK - set public=true');
  } else {
    const { data, error } = await supabase.storage.createBucket('media', {
      public: true,
      fileSizeLimit: 104857600,
    });
    console.log('createBucket:', error ? 'err: ' + error.message : 'OK - created: ' + JSON.stringify(data));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
