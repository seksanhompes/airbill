# บันทึกค่าแอร์รายวัน (PWA + Cloudflare Pages Functions + D1)

ฟีเจอร์:
- ✅ บันทึกค่าแอร์แบบรวดเร็ว (เลือกวันที่/ผู้จ่าย/จำนวนเงิน/หมายเหตุ)
- ✅ ประวัติ + รวมยอด พร้อมแก้ไข/ลบ
- ✅ จัดการรายชื่อผู้จ่าย (เพิ่ม/แก้ชื่อ/ปิดใช้งาน)
- ✅ กราฟรายวัน/รายเดือน/รายปี พร้อมเลือกช่วงเวลาและคน
- ✅ PWA ติดตั้งเป็นไอคอนมือถือ ใช้งานออฟไลน์ (คิวออฟไลน์ + ซิงค์เมื่อออนไลน์)

## โครงสร้าง

```
/ (Pages root)
  index.html
  styles.css
  app.js
  sw.js
  manifest.webmanifest
  /icons
    icon-192.png
    icon-512.png
  /functions
    /api
      /people
        index.js       (GET/POST)
        [id].js        (PUT/DELETE)
      /payments
        index.js       (GET/POST)
        [id].js        (PUT/DELETE)
        stats.js       (GET)
  /migrations
    001_init.sql
    002_indexes.sql
  wrangler.toml
```

## ขั้นตอนใช้งาน (ย่อ)

1) สร้าง D1
```
wrangler d1 create air-bill-db
```
จด `database_id` มาใส่ใน `wrangler.toml` ตรง `YOUR_D1_DATABASE_ID`

2) รัน migrations (ครั้งแรก)
```
wrangler d1 execute air-bill-db --file=./migrations/001_init.sql
wrangler d1 execute air-bill-db --file=./migrations/002_indexes.sql
```

3) ทดสอบในเครื่อง (Pages Functions)
```
wrangler pages dev . --d1=DB
```

4) Deploy ไป Cloudflare Pages
- สร้างโปรเจ็กต์ Pages แล้วเชื่อม Git โฟลเดอร์นี้ (หรืออัปโหลดไฟล์ zip)
- ใน **Settings → Functions → D1 Bindings** เพิ่ม Binding ชื่อ `DB` ชี้ไปที่ D1 ที่สร้างไว้
- Deploy

> ถ้าต้องการ seed รายชื่อผู้จ่าย ให้เพิ่มผ่านหน้า "รายชื่อ" หรือ insert เองในตาราง `people`