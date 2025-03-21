# Setup Guide

## Prerequisites

- Node.js: v20.18.0+ (`nvm install 20`)
- Yarn: v1.22.22 (`npm install -g yarn`)
- Telegram Bot Token: Get from BotFather

## Local Setup

1. Clone: `git clone <repo-url>`
2. Navigate: `cd copperx-telegram-bot`
3. Install: `yarn install`
4. Create `.env`:
   TELEGRAM_BOT_TOKEN=<your-bot-token>
   COPPERX_API_BASE_URL=https://income-api.copperx.io
   PUSHER_APP_KEY=e089376087cac1a62785
   PUSHER_APP_CLUSTER=ap1
   NODE_ENV=development
   PORT=3000
5. Run: `yarn dev`  
   Output: "Copperx Payout Bot started successfully."

## Deployment on Render

1. Fork this repo on GitHub.
2. Create a new Web Service on Render.
3. Set environment variables in Render dashboard (same as `.env` above, plus `RENDER_EXTERNAL_URL`).
4. Deploy: Use `yarn build` and `yarn start`.
5. Bot URL: `https://<your-render-url>.onrender.com`

## Testing

- Message the bot on Telegram: `/start`
- Authenticate: `/login` with your Copperx email.
