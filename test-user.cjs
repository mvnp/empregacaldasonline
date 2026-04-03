require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error } = await supabase.from('users').select('*');
  console.log('Users in DB:');
  console.log(users);
  
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  console.log('Auth users:');
  console.log(authUsers.users.map(u => ({ email: u.email, id: u.id, confirmed: u.email_confirmed_at })));
}
check();
