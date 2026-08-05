# Telegram bot integratsiyasini sozlash

Ikkita funksiya ishlaydi:
1. **Darhol xabar** — yangi sotuv kiritilganda guruhga avtomatik yuboriladi (chek fayli **ko'rsatilmaydi**).
2. **Kunlik hisobot** — har kuni soat 23:50 da guruhga kim qancha sotgani, kunlik va oylik jami summalar yuboriladi.

## 1. Bot tokenini olish

Sizda allaqachon `@deepAI_kassabot` boti bor. Uning tokenini olish uchun:

1. Telegram'da **@BotFather** bilan chat oching
2. `/mybots` buyrug'ini yuboring
3. `@deepAI_kassabot`ni tanlang
4. **"API Token"** tugmasini bosing — token shu yerda ko'rinadi
   (masalan `123456789:AAExampleTokenHere`)

Agar bu botni boshqa vazifalar uchun ham band qilib qo'ygan bo'lsangiz va
aralashtirmoqchi bo'lmasangiz, BotFather orqali **yangi, alohida bot**
yaratishingiz ham mumkin (`/newbot` buyrug'i orqali) — ikkala holatda ham
quyidagi qadamlar bir xil.

## 2. Guruh Chat ID'sini olish

1. Botni xabar yuborilishi kerak bo'lgan Telegram guruhiga qo'shing
   (guruhda **"Add member"** orqali)
2. Guruhga istalgan xabar yozing (masalan "salom")
3. Brauzerda shu manzilni oching (TOKEN o'rniga o'z tokeningizni yozing):
   ```
   https://api.telegram.org/botTOKEN/getUpdates
   ```
4. Natijada JSON ko'rinadi, u yerda `"chat":{"id":-1001234567890,...}`
   qatorini toping — bu raqam (minus bilan boshlanadi, guruhlar uchun
   har doim manfiy) sizning **Chat ID**'ngiz

Agar natija bo'sh bo'lsa, guruhga yana bir marta xabar yozib, sahifani
qayta yangilang.

## 3. Muhit o'zgaruvchilarini sozlash

`.env.local` fayliga (yoki VPS'dagi bir xil faylga) qo'shing:

```
TELEGRAM_BOT_TOKEN=123456789:AAExampleTokenHere
TELEGRAM_GROUP_CHAT_ID=-1001234567890
```

## 4. Kunlik hisobot uchun qo'shimcha sozlash

Kunlik hisobot ma'lumotlar bazasini **login qilmasdan** o'qishi kerak
(chunki bu avtomatik, foydalanuvchisiz ishga tushadi). Buning uchun
Supabase'ning maxfiy **service role** kaliti kerak:

1. Supabase Dashboard → **Settings → API**
2. **"service_role"** qatoridagi kalitni nusxalang (⚠️ bu juda maxfiy —
   hech qachon frontend kodida yoki GitHub'da ochiq qoldirmang)
3. `.env.local`ga qo'shing:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sizning-service-role-kalitingiz
   ```

Bundan tashqari, hisobot API'sini tashqi odamlar chaqirmasligi uchun
maxfiy so'z qo'ying:

```
CRON_SECRET=uzun-tasodifiy-matn-masalan-x7f9k2m4
```

## 5. Sinab ko'rish

Server ishga tushgandan keyin (`npm run dev` yoki VPS'da PM2 orqali),
terminaldan qo'lda sinab ko'rish mumkin:

```bash
curl -X POST https://sizning-domeningiz/api/daily-report \
  -H "Authorization: Bearer sizning-CRON_SECRET-qiymatingiz"
```

Agar hammasi to'g'ri bo'lsa, Telegram guruhingizga hisobot xabari keladi.

## 6. Har kuni avtomatik ishga tushirish

Hozircha Vercel'da qolsangiz ham, hech qanday muammo yo'q — loyihada
`vercel.json` fayli allaqachon tayyor va Vercel'ning **bepul Cron Jobs**
funksiyasidan foydalanadi:

```json
{
  "crons": [
    { "path": "/api/daily-report", "schedule": "50 18 * * *" }
  ]
}
```

**Muhim izoh:** Vercel cron'lari faqat **UTC** vaqtida ishlaydi. `18:50 UTC`
= **23:50 Toshkent** vaqti (UTC+5). Bepul (Hobby) rejada Vercel aniq
daqiqani kafolatlamaydi — buyruq **18:00–18:59 UTC** oralig'ida (ya'ni
taxminan 23:00–23:59 Toshkent vaqtida) ishga tushishi mumkin. Bu kunlik
hisobot uchun yetarli aniqlik.

### Sozlash — Vercel'da (hozirgi holat uchun)

1. Vercel Dashboard → loyihangiz → **Settings → Environment Variables**
2. Quyidagi barcha o'zgaruvchilarni qo'shing (Production, Preview,
   Development — barchasi uchun):
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_GROUP_CHAT_ID`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (o'zingiz o'ylab topgan uzun tasodifiy matn)
3. **Deployments** → oxirgi deploy → **"..."** → **"Redeploy"**

Shu qadar — boshqa hech narsa kerak emas. `vercel.json` fayli GitHub'ga
push qilinganda Vercel uni avtomatik o'qiydi va cron'ni o'zi ro'yxatdan
o'tkazadi (buni **Settings → Cron Jobs** bo'limida ko'rishingiz mumkin).

### Sozlash — VPS'ga o'tganingizda (kelajakda)

VPS'da esa haqiqiy `crontab` orqali **aniq daqiqada** (masalan aynan
23:50:00da) ishga tushirish mumkin bo'ladi:

Serverda vaqt mintaqasini Toshkentga sozlang:

```bash
timedatectl set-timezone Asia/Tashkent
```

Keyin crontab'ni oching:

```bash
crontab -e
```

Va oxiriga shu qatorni qo'shing (CRON_SECRET qiymatini o'zingiznikiga
almashtiring, domeningizni ham to'g'rilang):

```
50 23 * * * curl -s -X POST https://sizning-domeningiz/api/daily-report -H "Authorization: Bearer sizning-CRON_SECRET-qiymatingiz" >> /var/log/daily-report.log 2>&1
```

Saqlang (agar `nano` ochilsa: Ctrl+O, Enter, Ctrl+X). VPS'ga o'tganingizda,
`vercel.json`dagi cron avtomatik ishlamay qoladi (Vercel'da emassiz), shu
sababli o'sha paytda ushbu crontab usuliga to'liq o'tasiz.

## Nosozliklarni bartaraf etish

- **"TELEGRAM_BOT_TOKEN yoki TELEGRAM_GROUP_CHAT_ID sozlanmagan"** —
  `.env.local` to'g'ri to'ldirilmagan yoki server qayta ishga
  tushirilmagan.
- **Guruhga xabar kelmayapti** — bot guruhdan chiqarib yuborilgan
  bo'lishi mumkin, yoki Chat ID noto'g'ri.
- **401 "Ruxsat yo'q"** — `CRON_SECRET` qiymati `.env.local`dagi va
  crontab buyrug'idagi bir xil emas.
