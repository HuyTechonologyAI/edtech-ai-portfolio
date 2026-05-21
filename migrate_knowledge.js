const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bdeluacbzbdflxubhpha.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZWx1YWNiemJkZmx4dWJocGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODEwMzUyNywiZXhwIjoyMDkzNjc5NTI3fQ.VVgu_yee1g-1KzA_3CoEzYluKFSzW5X7MSw5vruZm18'
);

async function verifyTable() {
  console.log('Checking knowledge_chunks table...');
  
  const { data, error } = await supabase
    .from('knowledge_chunks')
    .select('id')
    .limit(0);

  if (error) {
    console.log('Table status: NOT FOUND (' + error.message + ')');
    return false;
  }
  
  console.log('✅ Table exists!');

  // Test RPC
  const testEmb = Array(768).fill(0);
  const { error: rpcErr } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding: JSON.stringify(testEmb),
    match_threshold: 0.0,
    match_count: 1
  });

  if (rpcErr) {
    console.log('RPC status: ' + rpcErr.message);
  } else {
    console.log('✅ RPC works!');
  }

  return true;
}

verifyTable().catch(console.error);
