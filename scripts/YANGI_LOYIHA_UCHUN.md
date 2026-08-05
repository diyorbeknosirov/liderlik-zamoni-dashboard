# Yangi loyiha uchun tayyor shablon — to'liq sozlash qo'llanmasi

Bu hujjat — mavjud "Liderlik Zamoni biznes kurslari" tizimini boshqa jamoa/kompaniya
uchun tezda ko'chirib sozlash uchun **yagona, to'liq** qo'llanma. Barcha
alohida SQL fayllarini (v2-v6) izlab yurishning hojati yo'q — pastdagi
tartibda ketma-ket bajaring.

## Nima uchun har bir loyiha uchun alohida narsalar kerak

| Nima | Nega |
|---|---|
| Yangi GitHub repository | Kod tarixi mustaqil bo'lishi uchun |
| Yangi Supabase loyihasi | Ma'lumotlar (xodimlar, sotuvlar) aralashmasligi uchun |
| Yangi Telegram bot (ixtiyoriy) | Har bir jamoa o'z guruhiga xabar olishi uchun |
| Yangi Vercel loyihasi | Alohida domen/havola bo'lishi uchun |

## 1-qadam: Kodni yangi joyga ko'chirish

1. Ushbu ZIP faylni yangi, bo'sh papkaga chiqaring
2. Yangi GitHub repository yarating ([github.com/new](https://github.com/new))
3. Terminalda (arxivdan chiqargan papkada):
   ```powershell
   git init
   git add .
   git commit -m "Boshlang'ich versiya"
   git branch -M main
   git remote add origin https://github.com/SIZNING_USERNAME/YANGI_REPO.git
   git push -u origin main
   ```

## 2-qadam: Yangi Supabase loyihasi

1. [supabase.com](https://supabase.com) → **New Project** → nom bering, kuchli
   parol o'rnating, region tanlang
2. **SQL Editor**da quyidagi fayllarni **aynan shu tartibda**, birma-bir
   to'liq matnini joylashtirib, **Run** bosing:

   | # | Fayl | Nima qiladi |
   |---|---|---|
   | 1 | `supabase/schema.sql` | Asosiy jadvallar (profiles, sales, tariffs, team_settings) |
   | 2 | `supabase/storage.sql` | Fayl saqlash siyosatlari (avval 3-qadamni bajaring) |
   | 3 | `supabase/migration_v2.sql` | Tarif narxlarini yangilash |
   | 4 | `supabase/migration_v3.sql` | Bildirishnoma, tasklar, ish vaqti jadvallari |
   | 5 | `supabase/migration_v4.sql` | Jamoa nomlarini Kunduzgi/Kechkiga o'tkazish |
   | 6 | `supabase/migration_v5.sql` | Lid analitikasi (daily_lead_stats) jadvali |
   | 7 | `supabase/migration_v6.sql` | Team Leader roli |

   Agar yangi loyihada boshqa tarif narxlari kerak bo'lsa,
   `supabase/update_prices.sql`ni ham moslashtirib ishga tushiring.

3. **Storage** bo'limida ikkita **public** bucket yarating:
   - `avatars`
   - `receipts`

   (Bularni **2-qadamdan oldin** yarating, chunki `storage.sql` shu
   bucket'larga siyosat qo'shadi)

## 3-qadam: `.env.local` faylini sozlash

`Settings → API`dan **Project URL** va **anon public key**ni oling.
Loyiha ildizida `.env.local` (`.env.local.example`dan nusxa) yarating:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_GROUP_CHAT_ID=your-group-chat-id
CRON_SECRET=your-random-secret
```

`SUPABASE_SERVICE_ROLE_KEY` — `Settings → API`dagi **service_role**
kaliti (juda maxfiy, hech kimga bermang).

## 4-qadam: Birinchi admin hisobini yaratish

Supabase → **Authentication → Users → Add user**:
- Email va parol kiriting
- **"Auto Confirm User"** ni albatta yoqing

Keyin **SQL Editor**da (emailni almashtiring):
```sql
update profiles
set role = 'admin', first_name = 'Ism', last_name = 'Familiya'
where id = (select id from auth.users where email = 'admin@yangidomen.uz');
```

## 5-qadam: Brendlashni almashtirish

**a) Jamoa nomi** — quyidagi fayllarda "Liderlik Zamoni biznes kurslari" so'zini
qidirib, yangi nom bilan almashtiring:
- `components/layout/Sidebar.jsx`
- `app/login/page.jsx`
- `app/layout.jsx`

**b) Logotip** — `public/deepai-logo.jpg` faylini yangi rasm bilan
almashtiring (fayl nomini **aynan shunday** qoldiring, aks holda kodda
ham o'zgartirish kerak bo'ladi — yoki barcha `deepai-logo.jpg`
ishlatilgan joylarni topib, yangi nomga almashtiring).

**c) Ranglar (ixtiyoriy)** — `lib/constants.js` dagi `COLORS.primary`
qiymatini o'zgartirsangiz, butun sayt yangi asosiy rangga o'tadi.

**d) Tarif narxlari** — `supabase/update_prices.sql`ni moslashtirib
ishga tushiring, yoki to'g'ridan-to'g'ri SQL Editor'da:
```sql
update tariffs set price = YANGI_NARX where id = 'prompt';
update tariffs set price = YANGI_NARX where id = 'media';
update tariffs set price = YANGI_NARX where id = 'vibe';
```

**e) Maosh bonuslari (agar boshqacha bo'lishi kerak bo'lsa)** —
`lib/salary.js` faylidagi konstantalarni o'zgartiring:
```js
export const ATTENDANCE_BONUS_PER_DAY = 40000;
export const HOURS_BONUS_5_PLUS = 27000;
export const HOURS_BONUS_4_TO_5 = 18000;
export const CONVERSION_BONUS_HIGH = 500000;
export const CONVERSION_BONUS_MID = 200000;
```

**f) Check-in vaqt oynalari (agar boshqacha bo'lsa)** — xuddi shu
`lib/salary.js` faylida:
```js
const DAY_TEAM_WINDOW = { start: 9 * 60 + 50, end: 10 * 60 + 10 };
const EVENING_TEAM_WINDOW = { start: 13 * 60 + 50, end: 14 * 60 + 10 };
```

## 6-qadam: Telegram bot (ixtiyoriy)

To'liq qo'llanma: `scripts/TELEGRAM_SETUP.md`. Qisqacha: @BotFather orqali
yangi bot yarating (yoki mavjudini ishlating), guruhga qo'shing, Chat ID
toping, `.env.local`ga qo'shing.

## 7-qadam: Vercel'ga deploy qilish

1. [vercel.com](https://vercel.com) → **Add New → Project** → yangi
   GitHub repo'ni tanlang
2. **Environment Variables**ga 4-qadamdagi barcha o'zgaruvchilarni
   qo'shing (Production, Preview, Development)
3. **Deploy**

## 8-qadam: Mahalliy sinash

```powershell
npm install
npm run dev
```

`http://localhost:3000`da admin hisobingiz bilan kirib, hamma narsa
to'g'ri ishlayotganini tekshiring.

---

## Tezkor nazorat ro'yxati (checklist)

- [ ] Yangi GitHub repo yaratildi va kod push qilindi
- [ ] Yangi Supabase loyihasi yaratildi
- [ ] Barcha 7 ta SQL fayli (schema → v6) ketma-ket ishga tushirildi
- [ ] `avatars` va `receipts` bucket'lari yaratildi
- [ ] `.env.local` to'liq to'ldirildi (6 ta o'zgaruvchi)
- [ ] Birinchi admin hisobi yaratildi va roli "admin" qilib belgilandi
- [ ] Jamoa nomi va logotip almashtirildi
- [ ] Vercel'ga deploy qilindi, muhit o'zgaruvchilari qo'shildi
- [ ] Mahalliy va jonli saytda sinab ko'rildi
