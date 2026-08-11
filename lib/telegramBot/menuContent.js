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
  "<b>Abdulaziz Azimov</b> — 38 yoshli tadbirkor, \"Sumayya shop\" onlayn " +
  "va oflayn do'konlar tarmog'i asoschisi.\n\n" +
  "• Sof foyda: 102 500 000 so'm\n" +
  "• 22 yillik amaliy tajriba\n" +
  "• 800 dan ortiq insonga o'z maqsadlariga erishishda yordam bergan\n\n" +
  "Abdulaziz aka o'zi ham noldan boshlagan — birinchi urinishida " +
  "50 000$ yo'qotgan, so'ng tizimli yondashuv orqali barqaror natijaga " +
  "chiqqan. Endi shu tajribasini dastur orqali sizga ulashadi.\n\n" +
  "Dastur davomida sizga shaxsiy kurator ham biriktiriladi — u " +
  "guruhingizdagi bor-yo'g'i 5-10 kishini nazorat qiladi va har kuni " +
  "ertalab-kechqurun siz bilan bog'lanib boradi.";

export const KURS_INFO_TEXT =
  "📚 <b>Kurs haqida</b>\n\n" +
  "45 kunlik amaliy dastur — 12 kun oflayn + 4 hafta onlayn:\n\n" +
  "<b>1-modul</b> — Transformatsiya, Biznes start, Bozorni tahlil qilish\n" +
  "<b>2-modul</b> — Arqonli kurs, Maqsadlar kuni\n" +
  "<b>3-modul</b> — Demoday, Sertifikat\n\n" +
  "Dasturning 90%i amaliyotga qaratilgan. Kurs davomida 7 ta asosiy " +
  "yo'nalish o'rgatiladi:\n" +
  "• Soha tanlash\n" +
  "• Marketing\n" +
  "• SMM rivojlantirish\n" +
  "• Target (reklama)\n" +
  "• Hodimlar boshqaruvi (HR)\n" +
  "• Sotuv\n" +
  "• Moliya (biznes darajasida)\n\n" +
  "<b>Narxlar:</b>\n" +
  "• 7 mln so'm — to'liq dastur\n" +
  "• 10 mln so'm — + Xitoyga 3 kunlik tijoriy safar\n\n" +
  "Batafsil ma'lumot va aniq javoblar uchun Demo-darsda yoki operator " +
  "bilan bog'lanib bilib olishingiz mumkin.";

export const ADDRESS_INFO_TEXT =
  "📍 <b>Demo-dars manzili</b>\n\n" +
  `<a href="${DEMO_LOCATION_URL}">Xaritada ko'rish</a>\n\n` +
  "Demo-darsdan oldin manzilni saqlab qo'yishni tavsiya qilamiz.";
