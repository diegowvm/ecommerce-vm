// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ikwttetqfltpxpkbqgpj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3R0ZXRxZmx0cHhwa2JxZ3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTM5MDgsImV4cCI6MjA2NzcyOTkwOH0.Q4Z8BGLMgZCAAa7eB4VLfvgZXRivpmxsfdFCah1jb-0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});