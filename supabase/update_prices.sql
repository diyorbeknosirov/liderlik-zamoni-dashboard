-- Tarif narxlarini yangilash (agar kelajakda narx o'zgarsa, shu yerdan)
update tariffs set price = 3000000 where id = 'online_start';
update tariffs set price = 7000000 where id = 'premyum';
update tariffs set price = 10000000 where id = 'vip';

-- Tekshirish
select * from tariffs;
