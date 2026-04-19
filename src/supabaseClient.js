import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Prevent crashing if environment variables are missing (e.g. on Vercel before setup)
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
