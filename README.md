# Liderlik Zamoni — Biznes kurslari sotuv boshqaruv tizimi

Sotuv jamoasi uchun vizual, interaktiv Sales Dashboard va Leaderboard tizimi.
Next.js 14 (App Router) + Tailwind CSS + Recharts + Supabase (auth, database, storage, realtime).

## Bu — "Liderlik Zamoni" uchun moslashtirilgan shablon (v16)

Bu loyiha asosiy sotuv boshqaruv tizimidan quyidagi farqlar bilan
moslashtirilgan:

- **Mentor moduli olib tashlangan** — bu variantda faqat Admin va
  Sotuvchi (operator) rollari mavjud.
- **Yangi dizayn** — to'q ko'k + oltin rang sxemasi, "Liderlik Zamoni"
  nomi va tojli (Crown) belgi.
- **To'liq moslashtiriladigan bonus tizimi** — qattiq belgilangan
  foizlar/summalar o'rniga, admin **"Moliya va Plan"** sahifasida
  o'zi bonus qoidalarini yaratadi, tahrirlaydi, yoqadi/o'chiradi va
  o'chirib tashlaydi:
  - **Nom** — bonusning erkin nomi (masalan "10 ta mijoz olib kelish bonusi")
  - **Ko'rsatkich** — sotuv summasi, olib kelingan mijozlar soni,
    konversiya foizi, davomat kunlari, qo'ng'iroq daqiqasi, yoki
    qo'ng'iroq sifati bahosi
  - **Shart** — kattaroq/teng, kichikroq/teng, yoki oraliq
  - **Bonus turi** — belgilangan summa (so'm) yoki foiz
  
  Bir nechta qoida bir vaqtda qo'llanishi mumkin — har bir xodimning
  jami maoshi: **fiksa baza + barcha qo'llangan bonuslar yig'indisi**.

Sozlash tartibi asosiy loyihadagi bilan bir xil (quyida), faqat
`supabase/migration_v15.sql` (bonus qoidalari) ham ishga tushirilishi
kerak, va mentor bilan bog'liq migratsiyalar (v11-v13) bu loyihada
umuman yo'q.

## 1. Supabase loyihasini sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating.
2. **SQL Editor** ga o'ting va ketma-ket ikkita faylni ishga tushiring:
   - `supabase/schema.sql` — jadvallar, RLS siyosatlari, trigger, realtime
   - `supabase/storage.sql` — fayl saqlash siyosatlari (avval quyidagi 3-qadamni bajaring)
3. **Storage** bo'limida ikkita **public** bucket yarating: `avatars` va `receipts`
   (keyin `storage.sql` ni ishga tushiring)
4. **Settings → API** dan `Project URL` va `anon public` kalitni oling
5. Loyiha ildizida `.env.local` fayl yarating (`.env.local.example` dan nusxa oling):

```bash
cp .env.local.example .env.local
```

Va ichiga o'z qiymatlaringizni yozing:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

6. Birinchi admin hisobini yarating — `scripts/README.md` faylidagi yo'riqnomaga amal qiling.

## 2. Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda oching: http://localhost:3000

## Loyiha strukturasi

```
app/
  layout.jsx                 — Root layout (AuthProvider + DataProvider)
  login/page.jsx              — Login sahifasi (Supabase Auth, email + parol)
  dashboard/
    layout.jsx                 — Himoyalangan shell: Sidebar + Topbar + live toast
    page.jsx                    — Asosiy dashboard
    new-sale/page.jsx           — Yangi sotuv (chek fayli Supabase Storage'ga yuklanadi)
    profile/page.jsx            — Profil sozlamalari (avatar yuklash)
    admin/
      operators/page.jsx         — Sotuvchilar boshqaruvi (yangi hisob yaratish)
      finance/page.jsx           — Moliya va Plan
      calendar/page.jsx          — Kalendar/Arxiv (haqiqiy sana bo'yicha filtr)
      invoices/page.jsx          — Invoices (real-time, tasdiqlash, chek ko'rish)

components/    — UI, layout, dashboard, admin komponentlari
context/
  AuthContext.jsx    — Supabase Auth bilan login/logout/profil
  DataContext.jsx     — Supabase'dan operators/invoices/tariffs, realtime obuna
lib/
  supabaseClient.js  — Supabase klient
  constants.js        — Ranglar, motivatsion iboralar
  format.js            — Raqam formatlash
hooks/
  useLiveSaleToasts.js — Realtime "INSERT" hodisalaridan live toast yaratadi
supabase/
  schema.sql   — Jadvallar, RLS, trigger, realtime yoqish
  storage.sql   — Fayl saqlash siyosatlari
scripts/
  README.md    — Birinchi admin hisobini yaratish yo'riqnomasi
```

- **Telegram bildirishnomasi** — yangi sotuv kiritilganda guruhga darhol
  xabar boradi (chek fayli ko'rsatilmaydi). Har kuni belgilangan vaqtda
  (odatda 23:50) kunlik hisobot yuboriladi. Sozlash: `scripts/TELEGRAM_SETUP.md`.

## Qanday ishlaydi

- **Autentifikatsiya** — Supabase Auth (email + parol). Yangi foydalanuvchi ro'yxatdan
  o'tganda `handle_new_user` trigger'i orqali avtomatik `profiles` qatori yaratiladi.
- **Ma'lumotlar** — barcha sotuvlar `sales` jadvalida saqlanadi, sana bilan birga —
  shuning uchun oy almashganda hech narsa "reset" qilinmaydi, faqat Kalendar/Arxiv
  filtri orqali istalgan oy ko'riladi.
- **Real-vaqt** — yangi sotuv qo'shilganda barcha ochiq sessiyalarda avtomatik
  Postgres Realtime orqali xabar keladi va live toast ko'rsatiladi.
- **Fayllar** — avatar va chek rasmlari Supabase Storage'da, public bucket'larda
  saqlanadi, RLS orqali har kim faqat o'z papkasiga yoza oladi.

## Xavfsizlik bo'yicha eslatmalar

1. **Operatorni to'liq o'chirish** (auth.users darajasida) uchun `service_role`
   kaliti kerak, bu brauzerda ishlatilmaydi. Hozirgi "O'chirish" tugmasi faqat
   profil qatorini o'chiradi. To'liq o'chirish kerak bo'lsa, buni server-side
   (Next.js API Route yoki Supabase Edge Function) orqali qo'shish tavsiya etiladi.
2. **Email tasdiqlash** — Supabase standart holatda yangi hisob uchun email
   tasdiqlashni talab qiladi. Ichki jamoa uchun buni **Authentication → Providers
   → Email → "Confirm email"** sozlamasidan o'chirib qo'yish mumkin.
3. `.env.local` faylini hech qachon Git'ga qo'shmang — `.gitignore` da allaqachon
   istisno qilingan.

## Joylashtirish (Deployment)

Ikkita variant bor:

**A) Vercel (eng oson, avtomatik)** — GitHub'ga push qilinganda avtomatik
qayta joylanadi. Tijorat foydalanish uchun Pro reja tavsiya etiladi.

**B) O'z VPS serveringiz (arzonroq, to'liq nazorat)** — to'liq qo'llanma:
`deploy/VPS_DEPLOYMENT.md`. Kerakli fayllar: `deploy/ecosystem.config.js`
(PM2), `deploy/nginx.conf.example`, `deploy/deploy.sh` (yangilanish skripti).

