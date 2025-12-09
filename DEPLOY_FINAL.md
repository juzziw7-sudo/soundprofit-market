# SoundProfit Market - Commercial Deployment Guide

**Version:** 1.0.0 (Gold Master)
**Status:** Commercial Ready

This guide covers how to deploy the SoundProfit Market platform to the live internet using industry-standard services.

## 1. Quick Launch (Render.com) - Preferred Method
Render is the easiest way to host both the Node.js backend and the PostgreSQL database.

1.  **Fork/Push this repository** to your personal GitHub account.
2.  Log in to [Render dashboard](https://dashboard.render.com).
3.  Click **New +** -> **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will detect `render.yaml` and automatically configure:
    *   `soundprofit-backend` (The Web Service)
    *   `soundprofit-db` (The Database)
6.  **Environment Variables**:
    *   The `render.yaml` file pre-configures most keys.
    *   **CRITICAL**: You must manually add `JWT_SECRET` in the Render dashboard if the auto-generation doesn't persist, or rely on the generated one.
    *   `ADMIN_WALLET_ADDRESS` is hardcoded to `0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402`.

## 2. Docker Deployment (Any VPS/Cloud)
If you prefer AWS, DigitalOcean, or your own server, use Docker.

1.  **Build the Image**:
    ```bash
    docker build -t soundprofit-market .
    ```
2.  **Run the Container**:
    ```bash
    docker run -p 3000:3000 \
      -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
      -e JWT_SECRET="your_long_secure_secret" \
      soundprofit-market
    ```

## 3. Smart Contract Deployment (Optional but Recommended)
By default, the app uses "Direct Transfer" (Client-side 98/2 split) which is secure. For fully trustless automated splitting, deploy the contract.

1.  Install Remix or Hardhat.
2.  Deploy `backend_api/contracts/SoundProfitMarketplace.sol`.
3.  Copy the resulting **Contract Address**.
4.  Add `SMART_CONTRACT_ADDRESS=0xYourDeployedAddress` to your environment variables.

## 4. Verification
Once deployed:
1.  Visit your URL (`https://your-app.onrender.com`).
2.  **Register** a new Artist account.
3.  **Upload** a song.
4.  **Buy** it using a separate browser (logged out or as Buyer).
5.  **Verify**:
    *   Artist Wallet receives 98%.
    *   Admin Wallet (`0x0bf...402`) receives 2%.
    *   Song shows as "Purchased" in dashboard.

## Support
For technical issues, reset the database using:
`npm run db:reset` (Local only)
