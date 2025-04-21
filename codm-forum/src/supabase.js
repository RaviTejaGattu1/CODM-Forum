import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://ybjcjyofjooqxmdazbng.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliamNqeW9mam9vcXhtZGF6Ym5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMTY4MTgsImV4cCI6MjA2MDc5MjgxOH0.Z8QBuvEgOeBXiaokb16cXVC-IEXoWl17ah8ZCKclkVM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);