## Yangi funksiyalar (v3)

- **Bosqichli bonus tizimi** — oylik sotuvga qarab avtomatik: 0-10 mln = 4%,
  10-20 mln = 7%, 20 mln+ = 10%. Har bir operatorning "sotildi" ko'rsatkichi
  endi **faqat joriy oy** bo'yicha hisoblanadi (avval umr bo'yi yig'indi edi).
- **Operator hisobot sahifasi** (`/dashboard/report`) — qo'ng'iroq/lid
  kundaligi (qo'lda kiritiladi), kunlik sotuv va suhbat daqiqalari grafigi,
  o'rtacha suhbat davomiyligi, lidlar soni, konversiya foizi.
- **Tasklar tizimi** (`/dashboard/tasks` operator uchun,
  `/dashboard/admin/tasks` admin uchun) — admin xodimga vazifa tayinlaydi,
  xodim o'zi ham vazifa qo'sha oladi (masalan "10:00 da qo'ng'iroq qilish").
- **Jamoa logotipi** — sidebar va login sahifasida "Liderlik Zamoni" nomi
  va tojli belgi (Crown) ishlatiladi. Rasm yuklamagan xodimlar uchun
  ismning bosh harflaridan tuzilgan rangli avatar ko'rinadi.
- **Ish vaqti taymeri** — operator kirganda avtomatik boshlanadi, pastki
  panelda ko'rinadi. 30 daqiqa harakatsizlikdan keyin avtomatik pauzaga
  o'tadi (qo'lda qayta ishga tushiriladi). Rang: 5 soatdan ko'p — yashil,
  4-5 soat — sariq, 4 soatdan kam — qizil. Yonida vaqt boshqaruvi
  maslahatlari va bugungi vazifalar o'ngdan chapga o'tib turadi.

