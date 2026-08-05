import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

function fmt(n) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n || 0));
}

export async function POST(request) {
  try {
    const { operatorName, team, tariff, amount, clientName } = await request.json();

    const lines = [
      "🎉 <b>Yangi sotuv amalga oshdi!</b>",
      "",
      `👤 Sotuvchi: <b>${operatorName || "—"}</b>`,
      `🏆 Jamoa: ${team || "—"}`,
    ];
    if (tariff) lines.push(`📦 Tarif: ${tariff}`);
    if (clientName) lines.push(`🙍 Mijoz: ${clientName}`);
    lines.push(`💰 Summa: <b>${fmt(amount)} so'm</b>`);

    await sendTelegramMessage(lines.join("\n"));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram notify-sale error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Noma'lum xatolik" }, { status: 500 });
  }
}
