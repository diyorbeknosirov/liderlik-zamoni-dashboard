# VPS'ga joylashtirish — to'liq qo'llanma

Bu qo'llanma nol nuqtadan boshlab, Ubuntu VPS serverida saytingizni doimiy
ishlaydigan qilib sozlaydi (PM2 + Nginx + bepul SSL).

## 0-qadam: VPS sotib olish

Istalgan provayderdan (DigitalOcean, Hetzner, Vultr, mahalliy provayder)
eng arzon **Ubuntu 22.04** VPS'ni sotib oling (odatda 1GB RAM yetarli).
Sizga quyidagilar beriladi:
- Server IP manzili (masalan `95.163.xxx.xxx`)
- Root parol yoki SSH kalit

## 1-qadam: Serverga ulanish

Kompyuteringizda terminal/PowerShell oching:

```bash
ssh root@SERVER_IP_MANZILINGIZ
```

Parolni kiriting (birinchi marta ulanishda "yes" deb tasdiqlash so'raladi).

## 2-qadam: Kerakli dasturlarni o'rnatish

Serverda (endi siz serverning ichidasiz) ketma-ket bajaring:

```bash
# Tizimni yangilash
apt update && apt upgrade -y

# Node.js 20 o'rnatish
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Tekshirish
node -v
npm -v

# Git o'rnatish
apt install -y git

# PM2 o'rnatish (saytni doim ishlab turadigan qiluvchi vosita)
npm install -g pm2

# Nginx o'rnatish (veb-server, domenni ilovaga ulaydi)
apt install -y nginx
```

## 3-qadam: Loyihani serverga yuklash

```bash
cd /var/www
git clone https://github.com/diyorbeknosirov/Salesdashboard.git sales-dashboard
cd sales-dashboard
```

## 4-qadam: Muhit o'zgaruvchilarini sozlash

```bash
nano .env.local
```

Ichiga (mahalliy kompyuteringizdagi bilan bir xil) qiymatlarni yozing:

```
NEXT_PUBLIC_SUPABASE_URL=https://ktnkxuoafqvxiekikknw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sizning_anon_kalitingiz
GOOGLE_SHEETS_CLIENT_EMAIL=... (agar sozlagan bo'lsangiz)
GOOGLE_SHEETS_PRIVATE_KEY=...
GOOGLE_SHEETS_SPREADSHEET_ID=...
```

Saqlash: **Ctrl+O**, Enter, chiqish: **Ctrl+X**

## 5-qadam: Loyihani build qilish va ishga tushirish

```bash
npm install
npm run build
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup
```

Oxirgi buyruq (`pm2 startup`) sizga bitta qo'shimcha buyruq ko'rsatadi —
uni nusxalab, alohida ishga tushiring (bu server qayta yoqilganda saytni
avtomatik ko'taradi).

Tekshirish:
```bash
pm2 status
```

`sales-dashboard` — "online" holatida ko'rinishi kerak.

## 6-qadam: Nginx'ni sozlash (domenni ulash)

Agar domeningiz bo'lsa (masalan `sales.deepai.uz`), uning DNS sozlamalarida
**A record** qo'shing: domen provayderingizda `sales` (yoki `@`) uchun
serveringiz IP manzilini ko'rsating.

Serverda:

```bash
nano /etc/nginx/sites-available/sales-dashboard
```

`deploy/nginx.conf.example` faylidagi matnni joylashtiring, `sales.deepai.uz`
o'rniga o'z domeningizni yozing. Saqlang (Ctrl+O, Enter, Ctrl+X).

```bash
ln -s /etc/nginx/sites-available/sales-dashboard /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

Agar domen hali yo'q bo'lsa, saytga to'g'ridan-to'g'ri
`http://SERVER_IP:3000` orqali kirish mumkin (SSL'siz, vaqtinchalik).

## 7-qadam: Bepul SSL sertifikat (https://)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d sales.deepai.uz
```

Savollarga javob bering (email kiriting, shartlarga rozilik bildiring).
Tugagach, saytingiz **https://sales.deepai.uz** orqali xavfsiz ishlaydi.

## Kelajakda yangilanish qanday qilinadi

Har safar men (yoki siz) kodga o'zgartirish kiritib, GitHub'ga push
qilinganda, serverda shu ikkita buyruqni bajarish kifoya:

```bash
cd /var/www/sales-dashboard
bash deploy/deploy.sh
```

Bu skript avtomatik: yangi kodni oladi, paketlarni o'rnatadi, qayta build
qiladi va PM2 orqali qayta ishga tushiradi — sayt bir necha soniyagina
uzilib, keyin yangilangan holda davom etadi.

## Foydali buyruqlar

```bash
pm2 status              # sayt ishlab turibdimi tekshirish
pm2 logs sales-dashboard  # xatoliklarni ko'rish (jonli)
pm2 restart sales-dashboard  # qayta ishga tushirish
```

## Telegram kunlik hisobot (ixtiyoriy, lekin VPS'da eng qulay)

Agar Telegram bot orqali kunlik hisobot funksiyasini ishlatmoqchi bo'lsangiz,
`scripts/TELEGRAM_SETUP.md` faylidagi 6-qadamga qarang — u yerda crontab
orqali har kuni soat 23:50 da avtomatik ishga tushirishni sozlash
ko'rsatilgan. Bu aynan VPS uchun eng oson yechim (Vercel'da bunday aniq
vaqtli avtomatik ishlarni bepul rejada sozlash noqulay).

## Muhim eslatmalar

- Supabase hali ham bulutda (o'zgarishsiz) qoladi — faqat sayt (frontend)
  o'z serveringizga ko'chadi, ma'lumotlar bazasi emas.
- Agar Google Sheets integratsiyasini ishlatsangiz, `.env.local` faylida
  o'sha uchta o'zgaruvchini ham serverda to'g'ri kiritganingizga ishonch
  hosil qiling.
- Xavfsizlik uchun tavsiya: `ufw` (firewall) yoqing va faqat 80, 443, 22
  portlarini oching:
  ```bash
  ufw allow 22
  ufw allow 80
  ufw allow 443
  ufw enable
  ```
