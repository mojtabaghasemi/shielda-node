# Shielda Captcha for Node.js (پکیج رسمی نودجی‌اس شیلدا)

[![npm version](https://img.shields.io/npm/v/shielda-captcha.svg)](https://www.npmjs.com/package/shielda-captcha)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

پکیج رسمی Node.js برای سرویس ضد ربات و کپچای **شیلدا (Shielda)**. سازگار با تمامی فریم‌ورک‌های وب از جمله **Express**، **Fastify**، **Nest.js** و **Next.js**.

---

## 📦 نصب با npm یا yarn

```bash
npm install shielda-captcha
# یا
yarn add shielda-captcha
# یا
pnpm add shielda-captcha
```

---

## 🚀 نحوه استفاده

### ۱. استفاده مستقیم

```javascript
const { Shielda } = require('shielda-captcha');

const shielda = new Shielda({
  siteKey: process.env.SHIELDA_SITE_KEY,
  secretKey: process.env.SHIELDA_SECRET_KEY,
});

// اعتبارسنجی توکن
async function handleLogin(req, res) {
  const token = req.body['darban-captcha-response'];

  const isValid = await shielda.verify(token);
  if (!isValid) {
    return res.status(400).json({ error: 'کپچا تایید نشد.' });
  }

  // فرآیند ورود کاربر...
}
```

### ۲. میدل‌ور آماده Express

```javascript
const express = require('express');
const { Shielda } = require('shielda-captcha');

const app = express();
app.use(express.json());

const shielda = new Shielda({
  siteKey: 'YOUR_SITE_KEY',
  secretKey: 'YOUR_SECRET_KEY',
});

// استفاده به صورت میدل‌ور خودکار
app.post('/api/login', shielda.middleware(), (req, res) => {
  res.json({ message: 'کپچا با موفقیت تایید شد و ورود انجام شد.' });
});
```

---

## 📄 لایسنس
[MIT License](LICENSE) - [https://shielda.ir](https://shielda.ir)
