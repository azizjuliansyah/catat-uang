const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars:', { supabaseUrl, supabaseKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      type,
      description,
      transaction_date,
      wallets (name, icon, color),
      paylater_platforms (name, color),
      categories (name, icon, color)
    `)
    .limit(1);

  if (txError) {
    console.error('Error fetching transactions:', txError);
  } else {
    console.log('Returned transaction data structure:');
    console.log(JSON.stringify(txData, null, 2));
  }

  const { data: paylaterData, error: paylaterError } = await supabase
    .from('paylater_payments')
    .select(`
      id,
      amount,
      payment_date,
      created_at,
      wallets (id, name)
    `)
    .limit(1);

  if (paylaterError) {
    console.error('Error fetching paylater_payments:', paylaterError);
  } else {
    console.log('Returned paylater_payments data structure:');
    console.log(JSON.stringify(paylaterData, null, 2));
  }
}

run();

