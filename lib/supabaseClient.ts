import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente de navegador: usa la anon key (segura de exponer, protegida por RLS).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
