# CopperX Telegram Bot Setup

This guide covers setting up and running the CopperX Telegram Bot locally.

## Prerequisites

- **Node.js**: v20.18.0 or later (use `nvm install 20` if needed).
- **Yarn**: v1.22.22 (`npm install -g yarn`).
- **Telegram**: A bot token from BotFather (e.g., `8070186172:AAG7xzpVFDX5P0sxqs8-TUHZh1nccuNhfow`).

## Installation

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd copperx-telegram-bot
   ```

Install Dependencies:
bashCopyyarn install

Set Up Environment Variables: Create a .env file in the root directory:
bashCopyTELEGRAM_BOT_TOKEN=your-telegram-bot-token
COPPERX_API_BASE_URL=<https://income-api.copperx.io>
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_CLUSTER=ap1

Replace your-telegram-bot-token with your BotFather token.
Adjust Pusher credentials if using notifications.

Running the Bot
Development Mode (with hot-reloading):
bashCopyyarn dev
Output: Copperx Payout Bot started successfully.
Production Mode:
bashCopyyarn start
Build (compiles TypeScript to JavaScript):
bashCopyyarn build
Output goes to dist/.
Configuration
tsconfig.bot.json: Used for bot-specific TypeScript settings (e.g., ES Modules).
jsonCopy{
"compilerOptions": {
"target": "ESNext",
"module": "ESNext",
"outDir": "dist",
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true
},
"include": ["**/*.ts"],
"exclude": ["node_modules"]
}
package.json: Defines ES Module support ("type": "module") and scripts.
Testing

Open Telegram and message your bot (e.g., @CopperxPayoutBot).
Send /start to begin.
Use /login to authenticate with your CopperX email.

Troubleshooting

"Invalid response from API": Check COPPERX_API_BASE_URL and API response format in auth.ts.
"Otp is not latest otp": Ensure timely OTP entry or request a new one via the bot.
Bot not starting: Verify TELEGRAM_BOT_TOKEN and run yarn install again.

Directory Structure

app/api/: API client and endpoints.
app/bot/: Bot logic (commands, scenes, menus).
app/config/: Environment setup.
app/utils/: Helper functions.
index.ts: Bot entry point.
