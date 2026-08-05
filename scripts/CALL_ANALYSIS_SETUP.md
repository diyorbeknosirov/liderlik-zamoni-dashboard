# Qo'ng'iroq tahlili (AI) — sozlash qo'llanmasi

Bu funksiya: sotuvchi telefon qo'ng'irog'ini (masalan telefonning o'z
ovoz yozish ilovasi orqali) yozib oladi, so'ng audio faylni saytga
yuklaydi. Tizim uni matnga aylantiradi (transkripsiya) va AI orqali
tahlil qilib, quyidagilarni beradi: qisqacha xulosa, yaxshi tomonlar,
yaxshilash kerak bo'lgan tomonlar, mijoz e'tirozlari, tavsiya etiladigan
keyingi qadam, umumiy baho (1-10).

**Muhim:** bu — REAL VAQTDA emas, balki **qo'ng'iroqdan keyingi** tahlil.
Real vaqtda ishlashi uchun butunlay boshqa (ancha katta) infratuzilma
kerak bo'ladi.

## 1. OpenAI hisobi va API kaliti

1. [platform.openai.com](https://platform.openai.com) da hisob oching
2. To'lov usulini bog'lang (kredit karta) — foydalanish hajmiga qarab
   to'lanadi, oylik obuna emas
3. **API keys** bo'limidan yangi kalit yarating

## 2. Narxlash haqida (taxminiy, o'zgarishi mumkin)

- Transkripsiya (Whisper): ~$0.006/daqiqa (~$0.36/soat)
- Tahlil (GPT-4o mini): bir tahlil uchun juda arzon, odatda bir necha sentdan kam

Masalan, 100 ta 5 daqiqalik qo'ng'iroqni oyiga tahlil qilish — taxminan
$3-5 atrofida xarajat. **Aniq va joriy narxni** [openai.com/api/pricing](https://openai.com/api/pricing)
sahifasidan tekshiring, chunki narxlar vaqti bilan o'zgaradi.

## 3. `.env.local` ga qo'shish

```
OPENAI_API_KEY=sk-...
```

Vercel'da ham **Settings → Environment Variables**ga xuddi shu nom bilan
qo'shing.

## 4. Supabase sozlash

1. **SQL Editor**da `supabase/migration_v8.sql` faylining to'liq matnini
   ishga tushiring
2. **Storage** bo'limida yangi bucket yarating: **`call-recordings`**
   — MUHIM: bu safar **"Public bucket"ni YOQMANG** (chek/avatar
   bucket'laridan farqli, bu maxfiy bo'lishi kerak, chunki mijozlar
   bilan suhbat yozuvlari)

## 5. Qanday ishlaydi

1. Sotuvchi "Qo'ng'iroq tahlili" bo'limiga o'tadi
2. Mijoz ismi/telefon (ixtiyoriy) va audio faylni yuklaydi
3. Tizim faylni maxfiy saqlashga joylaydi, so'ng fon rejimida:
   - OpenAI Whisper orqali matnga aylantiradi
   - GPT orqali tahlil qiladi
4. 1-3 daqiqadan so'ng natija avtomatik paydo bo'ladi (real-vaqt
   yangilanish orqali, sahifani yangilash shart emas)
5. Admin barcha xodimlarning tahlillarini bitta joyda ko'radi

## Cheklovlar va bilib qo'yish kerak bo'lgan narsalar

- Audio fayl hajmi katta bo'lsa (masalan 25 MB dan oshsa), Whisper API
  uni qabul qilmasligi mumkin — uzun qo'ng'iroqlarni siqilgan formatda
  (masalan past bitrate MP3) saqlashni tavsiya qilamiz.
- O'zbek tili uchun transkripsiya sifati ba'zan mukammal bo'lmasligi
  mumkin (Whisper asosan ingliz/rus kabi tillarda kuchliroq ishlaydi) —
  lekin amaliy foydalanish uchun odatda yetarli.
- **Huquqiy eslatma:** mijozlar bilan suhbatni yozib olish va tahlil
  qilish ba'zi hollarda maxsus rozilik talab qilishi mumkin — bu haqda
  yuridik maslahat olishni tavsiya qilamiz.
