import { createClient } from '@supabase/supabase-js';

// Replace with your project's URL and anon key
const supabaseUrl = 'https://cndxpzkjyktpzmrtsoop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZHhwemtqeWt0cHptcnRzb29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Njk2MDAsImV4cCI6MjA3ODU0NTYwMH0.NI9YaOWJ9w73kWzhXMgSC5cqwxufHi-Mfnwjj4sfcTU';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required.");
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
