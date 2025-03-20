# CopperX Telegram Bot

A Telegram bot for managing crypto payouts with Copperx, built for the Superteam Earn "Telegram Bot for Copperx Payout 🤖 - Build with AI" bounty.

## Features

- 🔐 **Authentication & Account Management**: Login, view profile, check KYC/KYB status.
- 👛 **Wallet Management**: View balances, set default wallet, deposit funds, view transaction history.
- 💸 **Fund Transfers**: Send USDC to email or wallet, withdraw to bank, view recent transactions.
- 🔔 **Deposit Notifications**: Real-time notifications via Pusher.
- 💬 **Bot Interaction**: Intuitive commands, interactive menus, inline keyboards, help command.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/copperx-telegram-bot.git
   cd copperx-telegram-bot
   Install dependencies:
   bash
   ```

2. yarn install
   Set up environment variables in a .env file:

   ```bash
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   COPPERX_API_KEY=your-copperx-api-key
   VITE_PUSHER_KEY=e089376087cac1a62785
   VITE_PUSHER_CLUSTER=ap1
   bash
   ```

3. Run the bot locally:
   yarn dev
   Deploy to Render (see docs/setup.md for detailed instructions).
4. Live Demo
   Interact with the bot: [CopperX](https://t.me/CopperxPayout_01_Bot)

5. Documentation
   Setup Instructions: docs/api.md
   Command Reference: docs/commands.md
   API Integration Details: docs/setup.md

## Local Development

1. Clone the repository and install dependencies as shown in the README.
2. Set up environment variables in a `.env` file (see README for details).
3. Run the bot:

   ```bash
   yarn dev
   ```
