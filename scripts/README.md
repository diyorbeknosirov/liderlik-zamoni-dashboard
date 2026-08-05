# Birinchi admin hisobini yaratish

Supabase Auth orqali foydalanuvchi yaratishning eng oson yo'li — Supabase Dashboard.

## 1. Admin foydalanuvchisini yaratish

1. Supabase loyihangizda: **Authentication → Users → Add user → Create new user**
2. Email va parol kiriting (masalan `admin@start.uz` / kuchli parol)
3. **"Auto Confirm User"** belgisini albatta yoqing (aks holda email tasdiqlash talab qilinadi)
4. **"Create user"** tugmasini bosing

Bu avtomatik ravishda `profiles` jadvalida yangi qator yaratadi (trigger orqali), lekin
default rol `operator` bo'ladi — buni admin qilib o'zgartirish kerak:

## 2. Rolni "admin" ga o'zgartirish

**SQL Editor** ga o'ting va quyidagini bajaring (email manzilini o'zingiznikiga almashtiring):

```sql
update profiles
set role = 'admin', first_name = 'Nodirbek', last_name = 'Mentor'
where id = (select id from auth.users where email = 'admin@start.uz');
```

## 3. Operatorlarni qo'shish

Ikkita yo'l bor:

**A) Ilova ichidan (tavsiya etiladi):** Admin sifatida kirib, "Sotuvchilar" bo'limidan
"Qo'shish" tugmasi orqali — bu avtomatik ravishda auth foydalanuvchisi va profilni yaratadi.

**B) Supabase Dashboard orqali (yuqoridagi 1-qadam kabi):** Har bir operator uchun
alohida foydalanuvchi yarating, so'ng SQL orqali `team`, `monthly_plan`, `fixed_salary`
maydonlarini to'ldiring:

```sql
update profiles
set team = 'Alpha', monthly_plan = 45000000, fixed_salary = 3000000, bonus_rate = 0.08,
    first_name = 'Diyorbek', last_name = 'Qodirov'
where id = (select id from auth.users where email = 'diyorbek@start.uz');
```

## Operator qo'shish/o'chirish — endi to'liq xavfsiz

Ilova ichidagi "Sotuvchilar → Qo'shish" formasi endi server tomonidagi
maxfiy **service role** kaliti orqali ishlaydi (`app/api/create-operator`
va `app/api/delete-operator` route'lari). Bu quyidagilarni ta'minlaydi:

- Yangi operator qo'shilganda **admin sessiyasi almashtirilmaydi** —
  avvalgi versiyada bu muammo bor edi (admin o'zini yo'qotib, yangi
  operator sifatida kirib qolishi mumkin edi).
- Yangi hisob **email tasdiqlashsiz** darhol ishlatishga tayyor bo'ladi.
- "O'chirish" tugmasi endi operatorni **to'liq** (auth hisobi bilan
  birga) o'chiradi, faqat profil qatorini emas.

Bu ishlashi uchun `.env.local` (va Vercel) da `SUPABASE_SERVICE_ROLE_KEY`
sozlangan bo'lishi shart — Telegram integratsiyasi uchun buni allaqachon
sozlagan bo'lsangiz, qo'shimcha hech narsa kerak emas.
