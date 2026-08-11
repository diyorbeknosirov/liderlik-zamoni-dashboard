/**
 * lib/telegramBot/telegram.js
 * -----------------------------
 * Telegram Bot API bilan ishlash uchun yordamchi funksiyalar (sendMessage,
 * answerCallbackQuery, editMessageText) va CTA/inline klaviaturalar.
 *
 * TELEGRAM_BOT_TOKEN Vercel Environment Variables'da saqlanadi
 * (webhook route shu yerdan foydalanadi; bot_settings jadvalidagi token esa
 * faqat Postgres pg_cron funksiyalari - process_due_teasers va
 * process_due_channel_posts - uchun ishlatiladi).
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ----------------------------------------------------------------------------
// Asosiy Telegram API chaqiruvlari
// ----------------------------------------------------------------------------
export async function sendMessage(chatId, text, replyMarkup) {
  return fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
}

export async function editMessageText(chatId, messageId, text, replyMarkup) {
  return fetch(`${TELEGRAM_API}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
}

export async function answerCallbackQuery(callbackQueryId, text, options) {
  return fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: options?.show_alert || false,
    }),
  });
}

// ----------------------------------------------------------------------------
// Klaviaturalar
// ----------------------------------------------------------------------------
export function phoneShareKeyboard() {
  return {
    keyboard: [[{ text: "📱 Telefon raqamni yuborish", request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export function removeKeyboard() {
  return { remove_keyboard: true };
}

export function ctaKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🎓 Yakshanbadagi Demo-darsga yozilish", callback_data: "cta:demo" }],
      [{ text: "🧑‍💼 Mentor bilan konsultatsiya", callback_data: "cta:consult" }],
      [{ text: "📖 Kurs haqida batafsil", callback_data: "cta:details" }],
    ],
  };
}

export function demoConfirmKeyboard(dateStr) {
  return {
    inline_keyboard: [
      [{ text: "✅ Ha, yozilaman", callback_data: `demo_confirm:${dateStr}` }],
      [{ text: "❌ Bekor qilish", callback_data: "demo_cancel" }],
    ],
  };
}

export function consultationSlotsKeyboard(slots) {
  return {
    inline_keyboard: [
      ...slots.map((slot) => [{ text: `🕒 ${slot}`, callback_data: `slot:${slot}` }]),
      [{ text: "⬅️ Orqaga", callback_data: "cta:back" }],
    ],
  };
}

// ----------------------------------------------------------------------------
// Yordamchi: navbatdagi Yakshanba (yoki istalgan hafta kuni) sanasini topish
// ----------------------------------------------------------------------------
export function nextWeekday(targetWeekday) {
  const today = new Date();
  const daysAhead = (targetWeekday - today.getDay() + 7) % 7 || 7;
  const result = new Date(today);
  result.setDate(today.getDate() + daysAhead);
  return result;
}

export function formatDateUz(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// ----------------------------------------------------------------------------
// Qiziqish / bosqich / operator voronkasi uchun klaviaturalar va label'lar
// ----------------------------------------------------------------------------
export const INTEREST_LABELS = {
  mentor: "🧑‍💼 Mentor haqida",
  kurs: "📚 Kurs haqida",
  umumiy: "ℹ️ Umumiy ma'lumot",
  barchasi: "📦 Barchasi haqida",
};

export const STAGE_LABELS = {
  noldan: "🌱 0'dan biznes ochish niyatidaman",
  mavjud: "📈 Mavjud biznesimni rivojlantirmoqchiman",
};

export function interestKeyboard() {
  return {
    inline_keyboard: Object.entries(INTEREST_LABELS).map(([key, label]) => [
      { text: label, callback_data: `interest:${key}` },
    ]),
  };
}

export function stageKeyboard() {
  return {
    inline_keyboard: Object.entries(STAGE_LABELS).map(([key, label]) => [
      { text: label, callback_data: `stage:${key}` },
    ]),
  };
}

export function resourceChannelsKeyboard(channels) {
  return {
    inline_keyboard: [
      ...channels.map((c) => [{ text: `🔗 ${c.title}`, url: c.url }]),
      [{ text: "📞 Batafsil ma'lumot olish", callback_data: "want_details" }],
    ],
  };
}

export function confirmStageKeyboard() {
  return {
    inline_keyboard: Object.entries(STAGE_LABELS).map(([key, label]) => [
      { text: label, callback_data: `details_stage:${key}` },
    ]),
  };
}

export function claimKeyboard(leadId) {
  return {
    inline_keyboard: [[{ text: "✅ Men olaman", callback_data: `claim:${leadId}` }]],
  };
}

export function demoConfirmDayKeyboard(leadId) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Ha, kelaman", callback_data: `demo_day:${leadId}:yes` },
        { text: "❌ Kela olmayman", callback_data: `demo_day:${leadId}:no` },
      ],
    ],
  };
}

export function demoConfirmHourKeyboard(leadId) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Kelyapman", callback_data: `demo_hour:${leadId}:yes` },
        { text: "⏳ Kechikaman", callback_data: `demo_hour:${leadId}:no` },
      ],
    ],
  };
}

export function ratingKeyboard(leadId) {
  const row1 = [1, 2, 3, 4, 5].map((n) => ({
    text: String(n),
    callback_data: `rating:${leadId}:${n}`,
  }));
  const row2 = [6, 7, 8, 9, 10].map((n) => ({
    text: String(n),
    callback_data: `rating:${leadId}:${n}`,
  }));
  return { inline_keyboard: [row1, row2] };
}

export function formatDateTimeUz(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export function generateConsultationSlots(count = 4) {
  const slots = [];
  const times = ["11:00", "14:00", "17:00"];
  let dayOffset = 1;

  while (slots.length < count && dayOffset < 10) {
    const day = new Date();
    day.setDate(day.getDate() + dayOffset);
    const weekday = day.getDay();

    if (weekday !== 0 && weekday !== 6) {
      const dd = String(day.getDate()).padStart(2, "0");
      const mm = String(day.getMonth() + 1).padStart(2, "0");
      for (const t of times) {
        if (slots.length < count) slots.push(`${dd}.${mm} ${t}`);
      }
    }
    dayOffset++;
  }
  return slots;
}

// ----------------------------------------------------------------------------
// Doimiy pastki tugmalar menyusi (ReplyKeyboard) - har doim ko'rinib turadi
// ----------------------------------------------------------------------------
export const MAIN_MENU_BUTTONS = {
  address: "\ud83d\udccd Demo manzili",
  mentor: "\ud83e\uddd1\u200d\ud83d\udcbc Mentor haqida",
  kurs: "\ud83d\udcda Kurs haqida",
  contact: "\ud83d\udcde Operator bilan bog'lanish",
};

export function mainReplyKeyboard() {
  return {
    keyboard: [
      [{ text: MAIN_MENU_BUTTONS.address }],
      [{ text: MAIN_MENU_BUTTONS.mentor }],
      [{ text: MAIN_MENU_BUTTONS.kurs }],
      [{ text: MAIN_MENU_BUTTONS.contact }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

// ----------------------------------------------------------------------------
// Asosiy menyu (bot buyruqlar tugmasi orqali ochiladi: /menu)
// ----------------------------------------------------------------------------
export function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📍 Demo manzili", callback_data: "menu_address" }],
      [{ text: "🧑‍💼 Mentor haqida", callback_data: "menu_mentor" }],
      [{ text: "📚 Kurs haqida", callback_data: "menu_kurs" }],
      [{ text: "📞 Operator bilan bog'lanish", callback_data: "want_details" }],
    ],
  };
}
