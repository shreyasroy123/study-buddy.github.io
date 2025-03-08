import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmrqhhotemslrmmeizsi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcnFoaG90ZW1zbHJtbWVpenNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0Mjk0ODAsImV4cCI6MjA1NzAwNTQ4MH0.dbs4lSN9XTPL_n5UfOy8gCZKkKr5SpMGAhcu5bkPYDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);