Sozlash uchun: `supabase/migration_v3.sql` faylini SQL Editor'da ishga
tushiring (call_logs, tasks, work_sessions jadvallari va RLS siyosatlari).

## Tuzatishlar va yangi funksiyalar (v4)

1. **Sotuvchi ismi ko'rinmasligi** — tuzatildi. Endi Telegram/Google Sheets
   xabarlari uchun operator ma'lumoti to'g'ridan-to'g'ri bazadan yangilanib
   olinadi (eskirgan holatga tayanmaydi). Real-vaqt "yangi sotuv" popup'i
   ham operator ro'yxati hali yuklanmagan bo'lsa, keyinroq qayta urinadi.
2. **Sotuv sanasi** — "Yangi sotuv" formasida endi sana tanlash maydoni bor.
   Tanlangan sana bo'yicha sotuv o'sha kunning natijasiga qo'shiladi
   (Kalendar/Arxiv, kunlik hisobotlar).
3. **Ikkita jamoa (Kunduzgi/Kechki)** — Dashboard'da "Jamoalar taqqoslash"
   bo'limi qo'shildi: har bir jamoaning nomi, logotipi, bugungi va oylik
   sotuvi ko'rinadi. Yetakchi jamoa yashil, orqada qolgani qizil rangda.
4. **To'liq raqam formati** — barcha sotuv natijalari endi "555 ming" emas,
   "555 000 so'm" ko'rinishida. Admin uchun Leaderboard'da har bir
   xodimning kutilayotgan maoshi (fiksa + bonus) ham ko'rinadi. Reja
   bajarilishi foizi: 0-90% qizil, 90-100% sariq, 100%+ yashil.
5. **Oy oxiri prognozi** — Leaderboard'da har bir operator uchun joriy
   sur'atga asosan oy oxirida qanday foizga yetishi mumkinligi ko'rsatiladi.
6. **Admin — to'liq sotuv boshqaruvi** — Invoices sahifasida endi
   tahrirlash (mijoz, summa, sana, status, sotuvchi) va o'chirish tugmalari
   bor. "Yangi sotuv" sahifasida admin istalgan xodim nomidan sotuv
   kirita oladi.

