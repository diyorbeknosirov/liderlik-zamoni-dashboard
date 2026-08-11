/**
 * lib/telegramBot/menuContent.js
 * ----------------------------------
 * Bot menyusidagi statik bo'limlar matni (Mentor, Kurs, Manzil).
 * Bu faylni tahrirlab, matnlarni o'zingiznikiga moslashtiring - webhook
 * kodini o'zgartirish shart emas.
 */

export const DEMO_LOCATION_URL = "https://yandex.uz/maps/-/CTGMjNJ7";

export const MENTOR_INFO_TEXT =
  "🧑‍💼 <b>Mentor haqida</b>\n\n" +
  "Bizning mentorimiz 5+ yillik amaliy biznes tajribasiga ega, o'nlab " +
  "tadbirkorlarni noldan boshlab muvaffaqiyatga yetaklagan.\n\n" +
  "Demo-darsda mentor bilan bevosita tanishishingiz va savollaringizga " +
  "javob olishingiz mumkin.";

export const KURS_INFO_TEXT =
  "📚 <b>Kurs haqida</b>\n\n" +
  "Kurs sizga noldan biznes qurish yoki mavjud biznesingizni " +
  "tizimlashtirish uchun amaliy vositalar beradi:\n\n" +
  "• Amaliy modullar va uy vazifalari\n" +
  "• Haftalik jonli darslar\n" +
  "• Mentor bilan individual maslahatlashuvlar\n\n" +
  "To'liq dastur va narxlar bilan Demo-darsda tanishishingiz mumkin.";

export const ADDRESS_INFO_TEXT =
  "📍 <b>Demo-dars manzili</b>\n\n" +
  `<a href="${DEMO_LOCATION_URL}">Xaritada ko'rish</a>\n\n` +
  "Demo-darsdan oldin manzilni saqlab qo'yishni tavsiya qilamiz.";
