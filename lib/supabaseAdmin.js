// SERVER-ONLY klient. Bu "service role" kaliti orqali ishlaydi va RLS
// (Row Level Security)ni chetlab o'tadi — shuning uchun hech qachon
// client komponentda yoki NEXT_PUBLIC_ o'zgaruvchida ishlatilmasin.
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY yoki NEXT_PUBLIC_SUPABASE_URL sozlanmagan.");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
