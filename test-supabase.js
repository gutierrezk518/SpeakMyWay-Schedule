// Simple test to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf8');
const envVars = {};

envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('Key:', supabaseAnonKey ? '✓ Found' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test basic connection
async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️ Auth error (this is expected for fresh setup):', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Session status:', data.session ? 'Active session' : 'No active session');
    }
    
    // Test if we can reach Supabase
    const { data: healthData, error: healthError } = await supabase.rpc('version');
    if (!healthError) {
      console.log('✅ Supabase RPC call successful!');
    }
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();