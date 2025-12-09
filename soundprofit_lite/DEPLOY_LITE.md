# Deploying SoundProfit Lite

This "Lite" version of SoundProfit is a self-contained, single-file Single Page Application (SPA). It is designed to be extremely easy to deploy and run, requiring no backend server, database configuration, or build steps.

## Quick Start

1.  **Locate the File**: The file is located at `soundprofit_lite/index.html`.
2.  **Open locally**: Simply double-click `index.html` to open it in any modern browser (Chrome, Firefox, Safari).
3.  **Deploy Online**: Upload this single `index.html` file to any static hosting provider.

## hosting Options

### Option 1: GitHub Pages (Free)
1.  Create a new repository on GitHub.
2.  Upload `index.html` to the repository.
3.  Go to **Settings > Pages**.
4.  Select `main` branch and `/root` folder.
5.  Save. Your site will be live at `yourusername.github.io/repo`.

### Option 2: Netlify Drop (Free & Fastest)
1.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Drag and drop the `soundprofit_lite` folder.
3.  That's it! Your site is live instantly.

> **PWA Note**: Ensure `manifest.json`, `icon.png`, and `sw.js` are in the same folder as `index.html` for the "Install App" feature to work correctly.

### Option 3: Vercel
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` inside the `soundprofit_lite` folder.
3.  Follow the prompts.

## Features Included
- **Zero Config**: No API keys or databases needed for demo.
- **Local Persistence**: Uses `localStorage` to save User Accounts, Songs, and Sales data directly in your browser.
- **Full SPA Experience**: Fast navigation, no page reloads.
- **Mock Blockchain**: Simulates crypto payments and wallet interactions.
- **Responsive Design**: Works perfectly on Mobile and Desktop.

## Resetting Data
To clear all data and start fresh (delete all users and songs), simply clear your browser's Local Storage or run this in the console:
```javascript
localStorage.clear();
window.location.reload();
```
