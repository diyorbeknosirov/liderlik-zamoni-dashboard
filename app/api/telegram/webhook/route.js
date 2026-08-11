/**
 * app/api/telegram/webhook/route.js
 * ------------------------------------
 * Telegram bot uchun YAGONA kirish nuqtasi.
 *
 * To'liq voronka:
 *   1. /start -> ism, telefon (registratsiya)
 *   2. Qiziqish tanlash: Mentor / Kurs / Umumiy / Barchasi
 *   3. Bosqich tanlash: 0'dan boshlash / Mavjudni rivojlantirish
 *   4. Shu segmentga mos kanallar ko'rsatiladi + "Batafsil ma'lumot" tugmasi
 *   5. "Batafsil ma'lumot" -> mavjud ism/telefon/bosqich ishlatiladi (qayta so'ralmaydi)
 *   6. Operatorlar guruhiga lid karta sifatida yuboriladi ("Men olaman" tugmasi)
 *   7. Operator lidni "oladi" -> shaxsiy xabar orqali to'liq ma'lumot oladi
 *      (agar dashboard hisobiga ulangan bo'lsa, haqiqiy ism-familiyasi ishlatiladi)
 *   8. Operator /mijozlarim orqali o'z lidlarini ko'radi, Demo sana/vaqt kiritadi
 *   9. Mijozga avtomatik: darhol tasdiq, 1 kun oldin so'rov, 1 soat oldin eslatma
 *  10. Demo boshlangandan 2 soat keyin - 1-10 baholash so'rovi
 *
 * Qo'shimcha: "/start link_XXXX" -> dashboard "Profil sozlamalari"dagi
 * "Telegramni ulash" tugmasidan kelgan deep-link, operatorning Telegram ID'sini
 * profiles jadvaliga yozadi.
 *
 * Bot menyusi: /menu, /manzil, /mentor, /kurs buyruqlari VA doimiy pastki
 * tugmalar (ReplyKeyboard) - ikkalasi ham bir xil kontentni ko'rsatadi.
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/telegramBot/supabaseAdmin";
import {
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  phoneShareKeyboard,
  removeKeyboard,
  interestKeyboard,
  stageKeyboard,
  confirmStageKeyboard,
  resourceChannelsKeyboard,
  claimKeyboard,
  demoConfirmDayKeyboard,
  demoConfirmHourKeyboard,
  ratingKeyboard,
  formatDateTimeUz,
  INTEREST_LABELS,
  STAGE_LABELS,
  mainMenuKeyboard,
  mainReplyKeyboard,
  MAIN_MENU_BUTTONS,
} from "@/lib/telegramBot/telegram";
import { MENTOR_INFO_TEXT, KURS_INFO_TEXT, ADDRESS_INFO_TEXT } from "@/lib/telegramBot/menuContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPERATORS_GROUP_ID = process.env.OPERATORS_GROUP_ID;
const RATING_DELAY_HOURS = 2;
const DEMO_LOCATION_URL = "https://yandex.uz/maps/-/CTGMjNJ7";

// ============================================================================
// ASOSIY HANDLER
// ============================================================================
export async function POST(req) {
  const update = await req.json();

  try {
    if (update.message?.contact) {
      await handleContact(update.message);
    } else if (update.message?.text?.startsWith("/start")) {
      await handleStart(update.message);
    } else if (update.message?.text === "/mijozlarim") {
      await handleMyLeadsCommand(update.message);
    } else if (update.message?.text === "/menu") {
      await sendMessage(update.message.from.id, "🏠 Asosiy menyu:", mainMenuKeyboard());
    } else if (update.message?.text === "/manzil") {
      await sendMessage(update.message.from.id, ADDRESS_INFO_TEXT);
    } else if (update.message?.text === "/mentor") {
      await sendMessage(update.message.from.id, MENTOR_INFO_TEXT);
    } else if (update.message?.text === "/kurs") {
      await sendMessage(update.message.from.id, KURS_INFO_TEXT);
    } else if (update.message?.text === MAIN_MENU_BUTTONS.address) {
      await sendMessage(update.message.from.id, ADDRESS_INFO_TEXT);
    } else if (update.message?.text === MAIN_MENU_BUTTONS.mentor) {
      await sendMessage(update.message.from.id, MENTOR_INFO_TEXT);
    } else if (update.message?.text === MAIN_MENU_BUTTONS.kurs) {
      await sendMessage(update.message.from.id, KURS_INFO_TEXT);
    } else if (update.message?.text === MAIN_MENU_BUTTONS.contact) {
      await finalizeDetailsRequestSimple(update.message.from.id);
    } else if (update.message?.text) {
      await handleTextMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }
  } catch (err) {
    console.error("Webhook xatoligi:", err);
  }

  return NextResponse.json({ ok: true });
}

// ============================================================================
// 1) /start VA RO'YXATDAN O'TISH
// ============================================================================
async function handleStart(message) {
  const userId = message.from.id;

  const parts = message.text.trim().split(" ");
  const payload = parts[1];
  if (payload && payload.startsWith("link_")) {
    await handleLinkCode(userId, payload.replace("link_", ""));
    return;
  }

  const { data: existingLead } = await supabaseAdmin
    .from("telegram_leads")
    .select("id, interest_type")
    .eq("telegram_user_id", userId)
    .maybeSingle();

  if (existingLead) {
    await sendMessage(
      userId,
      `Xush kelibsiz qaytganingiz bilan, ${message.from.first_name}! 👋`,
      mainReplyKeyboard()
    );
    if (!existingLead.interest_type) {
      await askInterest(userId);
    }
    return;
  }

  await supabaseAdmin
    .from("bot_fsm_state")
    .upsert({ telegram_user_id: userId, state: "waiting_full_name", data: {} });

  await sendMessage(
    userId,
    "👋 Assalomu alaykum! Biznes-kursimizga xush kelibsiz.\n\n" +
      "Avval tanishib olamiz. Iltimos, to'liq ism va familiyangizni yozing:\n" +
      "<i>(masalan: Sardorbek Aliyev)</i>"
  );
}

// ============================================================================
// 1.5) TELEGRAM AKKAUNTINI DASHBOARD HISOBIGA BOG'LASH
// ============================================================================
async function handleLinkCode(userId, code) {
  const { data: linkRow } = await supabaseAdmin
    .from("telegram_link_codes")
    .select("*")
    .eq("code", code)
    .eq("used", false)
    .maybeSingle();

  if (!linkRow) {
    await sendMessage(
      userId,
      "❌ Kod topilmadi yoki muddati o'tgan. Dashboard'dagi Profil sozlamalaridan yangi kod oling."
    );
    return;
  }

  const createdAt = new Date(linkRow.created_at).getTime();
  if (Date.now() - createdAt > 10 * 60 * 1000) {
    await sendMessage(userId, "❌ Kod muddati o'tgan (10 daqiqa). Dashboard'dan yangi kod oling.");
    return;
  }

  await supabaseAdmin
    .from("profiles")
    .update({ telegram_user_id: userId })
    .eq("id", linkRow.profile_id);

  await supabaseAdmin
    .from("telegram_link_codes")
    .update({ used: true })
    .eq("code", code);

  await sendMessage(
    userId,
    "✅ Telegram akkauntingiz dashboard hisobingizga muvaffaqiyatli ulandi!\n\n" +
      "Endi operatorlar guruhida lidlarni olganingizda, dashboard'dagi ism-familiyangiz ishlatiladi."
  );
}

async function handleContact(message) {
  const userId = message.from.id;

  if (message.contact.user_id !== userId) {
    await sendMessage(userId, "Iltimos, faqat o'zingizning telefon raqamingizni yuboring.");
    return;
  }

  const { data: fsm } = await supabaseAdmin
    .from("bot_fsm_state")
    .select("*")
    .eq("telegram_user_id", userId)
    .maybeSingle();

  if (!fsm) return;

  const phone = message.contact.phone_number;

  if (fsm.state === "waiting_phone") {
    const fullName = fsm.data?.full_name || "-";

    await supabaseAdmin.from("telegram_leads").insert({
      telegram_user_id: userId,
      telegram_username: message.from.username || null,
      full_name: fullName,
      phone,
      status: "Yangi Lid",
    });

    await supabaseAdmin.from("bot_fsm_state").delete().eq("telegram_user_id", userId);

    await sendMessage(
      userId,
      "✅ Ro'yxatdan muvaffaqiyatli o'tdingiz!\n\nEndi bir nechta savol beraman, shunda sizga aynan kerakli ma'lumotni yuboraman.",
      mainReplyKeyboard()
    );
    await askInterest(userId);
    return;
  }
}

async function handleTextMessage(message) {
  const userId = message.from.id;
  const text = message.text.trim();

  const { data: fsm } = await supabaseAdmin
    .from("bot_fsm_state")
    .select("*")
    .eq("telegram_user_id", userId)
    .maybeSingle();

  if (!fsm) return;

  if (fsm.state === "waiting_full_name") {
    if (text.split(" ").filter(Boolean).length < 2) {
      await sendMessage(userId, "Iltimos, ism va familiyangizni to'liq kiriting (masalan: Sardorbek Aliyev).");
      return;
    }
    await supabaseAdmin
      .from("bot_fsm_state")
      .update({ state: "waiting_phone", data: { full_name: text } })
      .eq("telegram_user_id", userId);
    await sendMessage(userId, "Rahmat! Endi telefon raqamingizni yuboring 👇", phoneShareKeyboard());
    return;
  }
  if (fsm.state === "waiting_phone") {
    await sendMessage(userId, "Iltimos, pastdagi '📱 Telefon raqamni yuborish' tugmasini bosing.", phoneShareKeyboard());
    return;
  }

  if (fsm.state === "awaiting_demo_datetime") {
    await handleOperatorDemoInput(userId, text, fsm.data?.leadId);
    return;
  }
}

// ============================================================================
// 2) QIZIQISH VA BOSQICH SAVOLLARI
// ============================================================================
async function askInterest(userId) {
  await sendMessage(
    userId,
    "Aynan nima haqida ma'lumot olishni xohlaysiz?",
    interestKeyboard()
  );
}

async function handleCallbackQuery(callbackQuery) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  if (data.startsWith("interest:")) {
    const interest = data.split(":")[1];
    await supabaseAdmin
      .from("telegram_leads")
      .update({ interest_type: interest })
      .eq("telegram_user_id", userId);

    await editMessageText(chatId, messageId, `Tanlandi: ${INTEREST_LABELS[interest]} ✅`);
    await sendMessage(userId, "Endi bosqichingizni tanlang:", stageKeyboard());
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data.startsWith("stage:")) {
    const stage = data.split(":")[1];
    const { data: lead } = await supabaseAdmin
      .from("telegram_leads")
      .update({ business_stage: stage })
      .eq("telegram_user_id", userId)
      .select("interest_type")
      .single();

    await editMessageText(chatId, messageId, `Tanlandi: ${STAGE_LABELS[stage]} ✅`);
    await showResourceChannels(userId, lead?.interest_type, stage);
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data === "want_details") {
    await finalizeDetailsRequest(userId, chatId, messageId);
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data.startsWith("claim:")) {
    await handleClaim(callbackQuery, data.split(":")[1]);
    return;
  }

  if (data.startsWith("set_demo:")) {
    await handleSetDemoButton(callbackQuery, data.split(":")[1]);
    return;
  }

  if (data.startsWith("demo_day:")) {
    await handleDemoDayResponse(callbackQuery, data);
    return;
  }

  if (data.startsWith("demo_hour:")) {
    await handleDemoHourResponse(callbackQuery, data);
    return;
  }

  if (data.startsWith("rating:")) {
    await handleRating(callbackQuery, data);
    return;
  }

  if (data === "menu_address") {
    await sendMessage(userId, ADDRESS_INFO_TEXT);
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data === "menu_mentor") {
    await sendMessage(userId, MENTOR_INFO_TEXT);
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data === "menu_kurs") {
    await sendMessage(userId, KURS_INFO_TEXT);
    await answerCallbackQuery(callbackQuery.id);
    return;
  }

  await answerCallbackQuery(callbackQuery.id);
}

// ============================================================================
// 3) RESURS KANALLARI
// ============================================================================
async function showResourceChannels(userId, interestType, businessStage) {
  const { data: channels } = await supabaseAdmin
    .from("resource_channels")
    .select("title, url, interest_type, business_stage")
    .order("display_order", { ascending: true });

  const matched = (channels || []).filter(
    (c) =>
      (c.interest_type === interestType || c.interest_type === null) &&
      (c.business_stage === businessStage || c.business_stage === null)
  );

  const list = matched.length > 0 ? matched : (channels || []).slice(0, 3);

  await sendMessage(
    userId,
    "📚 Sizga mos manbalarni tayyorladik. Quyidagi kanallardan foydalanishingiz mumkin:",
    resourceChannelsKeyboard(list)
  );
}

// ============================================================================
// 4) "BATAFSIL MA'LUMOT" -> OPERATORLAR GURUHIGA YUBORISH
// ============================================================================
async function finalizeDetailsRequestCore(userId) {
  const { data: lead } = await supabaseAdmin
    .from("telegram_leads")
    .update({ status: "Operatorga yuborildi" })
    .eq("telegram_user_id", userId)
    .select("*")
    .single();

  await sendMessage(
    userId,
    "Tez orada operatorimiz siz bilan bog'lanadi. Biroz kuting 🙏"
  );

  if (lead) {
    await sendMessage(
      OPERATORS_GROUP_ID,
      "🔔 <b>Yangi lid!</b>\n\n" +
        `👤 ${lead.full_name}\n` +
        `📞 ${lead.phone}\n` +
        `🎯 Qiziqishi: ${INTEREST_LABELS[lead.interest_type] || "-"}\n` +
        `📊 Bosqichi: ${STAGE_LABELS[lead.business_stage] || "-"}\n` +
        `🆔 @${lead.telegram_username || "-"}`,
      claimKeyboard(lead.id)
    );
  }
}

async function finalizeDetailsRequest(userId, chatId, messageId) {
  await editMessageText(chatId, messageId, "✅ Ma'lumotlaringiz qabul qilindi!");
  await finalizeDetailsRequestCore(userId);
}

async function finalizeDetailsRequestSimple(userId) {
  await finalizeDetailsRequestCore(userId);
}

// ============================================================================
// 5) OPERATOR LIDNI "OLADI" (dashboard profiliga bog'langan bo'lishi kerak)
// ============================================================================
async function handleClaim(callbackQuery, leadId) {
  const operatorId = callbackQuery.from.id;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("telegram_user_id", operatorId)
    .maybeSingle();

  if (!profile) {
    await answerCallbackQuery(
      callbackQuery.id,
      "❗ Avval Telegram akkauntingizni dashboard hisobingizga ulang: Profil sozlamalari → \"Telegramni ulash\"",
      { show_alert: true }
    );
    return;
  }

  const operatorName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Operator";

  const { data: lead } = await supabaseAdmin
    .from("telegram_leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead) {
    await answerCallbackQuery(callbackQuery.id, "Lid topilmadi.");
    return;
  }

  if (lead.assigned_operator_id) {
    await answerCallbackQuery(
      callbackQuery.id,
      `Bu mijozni allaqachon ${lead.assigned_operator_name} oldi.`
    );
    return;
  }

  await supabaseAdmin
    .from("telegram_leads")
    .update({
      assigned_operator_id: operatorId,
      assigned_operator_profile_id: profile.id,
      assigned_operator_name: operatorName,
      assigned_at: new Date().toISOString(),
      status: "Operator bilan aloqada",
    })
    .eq("id", leadId);

  const originalText = callbackQuery.message.text || "";
  await editMessageText(
    callbackQuery.message.chat.id,
    callbackQuery.message.message_id,
    `${originalText}\n\n✅ <b>${operatorName}</b> oldi (${formatDateTimeUz(new Date())})`,
    { inline_keyboard: [] }
  );

  await sendMessage(
    operatorId,
    "✅ Siz yangi mijozni oldingiz!\n\n" +
      `👤 ${lead.full_name}\n` +
      `📞 ${lead.phone}\n` +
      `🎯 Qiziqishi: ${INTEREST_LABELS[lead.interest_type] || "-"}\n` +
      `📊 Bosqichi: ${STAGE_LABELS[lead.business_stage] || "-"}\n\n` +
      "Mijoz bilan aloqaga chiqing. Demoga yozilsa, /mijozlarim buyrug'i orqali sanani belgilashingiz mumkin."
  );

  await answerCallbackQuery(callbackQuery.id, "Mijoz sizga biriktirildi ✅");
}

// ============================================================================
// 6) OPERATOR KABINETI: /mijozlarim
// ============================================================================
async function handleMyLeadsCommand(message) {
  const operatorId = message.from.id;

  const { data: leads } = await supabaseAdmin
    .from("telegram_leads")
    .select("*")
    .eq("assigned_operator_id", operatorId)
    .not("status", "in", '("Demo o\'tdi","Yakunlangan")')
    .order("assigned_at", { ascending: false });

  if (!leads || leads.length === 0) {
    await sendMessage(operatorId, "📭 Hozircha sizga biriktirilgan faol mijozlar yo'q.");
    return;
  }

  for (const lead of leads) {
    const demoInfo = lead.demo_datetime
      ? `\n📅 Demo: ${formatDateTimeUz(new Date(lead.demo_datetime))}`
      : "";
    await sendMessage(
      operatorId,
      `👤 <b>${lead.full_name}</b>\n📞 ${lead.phone}\n📊 Status: ${lead.status}${demoInfo}`,
      {
        inline_keyboard: [
          [{ text: "📅 Demo belgilash", callback_data: `set_demo:${lead.id}` }],
        ],
      }
    );
  }
}

async function handleSetDemoButton(callbackQuery, leadId) {
  const operatorId = callbackQuery.from.id;
  await supabaseAdmin
    .from("bot_fsm_state")
    .upsert({ telegram_user_id: operatorId, state: "awaiting_demo_datetime", data: { leadId } });

  await sendMessage(
    operatorId,
    "Demo sana va vaqtini yuboring:\n<code>KK.OO.YYYY SS:DD</code>\nMasalan: <code>16.08.2026 19:00</code>"
  );
  await answerCallbackQuery(callbackQuery.id);
}

async function handleOperatorDemoInput(operatorId, text, leadId) {
  const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) {
    await sendMessage(
      operatorId,
      "❌ Format noto'g'ri. <code>KK.OO.YYYY SS:DD</code> formatida yuboring (masalan: 16.08.2026 19:00)."
    );
    return;
  }

  const [, dd, mm, yyyy, hh, min] = match;
  const demoDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));

  if (demoDate.getTime() <= Date.now()) {
    await sendMessage(operatorId, "❌ Demo vaqti kelajakda bo'lishi kerak.");
    return;
  }

  const { data: lead } = await supabaseAdmin
    .from("telegram_leads")
    .update({ demo_datetime: demoDate.toISOString(), status: "Demoga yozildi" })
    .eq("id", leadId)
    .select("*")
    .single();

  await supabaseAdmin.from("bot_fsm_state").delete().eq("telegram_user_id", operatorId);

  if (!lead) return;

  const dateStr = formatDateTimeUz(demoDate);
  const firstName = (lead.full_name || "").split(" ")[0];

  await sendMessage(operatorId, `✅ Demo belgilandi: ${lead.full_name} - ${dateStr}`);

  await sendMessage(
    lead.telegram_user_id,
    `🎉 ${firstName}, tabriklaymiz! Siz Demo-darsga yozildingiz.\n\n` +
      `📅 Sana va vaqt: <b>${dateStr}</b>\n` +
      `📍 Manzil: <a href="${DEMO_LOCATION_URL}">Xaritada ko'rish</a>\n\n` +
      "Ko'rishguncha! Savol bo'lsa, operatoringizga yozishingiz mumkin."
  );

  const dayBefore = new Date(demoDate.getTime() - 24 * 60 * 60 * 1000);
  const hourBefore = new Date(demoDate.getTime() - 60 * 60 * 1000);
  const ratingTime = new Date(demoDate.getTime() + RATING_DELAY_HOURS * 60 * 60 * 1000);

  await supabaseAdmin.from("scheduled_messages").insert([
    {
      telegram_user_id: lead.telegram_user_id,
      message_text:
        `👋 ${firstName}, ertaga soat ${dateStr.split(" ")[1]} da Demo-darsimiz bo'ladi.\n\n` +
        "Kelishingizga ishonch hosil qilsak bo'ladimi?",
      reply_markup: demoConfirmDayKeyboard(lead.id),
      send_at: dayBefore.toISOString(),
      purpose: "demo_day_before",
    },
    {
      telegram_user_id: lead.telegram_user_id,
      message_text:
        `${firstName}, yordamdamisiz? Demoga kelayapsizmi? 😊\n\n` +
        `📍 Manzil: <a href="${DEMO_LOCATION_URL}">Xaritada ko'rish</a>`,
      reply_markup: demoConfirmHourKeyboard(lead.id),
      send_at: hourBefore.toISOString(),
      purpose: "demo_hour_before",
    },
    {
      telegram_user_id: lead.telegram_user_id,
      message_text: `${firstName}, Demo-darsimiz qanday o'tdi? Iltimos, 1 dan 10 gacha baholang:`,
      reply_markup: ratingKeyboard(lead.id),
      send_at: ratingTime.toISOString(),
      purpose: "demo_rating",
    },
  ]);
}

// ============================================================================
// 7) DEMO TASDIQLASH JAVOBLARI VA BAHOLASH
// ============================================================================
async function handleDemoDayResponse(callbackQuery, data) {
  const [, leadId, answer] = data.split(":");
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  await supabaseAdmin
    .from("telegram_leads")
    .update({ demo_confirmed_day_before: answer === "yes" })
    .eq("id", leadId);

  if (answer === "yes") {
    await editMessageText(chatId, messageId, "Ajoyib, ertaga ko'rishguncha! 😊", { inline_keyboard: [] });
  } else {
    await editMessageText(
      chatId,
      messageId,
      "Tushunarli. Boshqa qulay sana kerak bo'lsa, operatoringizga yozing.",
      { inline_keyboard: [] }
    );
    await notifyOperatorAboutLead(leadId, "⚠️ Mijoz ertangi demoga kela olmasligini aytdi.");
  }
  await answerCallbackQuery(callbackQuery.id);
}

async function handleDemoHourResponse(callbackQuery, data) {
  const [, leadId, answer] = data.split(":");
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  await supabaseAdmin
    .from("telegram_leads")
    .update({ demo_confirmed_hour_before: answer === "yes" })
    .eq("id", leadId);

  if (answer === "yes") {
    await editMessageText(chatId, messageId, "Zo'r! Kutamiz 🙌", { inline_keyboard: [] });
  } else {
    await editMessageText(chatId, messageId, "Tushunarli, kutamiz. ⏳", { inline_keyboard: [] });
    await notifyOperatorAboutLead(leadId, "⚠️ Mijoz bugungi demoga kechikishi yoki kela olmasligini aytdi (shoshilinch)!");
  }
  await answerCallbackQuery(callbackQuery.id);
}

async function handleRating(callbackQuery, data) {
  const [, leadId, ratingStr] = data.split(":");
  const rating = Number(ratingStr);
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  await supabaseAdmin
    .from("telegram_leads")
    .update({ demo_rating: rating, status: "Demo o'tdi" })
    .eq("id", leadId);

  await editMessageText(
    chatId,
    messageId,
    `Bahoyingiz uchun rahmat! 🙏 (${rating}/10)`,
    { inline_keyboard: [] }
  );
  await answerCallbackQuery(callbackQuery.id, "Rahmat!");
}

async function notifyOperatorAboutLead(leadId, note) {
  const { data: lead } = await supabaseAdmin
    .from("telegram_leads")
    .select("assigned_operator_id, full_name, phone")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead?.assigned_operator_id) return;

  await sendMessage(
    lead.assigned_operator_id,
    `${note}\n\n👤 ${lead.full_name}\n📞 ${lead.phone}`
  );
}
