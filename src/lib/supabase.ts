import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const placeholderUrl = 'https://placeholder.supabase.co';
const placeholderKey = 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || placeholderUrl,
  supabaseAnonKey || placeholderKey
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
