import { createClient } from "@supabase/supabase-js";

/* lazy init — only throws at runtime when actually called, not at build time */
export function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
  );
}
