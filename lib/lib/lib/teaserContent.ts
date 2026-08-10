/**
 * lib/teaserContent.ts
 * ----------------------
 * Nurturing (voronka) ketma-ketligidagi teaser xabarlar matni va
 * ro'yxatdan o'tgandan keyingi yuborilish kechikishi (soatlarda).
 *
 * Bu faylni marketing jamoasi bilan kelishilgan holda o'zgartirishingiz mumkin -
 * webhook kodini o'zgartirish shart emas.
 */

export const TEASER_SEQUENCE = [
  {
    delayHours: 24, // 1-kun
    text:
      "👋 Salom! Kecha ro'yxatdan o'tganingiz uchun rahmat.\n\n" +
      "Bilasizmi, bizning talabalarimizdan biri kursni tugatgach " +
      "birinchi loyihasidan 3 barobar ko'p daromad oldi 💰\n\n" +
      "Ertaga sizga uning to'liq keysini yuboramiz. Kuting! 🔥",
  },
  {
    delayHours: 48, // 2-kun
    text:
      "📊 Keys: Qanday qilib bizning bitiruvchimiz 45 kunda " +
      "birinchi mijozlarini topdi?\n\n" +
      "U hech qanday tajribasiz, noldan boshlab, aynan bizning " +
      "metodikamiz asosida ishladi.\n\n" +
      "Yakshanbadagi bepul Demo-darsda shu metodikaning bir qismini " +
      "ko'rsatib beramiz 👇",
  },
  {
    delayHours: 72, // 3-kun
    text:
      "⏳ Eslatma: Yakshanbadagi Demo-dars uchun joylar cheklangan.\n\n" +
      "Agar biznesingizni tizimlashtirish yoki noldan boshlashni " +
      "xohlasangiz - bu dars aynan siz uchun.\n\n" +
      "Yoki bevosita mentor bilan gaplashishni istasangiz, " +
      "konsultatsiya vaqtini tanlashingiz mumkin.",
  },
];
