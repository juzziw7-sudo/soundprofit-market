# 🎵 SoundProfit Market

**Decentralized Music Marketplace powered by Blockchain Technology**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)](https://www.postgresql.org/)
[![Ethereum](https://img.shields.io/badge/ethereum-mainnet-purple)](https://ethereum.org/)

## 🌟 Features

- **🎨 Artist Platform**: Upload, list, and sell original music
- **💰 Blockchain Payments**: Secure cryptocurrency transactions with Ethereum
- **🔒 Smart Contracts**: Automatic fee splitting (2% platform, 98% artist)
- **📱 PWA Support**: Installable on mobile and desktop devices
- **🌐 Decentralized**: Peer-to-peer transactions without intermediaries
- **👥 Social Features**: Direct messaging, activity feed, and artist profiles
- **🤝 Affiliate Program**: Earn commissions by referring users
- **⚖️ Dispute Resolution**: Admin panel for transaction disputes
- **📊 Analytics Dashboard**: Track sales, plays, and revenue

## 🚀 Quick Start

### Option 1: Automated Installation (Recommended)

**Windows:**
```powershell
# Run PowerShell as Administrator
.\install.ps1
```

**Linux/Mac:**
```bash
chmod +x install.sh
./install.sh
```

### Option 2: Docker Deployment

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Option 3: Manual Installation

1. **Install Prerequisites**
   - Node.js >= 14.x
   - PostgreSQL >= 12.x
   - npm >= 6.x

2. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd soundprofit_market
   npm run install-all
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize Database**
   ```bash
   npm run init-db
   ```

5. **Start Server**
   ```bash
   npm start
   ```

6. **Access Platform**
   - Open browser: `http://localhost:3000`
   - Admin login: `admin@soundprofit.market` / `admin123`

## 💳 Admin Commission Setup

All platform commissions (2% of sales) are automatically routed to:

**Admin Wallet Address:**
```
0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402
```

This is configured in:
- `.env` file: `ADMIN_WALLET_ADDRESS`
- Database: `admin_config` table
- Smart Contract: Hardcoded in `SoundProfit.sol`

## 📁 Project Structure

```
soundprofit_market/
├── backend_api/              # Backend API server
│   ├── routes/              # API endpoints
│   │   ├── auth.js          # Authentication
│   │   ├── songs.js         # Music uploads
│   │   ├── transactions.js  # Payment processing
│   │   ├── blockchain.js    # Blockchain integration
│   │   ├── admin.js         # Admin panel
│   │   ├── social.js        # Social features
│   │   ├── affiliates.js    # Affiliate program
│   │   └── disputes.js      # Dispute resolution
│   ├── middleware/          # Express middleware
│   ├── services/            # Business logic
│   ├── schema.sql           # Database schema
│   ├── init-db.js           # Database initialization
│   └── index.js             # Server entry point
├── soundprofit_lite/        # Blockchain contracts
│   └── contracts/
│       └── SoundProfit.sol  # Smart contract
├── index.html               # Frontend entry point
├── app.js                   # Frontend application logic
├── web3-integration.js      # Web3 wallet integration
├── styles.css               # Styling
├── sw.js                    # Service Worker (PWA)
├── manifest.json            # PWA manifest
├── terms.html               # Terms & Conditions
├── privacy.html             # Privacy Policy
├── install.ps1              # Windows installer
├── install.sh               # Linux/Mac installer
├── docker-compose.yml       # Docker configuration
└── Dockerfile               # Container image
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/soundprofit

# Security
JWT_SECRET=your_secure_random_string_here

# Admin Wallet (DO NOT CHANGE)
ADMIN_WALLET_ADDRESS=0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402
COMMISSION_PERCENTAGE=2

# File Storage (Optional - AWS S3)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=us-east-1

# Blockchain
ETHEREUM_NETWORK=mainnet
INFURA_PROJECT_ID=
SMART_CONTRACT_ADDRESS=
```

## 🌐 Deployment

### Deploy to Render.com

1. Push code to GitHub
2. Connect repository to Render
3. Render will detect `render.yaml` automatically
4. Click "Apply" to deploy

### Deploy to Railway

```bash
railway login
railway init
railway up
```

### Deploy to Vercel

```bash
vercel --prod
```

## 📱 PWA Installation

The platform is a Progressive Web App (PWA) and can be installed on:

- **Desktop**: Chrome, Edge, Safari (macOS)
- **Android**: Chrome, Samsung Internet
- **iOS**: Safari (Add to Home Screen)

Users will see an "Install App" button when visiting the site.

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Input validation with Joi
- ✅ SQL injection prevention
- ✅ XSS protection

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run linting
npm run lint
```

## 📊 Admin Panel

Access the admin panel at `/#admin` (requires admin role):

- **Dashboard**: Platform statistics and analytics
- **User Management**: View, edit, delete users
- **Content Moderation**: Review and remove songs
- **Dispute Resolution**: Handle transaction disputes
- **Commission Tracking**: View all platform earnings
- **Configuration**: Update platform settings

## 🤝 Affiliate Program

Users can earn commissions by referring new users:

1. Navigate to `/#affiliates`
2. Click "Join Program"
3. Share your unique referral link
4. Earn 10% commission on referred sales

## 🔗 Blockchain Integration

### Smart Contract

The platform uses a Solidity smart contract for automatic fee splitting:

```solidity
// 2% Platform Fee, 98% Artist Share
function buyLicense(uint256 songId, address payable artist) external payable
```

### Supported Networks

- Ethereum Mainnet
- Polygon (MATIC)
- Testnet: Sepolia, Mumbai

### Wallet Support

- MetaMask
- WalletConnect
- Coinbase Wallet

## 📄 Legal

- [Terms & Conditions](/terms.html)
- [Privacy Policy](/privacy.html)

## 🛠️ Development

```bash
# Install dependencies
npm run install-all

# Start development server
npm run dev

# Initialize database
npm run init-db

# Build for production
npm run build

# Deploy
npm run deploy
```

## 🐳 Docker Commands

```bash
# Build images
npm run docker:build

# Start containers
npm run docker:up

# View logs
npm run docker:logs

# Restart services
npm run docker:restart

# Stop containers
npm run docker:down
```

## 📞 Support

- **Email**: support@soundprofit.market
- **Legal**: legal@soundprofit.market
- **Privacy**: privacy@soundprofit.market

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Express.js, PostgreSQL, and Ethereum
- UI inspired by modern music platforms
- Blockchain integration powered by Web3.js

---

**Made with ❤️ for the decentralized music economy**

**Admin Wallet**: `0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402`
