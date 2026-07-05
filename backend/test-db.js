const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const { data: students, error: err1 } = await supabase.from('students').select('*').limit(1);
  console.log('Students:', students, err1?.message);

  const { data: teachers, error: err2 } = await supabase.from('teachers').select('*').limit(1);
  console.log('Teachers:', teachers, err2?.message);
}

check();
