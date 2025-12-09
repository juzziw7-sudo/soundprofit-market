# SoundProfit Market - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: One-Click Cloud Deployment

#### Deploy to Render.com (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SoundProfit Market"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically
   - Click "Apply" to deploy
   - **Database and Web Service will be created automatically**

3. **Access Your Platform**
   - Render will provide a URL: `https://soundprofit-market.onrender.com`
   - Share this URL with users!

#### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Get URL
railway domain
```

### Option 2: Docker Deployment (Any Server)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Your platform is now running on http://localhost:3000
```

### Option 3: Local Installation

**Windows:**
```powershell
.\install.ps1
```

**Linux/Mac:**
```bash
chmod +x install.sh
./install.sh
```

## 🌐 Making Your Platform Accessible

### Get a Shareable Link

After deploying to Render/Railway/Vercel, you'll get a public URL like:
- `https://soundprofit-market.onrender.com`
- `https://soundprofit-market.up.railway.app`
- `https://soundprofit-market.vercel.app`

**Share this link:**
- On social media (Twitter, Facebook, Instagram)
- Via WhatsApp, Telegram, Discord
- In your email signature
- On your website

### Custom Domain (Optional)

1. Buy a domain (e.g., `soundprofit.market` from Namecheap, GoDaddy)
2. In Render/Railway settings, add custom domain
3. Update DNS records as instructed
4. Your platform will be accessible at your custom domain!

## 📱 Mobile App Distribution

### Progressive Web App (PWA)

Your platform is already a PWA! Users can install it:

**Android:**
1. Open the URL in Chrome
2. Tap menu → "Add to Home Screen"
3. App icon appears on home screen

**iOS:**
1. Open the URL in Safari
2. Tap Share → "Add to Home Screen"
3. App icon appears on home screen

**Desktop:**
1. Open the URL in Chrome/Edge
2. Click install icon in address bar
3. App opens as standalone window

### Submit to App Stores (Future)

To distribute via Google Play Store or Apple App Store:
1. Use a tool like [PWABuilder](https://www.pwabuilder.com/)
2. Generate native app packages
3. Submit to stores

## 💰 Commission Verification

Your admin wallet is configured to receive 2% of all sales:

**Wallet Address:**
```
0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402
```

**Verify commissions:**
1. Check wallet balance on [Etherscan](https://etherscan.io/address/0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402)
2. View transaction history in admin panel: `/#admin`
3. Check database: `SELECT * FROM blockchain_transactions WHERE is_commission = true`

## 🔧 Post-Deployment Configuration

### 1. Update Environment Variables

In your cloud platform dashboard, set:
```
DATABASE_URL=<provided-by-render>
JWT_SECRET=<generate-secure-random-string>
ADMIN_WALLET_ADDRESS=0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402
NODE_ENV=production
```

### 2. Initialize Database

The database will be initialized automatically on first deployment. If needed, run manually:
```bash
npm run init-db
```

### 3. Change Admin Password

1. Login as admin: `admin@soundprofit.market` / `admin123`
2. Go to Settings
3. Change password immediately!

### 4. Configure Email (Optional)

For transaction notifications:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📊 Monitoring & Analytics

### View Platform Statistics

- **Admin Dashboard**: `https://your-url.com/#admin`
- **Commission Tracking**: `https://your-url.com/api/blockchain/commissions`
- **User Count**: `https://your-url.com/api/admin/stats`

### Database Access

**Render.com:**
- Dashboard → Database → "Connect"
- Use provided credentials with pgAdmin or DBeaver

**Railway:**
```bash
railway connect
```

## 🛡️ Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS (automatic on Render/Railway)
- [ ] Configure CORS for your domain
- [ ] Set up database backups
- [ ] Monitor error logs regularly

## 🚨 Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is correct
- Ensure database is running
- Verify network connectivity

### "Upload failed"
- Configure AWS S3 for persistent storage
- Or use cloud platform's persistent volumes

### "Blockchain transaction failed"
- Check user has MetaMask installed
- Verify sufficient ETH for gas fees
- Ensure correct network (mainnet/testnet)

## 📈 Scaling

### Increase Performance

1. **Database**: Upgrade to larger plan
2. **Server**: Increase RAM/CPU in cloud dashboard
3. **CDN**: Use Cloudflare for static assets
4. **Caching**: Enable Redis for session storage

### Handle More Users

- Render: Auto-scales with traffic
- Railway: Upgrade to Pro plan
- Docker: Use Kubernetes for orchestration

## 🎉 Launch Checklist

- [ ] Platform deployed and accessible
- [ ] Database initialized with admin user
- [ ] Admin password changed
- [ ] Commission wallet verified
- [ ] Terms & Privacy pages accessible
- [ ] PWA install prompt working
- [ ] Test user registration
- [ ] Test song upload
- [ ] Test purchase transaction
- [ ] Share link on social media!

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs` or cloud platform dashboard
2. Review README.md for configuration
3. Verify environment variables
4. Check database connection

---

**Your platform is ready for commercial launch! 🚀**

Share your link and start earning commissions!
