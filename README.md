# Bot Line Admin Panel 🤖

Admin panel สำหรับจัดการระบบ Bot Line IQ ด้วย React และ TypeScript

## ✨ Features

- 📊 **Dashboard** - ภาพรวมระบบ สถิติผู้ใช้ และการใช้งานเครดิต
- 👥 **จัดการผู้ใช้** - ดูข้อมูลผู้ใช้ และจัดการเครดิตรายบุคคล
- 💰 **ระบบเครดิต** - ติดตามธุรกรรม เพิ่ม/หักเครดิต และเพิ่มเครดิตแบบกลุ่ม
- 🤖 **จัดการคำสั่งบอท** - เพิ่ม แก้ไข ลบ และเปิด/ปิดคำสั่ง
- 🔐 **ระบบ Authentication** - เข้าสู่ระบบด้วย JWT

## 🚀 การติดตั้ง

### ข้อกำหนดเบื้องต้น
- Node.js 16+ 
- npm หรือ yarn
- Backend server ทำงานที่ port 5000

### ขั้นตอนการติดตั้ง

1. เข้าไปยังโฟลเดอร์โปรเจค
```bash
cd bot-line-admin
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. สร้างไฟล์ `.env` และกำหนดค่า
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. รันโปรเจค
```bash
npm start
```

แอพจะเปิดที่ http://localhost:3000

## 🎨 เทคโนโลยีที่ใช้

- **React 19** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching & caching
- **React Router** - Routing
- **Chart.js** - Data visualization
- **Framer Motion** - Animations
- **Axios** - HTTP client

## 📁 โครงสร้างโปรเจค

```
src/
├── components/       # React components
│   ├── common/      # Shared components
│   └── layout/      # Layout components
├── contexts/        # React contexts
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## 🔑 การใช้งาน

### เข้าสู่ระบบ
ใช้ username และ password ของแอดมินที่ลงทะเบียนไว้ในระบบ

### API Endpoints ที่ใช้
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/admin/dashboard` - ข้อมูล dashboard
- `GET /api/admin/users` - รายการผู้ใช้
- `POST /api/admin/credits/add/:userId` - เพิ่ม/หักเครดิต
- `GET /api/admin/commands` - รายการคำสั่ง
- และอื่นๆ

## 🎯 หน้าจอหลัก

1. **Dashboard** - สรุปภาพรวมระบบ กราฟผู้ใช้รายวัน และการใช้เครดิต
2. **ผู้ใช้งาน** - ตารางแสดงผู้ใช้ทั้งหมด พร้อมฟิลเตอร์และการจัดการเครดิต
3. **จัดการเครดิต** - ประวัติธุรกรรมเครดิต และเพิ่มเครดิตแบบกลุ่ม
4. **คำสั่งบอท** - จัดการคำสั่งแบ่งตามหมวดหมู่

## 🌙 ธีม
แอพใช้ธีม Dark mode สไตล์ไฮเทค พร้อม glass morphism effects และ neon glow

## 📝 หมายเหตุ
- ต้องรัน Backend server ก่อนใช้งาน Admin panel
- ใช้ proxy ใน development เพื่อหลีกเลี่ยงปัญหา CORS
- Token จะถูกเก็บใน localStorage
