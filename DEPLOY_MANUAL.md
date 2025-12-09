# SoundProfit Market - Deployment Manual

## 1. Prerequisites
*   A **GitHub** account.
*   An account on **Render.com** (recommended for easiest setup) or **Railway.app**.

## 2. Setup Steps

### Step A: Push to GitHub
1.  Create a new repository on GitHub.
2.  Upload all files in this folder (`soundprofit_market`) to that repository.

### Step B: Deploy on Render.com
1.  Log in to Render.
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `render.yaml` file.
5.  Click **Apply**.
    *   This will create a **PostgreSQL Database** and a **Web Service**.
    *   It will automatically link them together.

### Step C: Final Configuration
1.  Once deployed, Render will give you a URL (e.g., `https://soundprofit-backend.onrender.com`).
2.  The application should now be live!

## 3. Database Initialization
The database will be empty initially. You need to run the SQL schema.
1.  In the Render Dashboard, go to your **Database**.
2.  Click **Connect** -> **External Connection**.
3.  Use a tool like **pgAdmin** or **DBeaver** to connect to your database using the provided credentials.
4.  Copy the contents of `backend_api/schema.sql` and run it in your SQL tool to create the tables.

## 4. Troubleshooting
*   **"Upload Failed"**: The system uses local storage (`uploads/` directory). On ephemeral cloud hosting (like Render Free Tier), these files may be lost on restart. For persistent production storage, configure AWS S3.
*   **"Login Failed"**: You need to register a user first via the API or manually insert one into the database.