Sozlash uchun: `supabase/migration_v4.sql` faylini SQL Editor'da ishga
tushiring (jamoa nomlarini Kunduzgi/Kechkiga o'tkazadi).

## Maosh tizimi, lid analitikasi va davomat (v5)

**Fiksa oylik** — baza (o'zgarmas, admin belgilagan) + bonuslar.
*(Diqqat: bu variantda bonus miqdorlari qattiq belgilanmagan — admin
"Moliya va Plan" bo'limida o'zi moslashtiriladigan bonus qoidalarini
yaratadi. Batafsil: quyidagi "Moslashtiriladigan bonus tizimi (v16)"
bo'limiga qarang.)*

Operator o'z "Hisobot" sahifasida to'liq daromad tarkibini va konversiyasini
doimiy kuzatib borishi mumkin.

**Lid analitikasi (operator, "Hisobot" sahifasida):**
Har kuni jadval ko'rinishida: Prioritet, Aloqa o'rnatildi, Qayta aloqa,
Ma'lumot berildi, To'lovga rozi, Birinchi to'lov, Sotuv — va alohida
Otkaz sabablari: Qimmat, Adashib o'tgan/xato kontakt, Nedozvon, Kerak
emas, Hozir emas. "Umumiy lid" va "Umumiy otkaz" — avtomatik yig'indi,
qo'lda tahrirlanmaydi.

**Admin — Analitika sahifasi** (`/dashboard/admin/analytics`): barcha
xodimlarning lid/otkaz jadvali, ism-familiya bo'yicha, joriy oy uchun.

**Admin — Davomat/Hisobot sahifasi** (`/dashboard/admin/attendance`):
har bir xodim uchun bugungi check-in holati (✅/❎), ishlagan soat,
konversiya — kunlik/haftalik/oylik filtr bilan.

Sozlash uchun: `supabase/migration_v5.sql` faylini SQL Editor'da ishga
tushiring (daily_lead_stats jadvali va RLS siyosatlari).

## Jamoa bo'yicha check-in, taymer va Team Leader (v6)

- **Jamoa bo'yicha check-in vaqti**: Kunduzgi jamoa — 09:50–10:10,
  Kechki jamoa — 13:50–14:10. Davomat bonusi shu oynaga qarab hisoblanadi.
- **Taymer**: bo'sh turish chegarasi 10 daqiqadan **30 daqiqaga**
  o'zgartirildi — operator ishga kirganda taymer avtomatik yonadi,
  30 daqiqa harakatsizlikdan keyingina pauzaga o'tadi, aks holda
  uzluksiz ishlaydi.
- **Team Leader roli**: admin istalgan operatorni "Team Leader" qilib
  belgilashi mumkin (Sotuvchilar boshqaruvida checkbox). Team Leader
  o'z jamoasi uchun qo'shimcha ikkita bo'limga ega bo'ladi:
  - **"Jamoa a'zolari"** (`/dashboard/team/operators`) — o'z jamoasiga
    yangi sotuvchi qo'shish, mavjudlarini tahrirlash/o'chirish
    (faqat o'z jamoasi doirasida).
  - **"Jamoaga task"** (`/dashboard/team/tasks`) — jamoa a'zolariga
    vazifa tayinlash.

Sozlash uchun: `supabase/migration_v6.sql` faylini SQL Editor'da ishga
tushiring (is_team_leader ustuni va tegishli RLS siyosatlari).

## Skriptlar va Qo'ng'iroq tahlili (v7-v8)

- **Skriptlar** — admin sotuv skriptlarini yozadi, sotuvchilar ularni
  ko'rib, qidirib, nusxalab olishlari mumkin.
- **Qo'ng'iroq tahlili (AI)** — sotuvchi qo'ng'iroqni yozib olib
  (telefonning ovoz yozish ilovasi orqali), audio faylni yuklaydi.
  Tizim OpenAI Whisper orqali matnga aylantiradi, so'ng GPT orqali
  tahlil qiladi: qisqacha xulosa, yaxshi/yaxshilash kerak tomonlar,
  mijoz e'tirozlari, tavsiya, umumiy baho. **Bu — qo'ng'iroqdan keyingi
  tahlil, real-vaqt emas** (real-vaqt uchun IP-telefoniya integratsiyasi
  kerak bo'ladi, bu alohida, ancha katta loyiha).

  To'liq sozlash: `scripts/CALL_ANALYSIS_SETUP.md`. Qisqacha:
  `OPENAI_API_KEY` kerak (platform.openai.com), `supabase/migration_v8.sql`
  ishga tushiring, Storage'da **maxfiy** `call-recordings` bucket yarating.

Sozlash uchun: `supabase/migration_v7.sql` (skriptlar) va
`supabase/migration_v8.sql` (qo'ng'iroq tahlili) fayllarini ishga
tushiring.

## Taymer olib tashlandi, oddiy Kirish/Chiqish tizimi (v9)

- **Analitika jadval endi kunlik** — operator "Hisobot" sahifasida sana
  tanlab, joriy oyning istalgan kuniga lid statistikasini kiritishi
  yoki o'zgartirishi mumkin (avval faqat "bugun" edi).
- **Check-in vaqti soddalashtirildi** — endi hamma uchun bir xil: soat
  **10:10gacha** kirsa, "o'z vaqtida" hisoblanadi (jamoaga qarab farq
  qilmaydi).
- **Murakkab, uzluksiz taymer olib tashlandi.** O'rniga:
  - Operator saytga kirganda, agar bugun hali "check-in" qilmagan bo'lsa,
    **motivatsion xabar oynasi** chiqadi (ism, bugungi reja, vazifa,
    oylik natija bilan) — "Ha, boshlaymiz!" tugmasini bosgach check-in
    qayd etiladi.
  - Ish tugaganda, chap menyudagi **"Ishni tugatish"** tugmasi orqali
    check-out qilinadi — shu ikki nuqta orasidagi vaqt ish soati
    sifatida hisoblanadi (uzluksiz kuzatuv, bo'sh turish aniqlash,
    pauza tugmalari — bularning barchasi olib tashlandi, ancha
    soddalashtirildi).

## Qo'ng'iroq sifati — to'liq baholash tizimi (v10)

AI tahlili endi qat'iy strukturaviy baholaydi (1-10 shkalada):
- **Ovoz toni**, **Nutqi**, **Ishonchi**, **Skript bajarilishi** (kompaniyaning
  `scripts` bo'limidagi eng so'nggi skriptiga solishtirib), **Umumiy baho**
- **Success rate** — qo'ng'iroqning sotuvga aylanish ehtimoli (%)
- **Nega sota olmagani**, **sotish uchun maslahat**, **xatolari**
- **SWOT tahlili** (kuchli/zaif tomonlar, imkoniyatlar, tahdidlar)

**Oylik reyting va bonus/ogohlantirish tizimi** (admin → "Qo'ng'iroq
reytingi"):
- O'rtacha baho 8-10: **+500 000 so'm** bonus
- O'rtacha baho 5-8: **+250 000 so'm** bonus
- O'rtacha baho 3-5: qat'iy ogohlantirish + qo'shimcha o'qitish (bonus yo'q)
- O'rtacha baho 0-3: qat'iy ogohlantirish + hayfsan (bonus yo'q)
- 0-3 baho **2 oy ketma-ket** bo'lsa: tizim "⚠️ 2 oy ketma-ket past!"
  ogohlantirishini ko'rsatadi (yakuniy qaror — admin qo'lida, tizim
  avtomatik hech kimni ishdan bo'shatmaydi)

Qo'ng'iroq sifati bonusi endi operatorning umumiy oylik daromadiga ham
avtomatik qo'shiladi (Bosh sahifa va admin Leaderboard'da ko'rinadi).

Sozlash uchun: `supabase/migration_v9.sql` faylini ishga tushiring
(struktura baholash ustunlari).

## AmoCRM qo'ng'iroq vaqti integratsiyasi (v14)

Sotuvchilarning haqiqiy qo'ng'iroq vaqti (AmoCRM'dan) endi
"Moliya va Plan" bo'limidagi bonus qoidalarida **"Qo'ng'iroq daqiqasi"**
ko'rsatkichi sifatida ishlatilishi mumkin — admin o'zi xohlagan
chegara va summani belgilaydi.

### Sozlash (3 qadam)

1. **SQL**: `supabase/migration_v14.sql` faylini ishga tushiring
2. **Har bir operatorni AmoCRM'ga bog'lang**: admin → "Sotuvchilar" →
   xodimni tahrirlash → **"AmoCRM foydalanuvchi ID"** maydoniga
   AmoCRM'dagi shu xodimning foydalanuvchi ID raqamini kiriting
3. **AmoCRM'da webhook sozlang**: AmoCRM sozlamalari → Webhook'lar →
   yangi webhook qo'shing, manzil sifatida:
   ```
   https://salesdashboard-sable.vercel.app/api/amocrm-webhook
   ```
   va "Qo'ng'iroq" (звонок) hodisasini tanlang.

### Muhim eslatma

AmoCRM webhook'ining aniq maydon tuzilishi ba'zan hisobga/ilovaga
qarab farq qilishi mumkin. Shuning uchun qabul qiluvchi kod **xom
(raw) ma'lumotni ham saqlab boradi** — agar birinchi sinov qo'ng'iroqdan
keyin ma'lumot to'g'ri ko'rinmasa, `amocrm_call_logs` jadvalidagi
`raw_payload` ustunini tekshirib, aniqlashtirish mumkin.

## Maosh bo'limi (v15)

Admin uchun yangi **"Maosh"** sahifasi (`/dashboard/admin/salary`) —
istalgan oyni tanlab (oy tanlash maydoni orqali), har bir xodimning
o'sha oy uchun **to'liq maosh hisobotini** ko'rish mumkin:

- Fiksa baza
- Davomat bonusi (necha kun o'z vaqtida kelgani)
- Qo'ng'iroq vaqti bonusi (AmoCRM, necha daqiqa)
- Sotuv bonusi (qancha sotgani va foiz)
- Konversiya bonusi
- Qo'ng'iroq sifati bonusi (AI baholari)
- **Jami** — barcha xodimlar bo'yicha va jamoa umumiy maosh fondi

Bu — mavjud barcha bonus tizimlarini bitta joyda, tarixiy (o'tgan
oylar uchun ham) ko'rish imkonini beradi. Yangi SQL migratsiya
kerak emas — mavjud jadvallardan foydalaniladi.

## Moslashtiriladigan bonus tizimi (v15-v16)

Bu — "Liderlik Zamoni" varianti uchun eng katta farq: qattiq
belgilangan bonus formulasi o'rniga, admin **"Moliya va Plan"**
sahifasidagi **"Bonus qoidalari"** bo'limida o'zi cheksiz sonda
bonus qoidasi yaratishi mumkin.

### Har bir qoida quyidagilardan iborat

1. **Nom** — erkin matn (masalan "Oyda 15 mln so'mdan sotgan uchun")
2. **Ko'rsatkich** — quyidagilardan biri:
   - Sotuv summasi (oylik, so'm)
   - Olib kelingan mijozlar soni (tasdiqlangan sotuvlar soni)
   - Konversiya foizi
   - O'z vaqtida kelgan kunlar soni (check-in)
   - Qo'ng'iroq daqiqasi (AmoCRM, oylik)
   - Qo'ng'iroq sifati o'rtacha bahosi (AI, 1-10)
3. **Shart** — kattaroq/teng (>=), kichikroq/teng (<=), yoki oraliqda
4. **Bonus turi** — belgilangan summa (so'm) yoki foiz (ko'rsatkich
   qiymatidan necha foiz)

### Misollar

- "10 mln+ sotuv bonusi": ko'rsatkich=Sotuv summasi, shart=`>= 10000000`,
  tur=Foiz, qiymat=`7` → 10 mln so'mdan ortiq sotgan xodim sotuv
  summasidan 7% bonus oladi.
- "5 ta yangi mijoz": ko'rsatkich=Olib kelingan mijozlar soni,
  shart=`>= 5`, tur=Summa, qiymat=`300000` → 300 000 so'm bonus.
- "Yaxshi konversiya": ko'rsatkich=Konversiya foizi, shart=`oraliqda`
  (3 dan 5 gacha), tur=Summa, qiymat=`200000`.

Bir vaqtning o'zida bir nechta qoida qo'llanishi mumkin — ularning
barchasi qo'shiladi. Qoidani **yoqish/o'chirish** (vaqtincha to'xtatish)
yoki **butunlay o'chirish** mumkin. Har bir xodimning umumiy oylik
maoshi: **fiksa baza + barcha qo'llangan bonuslar yig'indisi** —
buni "Bosh sahifa" (shaxsiy), Leaderboard, va admin **"Maosh"**
sahifasida (istalgan oy uchun) ko'rish mumkin.

Sozlash uchun: `supabase/migration_v15.sql` faylini ishga tushiring.

## Rasmiy maosh reglamenti (v16)

Bu — "Liderlik Zamoni"ning **haqiqiy, rasmiy** oylik daromad formulasi,
to'liq avtomatlashtirilgan holda.

### Tarkib

**Oylik daromad = FIX maosh + Sotuv komissiyasi + Qo'shimcha bonuslar +
Jamoaviy mukofotlar (agar admin qo'shsa)**

### FIX maosh — har kuni 4 ta ko'rsatkich (jami maksimal 70 000/kun)

| Ko'rsatkich | Shart | Ball |
|---|---|---|
| Davomat | 09:30–09:40 check-in | +20 000 |
| | 09:40–10:00 check-in | 0 |
| | 10:00 dan keyin | −20 000 |
| Call Time | 150+ daqiqa | +25 000 |
| | 90–149 daqiqa | 0 |
| | 0–89 daqiqa | −25 000 |
| CRM nazorati | Barcha talab bajarilgan (admin belgilaydi) | +15 000 |
| | Kamida bitta buzilgan | −15 000 |
| Trening | To'liq qatnashgan (admin belgilaydi) | +10 000 |
| | Sababsiz qatnashmagan | −10 000 |

**Muhim:** CRM nazorati va Trening ko'rsatkichlari — admin tomonidan
har kuni qo'lda baholanadi (**"Davomat / Hisobot"** sahifasidagi
**"Kunlik nazorat"** bo'limi orqali), chunki bular chuqur CRM-vazifa
integratsiyasi va rahbar bahosini talab qiladi.

### Sotuv KPI (komissiya) — oylik aylanmaga qarab

| Aylanma | Foiz |
|---|---|
| 0–29 mln | 0% |
| 30–39 mln | 1% |
| 40–59 mln | 2% |
| 60–69 mln | 3% |
| 70–89 mln | 4% |
| 90–109 mln | 5% |
| 110–129 mln | 6% |
| 130–149 mln | 7% |
| 150–179 mln | 8% |
| 180–199 mln | 9% |
| 200 mln+ | 10% |

### Qo'shimcha bonuslar

- **Kunlik sotuv bonusi**: kuniga 1–3 ta to'liq to'lov bo'lsa +100 000 so'm
- **Demo bonusi**: har bir demo darsga kelgan mijoz uchun +10 000 so'm
  (operator o'zi "Hisobot" sahifasida kiritadi)
- **Konsultatsiya rag'bati**: agar sotuvchi mijozni konsultatsiyaga olib
  kelgan va yakuniy sotuvni ekspert yopgan bo'lsa — sotuvchi asosiy
  komissiya o'rniga +70 000 so'm oladi (admin "Invoices" bo'limida
  sotuvni tahrirlab, "Konsultatsiya orqali yopilgan" belgisini qo'yadi)

### Jamoaviy mukofotlar

Bu — hali aniq shartlari belgilanmagan qism. Hozircha admin
**"Moliya va Plan"** bo'limidagi moslashtiriladigan **"Bonus
qoidalari"** orqali istalgan qo'shimcha jamoaviy/maxsus mukofot
qo'sha oladi — bu tizim yuqoridagi rasmiy formula ustiga qo'shimcha
sifatida ishlaydi.

Sozlash uchun: `supabase/migration_v16.sql` faylini ishga tushiring.

## AmoCRM CRM nazorati avtomatlashtirilishi (v17)

"FIX maosh"dagi **CRM nazorati** ko'rsatkichining bir qismi endi
AmoCRM Task API orqali **avtomatik** tekshiriladi (har 3 soatda):

- ✅ 1 soatdan ortiq muddati o'tgan bajarilmagan vazifa bor-yo'qligi
- ✅ Kelgusi (bajarilmagan) vazifa umuman bor-yo'qligi ("Next Task")

**Cheklov (ochiq aytilgan):** "har bir qo'ng'iroqdan keyin mijoz
kartasi yangilanishi" — bu talabni ishonchli avtomatlashtirish juda
murakkab (chuqur qo'ng'iroq-lid bog'lanishini talab qiladi), shuning
uchun bu qism admin xohlaganda **qo'lda** ustidan yozib qo'yilishi
mumkin bo'lgan taklif sifatida qoladi.

### Sozlash

1. AmoCRM → **Sozlamalar → Integratsiyalar → "+ Yaratish"**
2. Yangi integratsiya yarating, **"Keys and scopes"** bo'limida
   **"Uzoq muddatli token" (Long-lived token)** generatsiya qiling
3. `.env.local` (va Vercel'ga) qo'shing:
   ```
   AMOCRM_SUBDOMAIN=sizning-subdomeningiz
   AMOCRM_ACCESS_TOKEN=uzoq-muddatli-tokeningiz
   ```
4. Har bir operatorning **"AmoCRM foydalanuvchi ID"** maydoni
   (Sotuvchilar bo'limida) to'g'ri to'ldirilganiga ishonch hosil qiling
5. Vercel'da avtomatik ravishda har 3 soatda ishga tushadi
   (`vercel.json`dagi cron sozlamasi orqali)

**Eslatma:** Vercel **Hobby** rejasi cron chastotasini cheklashi
mumkin (ba'zan kuniga 1 martagacha). Agar bu muammo bo'lsa, tashqi
bepul xizmat (masalan [cron-job.org](https://cron-job.org)) orqali
`https://saytingiz.vercel.app/api/amocrm-crm-check` manzilini
`Authorization: Bearer CRON_SECRET_qiymatingiz` header bilan har
3 soatda chaqirib turishingiz mumkin.

## Yangi tariflar va CRM lid voronkasi (v18)

### Tariflar

| Nomi | Narxi | Turi |
|---|---|---|
| Onlayn Start | 3 000 000 so'm | Onlayn |
| Premyum | 7 000 000 so'm | Oflayn |
| VIP | 10 000 000 so'm | — |

### Lid voronkasi (bosqichlar)

1. Yangi lid
2. Qayta aloqa
3. Aloqa o'rnatildi
4. Ma'lumot berildi
5. Demoga yozildi
6. Demoga keladi
7. Shartnoma
8. **Won** (yutildi — sotuv)

### Lost sabablari

Sabab noma'lum, Qimmat, Nedozvon, Kerak emas, Dubl, Adashib o'tgan,
Kontaktda xatolik, Hozir emas.

**Umumiy lid** = barcha bosqichlar + barcha Lost sabablari yig'indisi
(qo'lda tahrirlanmaydi, avtomatik hisoblanadi). **Konversiya** =
Won / Umumiy lid.

### Admin — kunlik analitika

**"Analitika"** sahifasida endi **"Kunlik"** va **"Oylik (jami)"**
rejimlari mavjud. Kunlik rejimda sana tanlab, o'sha aniq kunning
har bir xodim bo'yicha to'liq voronka holatini (har bir bosqich va
Lost sababi alohida ustunda) ko'rish mumkin — bu admin uchun har
kunlik nazorat vositasi.

Sozlash uchun: `supabase/migration_v17.sql` faylini ishga tushiring.

## Texnologiyalar

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Supabase (Postgres, Auth, Storage, Realtime)
- Recharts (grafiklar)
- Lucide React (ikonkalar)
