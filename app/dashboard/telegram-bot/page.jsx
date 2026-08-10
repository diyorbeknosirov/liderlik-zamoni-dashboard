/**
 * app/dashboard/telegram-bot/page.jsx
 * ----------------------------------------
 * Liderlik Zamoni dashboard'iga qo'shiladigan yangi sahifa:
 *   - Telegram orqali kelgan lidlar ro'yxati (status, qiziqish, bosqich, operator bilan)
 *   - Kanalga post rejalashtirish formasi
 */

import { supabaseAdmin } from "@/lib/telegramBot/supabaseAdmin";
import SchedulePostForm from "./SchedulePostForm";

export const dynamic = "force-dynamic";

async function getLeads() {
  const { data, error } = await supabaseAdmin
    .from("telegram_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Lidlarni olishda xatolik:", error);
    return [];
  }
  return data;
}

async function getScheduledPosts() {
  const { data } = await supabaseAdmin
    .from("channel_posts")
    .select("*")
    .eq("published", false)
    .order("publish_at", { ascending: true });
  return data || [];
}

const STATUS_COLORS = {
  "Yangi Lid": "bg-slate-700 text-slate-200",
  "Operatorga yuborildi": "bg-blue-500/20 text-blue-400 border border-blue-500/40",
  "Operator bilan aloqada": "bg-purple-500/20 text-purple-400 border border-purple-500/40",
  "Demoga yozildi": "bg-amber-500/20 text-amber-400 border border-amber-500/40",
  "Demo o'tdi": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
};

const INTEREST_LABELS = {
  mentor: "Mentor",
  kurs: "Kurs",
  umumiy: "Umumiy",
  barchasi: "Barchasi",
};

const STAGE_LABELS = {
  noldan: "0'dan boshlash",
  mavjud: "Rivojlantirish",
};

export default async function TelegramBotPage() {
  const [leads, scheduledPosts] = await Promise.all([getLeads(), getScheduledPosts()]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-amber-400">Telegram Sotuv Boti</h1>
        <p className="text-slate-400 text-sm mt-1">
          Lidlar, voronka va kanal postlarini shu yerdan boshqaring.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Jami lidlar" value={leads.length} />
        <StatCard
          label="Operatorga yuborilgan"
          value={leads.filter((l) => l.assigned_operator_id).length}
        />
        <StatCard
          label="Demoga yozilganlar"
          value={leads.filter((l) => l.demo_datetime).length}
        />
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">
          📝 Kanalga yangi post rejalashtirish
        </h2>
        <SchedulePostForm />
      </section>

      {scheduledPosts.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">
            🕒 Navbatdagi postlar
          </h2>
          <div className="space-y-3">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between bg-slate-800/60 rounded-lg p-3"
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm text-slate-200 line-clamp-2">{post.post_text}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(post.publish_at).toLocaleString("uz-UZ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">👥 Lidlar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="py-2 pr-4">Ism-Familiya</th>
                <th className="py-2 pr-4">Telefon</th>
                <th className="py-2 pr-4">Qiziqishi</th>
                <th className="py-2 pr-4">Bosqichi</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Operator</th>
                <th className="py-2 pr-4">Demo vaqti</th>
                <th className="py-2 pr-4">Bahosi</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-800/60">
                  <td className="py-2 pr-4">{lead.full_name}</td>
                  <td className="py-2 pr-4 text-slate-400">{lead.phone}</td>
                  <td className="py-2 pr-4 text-slate-400">
                    {INTEREST_LABELS[lead.interest_type] || "-"}
                  </td>
                  <td className="py-2 pr-4 text-slate-400">
                    {STAGE_LABELS[lead.business_stage] || "-"}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        STATUS_COLORS[lead.status] || "bg-slate-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-400">
                    {lead.assigned_operator_name || "-"}
                  </td>
                  <td className="py-2 pr-4 text-slate-400">
                    {lead.demo_datetime
                      ? new Date(lead.demo_datetime).toLocaleString("uz-UZ")
                      : "-"}
                  </td>
                  <td className="py-2 pr-4 text-slate-400">
                    {lead.demo_rating ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-3xl font-bold text-amber-400 mt-1">{value}</p>
    </div>
  );
}
