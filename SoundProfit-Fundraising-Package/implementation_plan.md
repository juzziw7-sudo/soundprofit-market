# Implementation Plan - SoundProfit Lite Release Candidate

This plan outlines the final set of enhancements to ensure `soundprofit_lite/index.html` is 100% commercially ready and visually impressive.

## User Review Required
> [!IMPORTANT]
> These changes focus on "User Delight" and "Shareability", critical for a commercial launch.

## Proposed Changes

### 1. SEO & Social Metadata
- **File**: `soundprofit_lite/index.html`
- **Logic**: 
    - Add `<meta name="description">`.
    - Add Open Graph (`og:`) tags for Twitter/Facebook sharing.
    - Add a favicon link (using a simple data URI or CDN icon).

### 2. "Download" Feature
- **File**: `soundprofit_lite/index.html`
- **Logic**:
    - **Dashboard**: In "Recent Transactions", add a "Download" button next to purchased tracks.
    - **Action**: Clicking "Download" triggers a simulated download (creating a dummy text file blob) and a toast "Downloading high-quality audio...".

### 3. Purchase "Confetti" Effect
- **File**: `soundprofit_lite/index.html`
- **Logic**:
    - Integrate a lightweight confetti utility (JS function) to trigger when `confirm-pay-btn` is clicked and verified.
    - This adds the "Wow" factor requested for premium designs.

### 4. Zero-State Polish
- **File**: `soundprofit_lite/index.html`
- **Logic**: 
    - Improve the "No Transactions" state in Dashboard with a "Go to Market" button.
    - Improve "No Songs" state in Market (already done, but verify styling).

## Verification Plan
1.  **Meta**: detailed inspection of `<head>`.
2.  **Confetti**: Buy a song -> Verify visual particle effects.
3.  **Download**: Go to Dashboard -> Click Download -> Verify file download behavior.
