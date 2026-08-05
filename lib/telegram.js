// SERVER-ONLY yordamchi. Telegram bot tokeni maxfiy bo'lgani uchun
// bu faylni hech qachon client komponentda import qilmang.
export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN yoki TELEGRAM_GROUP_CHAT_ID sozlanmagan.");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram xatosi: ${data.description || "noma'lum"}`);
  }
  return data;
}
