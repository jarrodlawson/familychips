import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client (for client components / real-time)
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server client (for server components / API routes)
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  return createClient(supabaseUrl, serviceKey ?? supabaseAnonKey);
}
