# CopperX Telegram Bot

A Telegram bot for managing USDC payouts via Copperx, built for the Superteam Earn "Telegram Bot for Copperx Payout 🤖 - Build with AI" bounty.

## Overview

This bot integrates with Copperx Payout's API to enable users to deposit, withdraw, and transfer USDC directly through Telegram. Built with TypeScript/Node.js, it features secure authentication, wallet management, fund transfers, and real-time deposit notifications.

## Features

- 🔐 **Auth & Account**: Login, view profile, check KYC status.
- 👛 **Wallets**: View balances, set default wallet, deposit funds, view history.
- 💸 **Transfers**: Send USDC to email/wallet, withdraw to bank, view recent transactions.
- 🔔 **Notifications**: Real-time deposit alerts via Pusher.
- 💬 **UX**: Intuitive commands, inline keyboards, interactive menus.

## Live Demo

Try it: [@CopperxPayoutBot](https://t.me/CopperxPayout_01_Bot)  
Deployed on Render: [https://copperx-telegram-bot-1ez7.onrender.com](https://copperx-telegram-bot-1ez7.onrender.com)

## Setup

1. Clone: `git clone <repo-url>`
2. Install: `yarn install`
3. Add `.env`:
   TELEGRAM_BOT_TOKEN=<your-bot-token>
   COPPERX_API_BASE_URL=https://income-api.copperx.io
   PUSHER_APP_KEY=e089376087cac1a62785
   PUSHER_APP_CLUSTER=ap1
4. Run: `yarn dev`
5. Deploy: See `docs/setup.md` for Render deployment.

## Documentation

- Setup: `docs/setup.md`
- Commands: `docs/commands.md`
- API: `docs/api.md`
- Troubleshooting: `docs/troubleshooting.md`

## Submission Notes

Built with TypeScript/Node.js, using Cursor and ChatGPT for assistance. Code is clean, type-safe, and well-documented with a comprehensive Git history. Security best practices are followed, including secure session management and no plaintext passwords.
