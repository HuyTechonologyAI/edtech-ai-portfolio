const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bdeluacbzbdflxubhpha.supabase.co',
  'sb_publishable_2nBo7eIeJtB3pVL1v239Ag_TJIMHNgq'
);

async function checkSchema() {
  console.log('=== Checking VIDEOS table ===');
  
  // Try to insert a test row and see what error we get
  const { data: vInsert, error: vInsertErr } = await supabase
    .from('videos')
    .insert([{ title: '__schema_test__' }])
    .select();
  console.log('Videos insert test:', JSON.stringify(vInsertErr, null, 2));
  
  // Try select to see column names
  const { data: vData, error: vErr } = await supabase
    .from('videos')
    .select('*')
    .limit(1);
  console.log('Videos select error:', JSON.stringify(vErr, null, 2));
  console.log('Videos data:', JSON.stringify(vData, null, 2));
  
  // Try to get columns info via a deliberately wrong column
  const testCols = ['youtube_url', 'youtubeUrl', 'url', 'video_url', 'link',
                     'is_featured', 'isFeatured', 'featured',
                     'duration', 'title', 'description', 'created_at'];
  
  for (const col of testCols) {
    const { data, error } = await supabase
      .from('videos')
      .select(col)
      .limit(0);
    const status = error ? `ERROR: ${error.message}` : 'OK';
    console.log(`  Column "${col}": ${status}`);
  }

  console.log('\n=== Checking RESOURCES table ===');
  
  const { data: rInsert, error: rInsertErr } = await supabase
    .from('resources')
    .insert([{ title: '__schema_test__' }])
    .select();
  console.log('Resources insert test:', JSON.stringify(rInsertErr, null, 2));
  
  const { data: rData, error: rErr } = await supabase
    .from('resources')
    .select('*')
    .limit(1);
  console.log('Resources select error:', JSON.stringify(rErr, null, 2));
  console.log('Resources data:', JSON.stringify(rData, null, 2));
  
  const rCols = ['link', 'url', 'download_url', 'file_url',
                  'type', 'file_type', 'is_premium', 'isPremium', 'premium',
                  'title', 'description', 'created_at'];
  
  for (const col of rCols) {
    const { data, error } = await supabase
      .from('resources')
      .select(col)
      .limit(0);
    const status = error ? `ERROR: ${error.message}` : 'OK';
    console.log(`  Column "${col}": ${status}`);
  }

  // Cleanup test rows
  await supabase.from('videos').delete().eq('title', '__schema_test__');
  await supabase.from('resources').delete().eq('title', '__schema_test__');
}

checkSchema().catch(console.error);
