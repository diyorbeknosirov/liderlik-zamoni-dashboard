# Google Sheets integratsiyasini sozlash

Bu funksiya har bir yangi sotuvni (va admin xohlaganda barcha invoice'larni)
avtomatik ravishda Google Sheets jadvaliga yozib boradi.

## 1. Google Cloud loyihasi va xizmat hisobi (service account) yaratish

1. [console.cloud.google.com](https://console.cloud.google.com) ga o'ting
2. Yangi loyiha yarating (yoki mavjudini tanlang)
3. Yuqoridagi qidiruvdan **"Google Sheets API"** ni toping va **"Enable"** qiling
4. Chap menyudan **"APIs & Services" → "Credentials"** ga o'ting
5. **"Create Credentials" → "Service Account"** ni tanlang
6. Nom bering (masalan `sales-dashboard-sheets`), **"Create and Continue"** → **"Done"**
7. Yaratilgan xizmat hisobini bosing → **"Keys"** yorlig'i → **"Add Key" → "Create new key"** → **JSON** formatini tanlang → yuklab oling

Yuklab olingan JSON faylida ikkita muhim maydon bor:
- `client_email` — masalan `sales-dashboard-sheets@your-project.iam.gserviceaccount.com`
- `private_key` — uzun matn, `-----BEGIN PRIVATE KEY-----` bilan boshlanadi

## 2. Google Sheets jadvalini yaratish va ruxsat berish

1. [sheets.google.com](https://sheets.google.com) da yangi jadval yarating
2. Pastki yorliqni (Sheet1) **"Invoices"** deb nomlang (aynan shu nom kerak)
3. Jadval manzilidagi ID'ni nusxalang — URL shunday ko'rinadi:
   `https://docs.google.com/spreadsheets/d/BU_YERDA_ID/edit`
4. **"Share"** (Ulashish) tugmasini bosing va yuqoridagi `client_email`ni
   **"Editor"** huquqi bilan qo'shing (aynan xizmat hisobi emailini, sizning
   shaxsiy emailingizni emas)

## 3. Muhit o'zgaruvchilarini sozlash

### Mahalliy (`.env.local`)

```
GOOGLE_SHEETS_CLIENT_EMAIL=sales-dashboard-sheets@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...ko'p qatorli matn...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1a2b3c4d5e6f7g8h9i0jKLmnopQRstuVWXyz
```

**Muhim:** `private_key`ni JSON fayldan nusxalaganda, undagi `\n` belgilarini
**o'zgartirmang** — ular qatorlarni ajratish uchun kerak. Butun qiymatni
qo'shtirnoq ichida joylashtiring.

### Vercel'da

**Settings → Environment Variables** bo'limida xuddi shu uchta o'zgaruvchini
qo'shing (Production, Preview, Development — barchasi uchun), so'ng loyihani
qayta deploy qiling (Redeploy).

## 4. Sinab ko'rish

Ilovada admin sifatida **Invoices** sahifasiga o'ting va **"Google Sheets'ga
yuborish"** tugmasini bosing. Muvaffaqiyatli bo'lsa, jadvalingizda "Invoices"
varag'ida sarlavha qatori va barcha yozuvlar paydo bo'ladi.

Bundan keyin har bir yangi sotuv ("Yangi sotuv kiritish" formasi orqali)
avtomatik ravishda jadvalga qo'shiladi — buning uchun alohida tugma bosish
shart emas.

## Nosozliklarni bartaraf etish

- **"Google Sheets muhit o'zgaruvchilari sozlanmagan"** — `.env.local` yoki
  Vercel'da o'zgaruvchilar to'g'ri kiritilmagan yoki server qayta ishga
  tushirilmagan.
- **403 / permission denied** — xizmat hisobi emailiga jadvalda "Editor"
  huquqi berilmagan (2-qadamga qarang).
- **404 spreadsheet not found** — `GOOGLE_SHEETS_SPREADSHEET_ID` noto'g'ri
  yoki jadval o'chirilgan.
