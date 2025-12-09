# 🚀 SoundProfit Market - QUICK START

## ⚡ Get Started in 3 Steps

### Step 1: Install Dependencies ✅ (DONE)
```bash
npm install
cd backend_api && npm install
```

### Step 2: Configure Database

**Option A: Use Cloud Database (Recommended)**
1. Go to [Railway](https://railway.app) or [Supabase](https://supabase.com)
2. Create a free PostgreSQL database
3. Copy the connection string
4. Paste it in `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

**Option B: Use Local PostgreSQL**
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create database: `createdb soundprofit`
3. Update `.env`:
   ```env
   DATABASE_URL=postgresql://localhost:5432/soundprofit
   ```

### Step 3: Initialize & Start

```bash
# Initialize database
npm run init-db

# Start the server
npm start
```

**That's it!** Open http://localhost:3000

---

## 🔑 Default Login

**Admin Account:**
- Email: `admin@soundprofit.market`
- Password: `admin123`

**⚠️ Change this password immediately after first login!**

---

## 💰 Your Commission Wallet

All platform commissions (2% of sales) go to:
```
0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402
```

This is already configured in the database and `.env` file.

---

## 🌐 Deploy to Internet

### Fastest Way: Render.com

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "SoundProfit Market"
   git remote add origin <your-github-url>
   git push -u origin main
   ```

2. **Deploy:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Click "Apply"
   - **Done!** You'll get a public URL

3. **Share the URL:**
   - Share on WhatsApp, Twitter, Facebook
   - Users can register and start buying/selling music
   - You earn 2% commission on all sales!

---

## 📱 Install as Mobile App

Your platform is a PWA (Progressive Web App):

**Android:**
1. Open your URL in Chrome
2. Tap "Add to Home Screen"
3. App installs on phone

**iPhone:**
1. Open your URL in Safari
2. Tap Share → "Add to Home Screen"
3. App installs on phone

---

## 🎵 How It Works

### For Artists:
1. Register as Artist
2. Upload music (MP3, WAV, FLAC)
3. Set price
4. Connect MetaMask wallet
5. Earn 98% of sales

### For Buyers:
1. Register as Buyer
2. Browse marketplace
3. Preview songs
4. Buy with MetaMask
5. Download purchased tracks

### For You (Admin):
1. Login to admin panel: `/#admin`
2. View platform statistics
3. Manage users and content
4. Track commissions
5. Resolve disputes

---

## 🔧 Troubleshooting

**"Database connection failed"**
- Check your DATABASE_URL in `.env`
- Make sure PostgreSQL is running

**"npm install failed"**
- Delete `node_modules` folders
- Run `npm run install-all` again

**"Port 3000 already in use"**
- Change PORT in `.env` to 3001 or another port

---

## 📚 Full Documentation

- **Complete Guide**: [README.md](file:///c:/Users/USUARIO/.gemini/antigravity/scratch/soundprofit_market/README.md)
- **Deployment**: [DEPLOY_GUIDE.md](file:///c:/Users/USUARIO/.gemini/antigravity/scratch/soundprofit_market/DEPLOY_GUIDE.md)
- **Implementation**: [walkthrough.md](file:///C:/Users/USUARIO/.gemini/antigravity/brain/2f0cfc02-6daa-4225-b0a5-71cee8ca3fba/walkthrough.md)

---

## ✅ What's Ready

- ✅ Complete database schema
- ✅ User authentication
- ✅ Song upload/download
- ✅ Blockchain payments
- ✅ Commission routing to your wallet
- ✅ PWA support
- ✅ Admin panel
- ✅ Legal documents
- ✅ Deployment scripts

---

## 🎉 You're Ready to Launch!

**Next Steps:**
1. ✅ Dependencies installed
2. ⏳ Configure database
3. ⏳ Run `npm run init-db`
4. ⏳ Run `npm start`
5. ⏳ Deploy to Render/Railway
6. ⏳ Share your link!

**Start earning commissions today! 💰**
