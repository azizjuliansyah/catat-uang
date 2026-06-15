const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: userData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    process.exit(1);
  }

  const targetUser = userData.users.find(u => u.email === 'user@catatuang.id');
  if (!targetUser) {
    console.error('Target user not found');
    process.exit(1);
  }

  const { data, error } = await supabase.auth.admin.updateUserById(targetUser.id, {
    password: 'password123'
  });

  if (error) {
    console.error('Error updating password:', error);
  } else {
    console.log('Successfully updated password for user@catatuang.id to: password123');
  }
}

run();
