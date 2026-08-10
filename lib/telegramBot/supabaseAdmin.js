/**
 * lib/telegramBot/supabaseAdmin.js
 * ------------------------------------
 * Service-role Supabase client. FAQAT server tomonida (API routes) ishlatiladi -
 * hech qachon client komponentga import qilmang, chunki bu kalit RLS'ni
 * chetlab o'tadi (barcha jadvallarga to'liq kirish huquqi bor).
 *
 * Kerakli env o'zgaruvchilar (.env.local / Vercel Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   <-- Supabase Dashboard -> Settings -> API
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY .env'da topilmadi."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
