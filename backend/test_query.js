const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const id = 'cde448a1-a7ad-4271-a791-d86b75cf5511';
  const { data, error } = await supabase
    .from('support_bounties')
    .select('*, mentee:mentee_id (name, section), mentor:mentor_id (name, section)')
    .or(`mentor_id.eq.${id},mentee_id.eq.${id}`)
    .order('created_at', { ascending: false });
    
  console.log('Error:', error);
  console.log('Data:', data);
}

main();
