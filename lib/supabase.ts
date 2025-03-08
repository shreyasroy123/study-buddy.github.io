import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Avoid throwing an error in production as it could break the app
  // Instead, handle gracefully
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);