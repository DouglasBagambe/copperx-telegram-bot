# Troubleshooting Guide

## Bot Not Starting

- **Issue**: Bot fails to launch.
- **Fix**: Check `TELEGRAM_BOT_TOKEN` in `.env`. Run `yarn install` again. Ensure Node.js is v20+.

## API Errors

- **Issue**: "Invalid response from API" in `/profile` or `/dashboard`.
- **Fix**: Verify `COPPERX_API_BASE_URL`. Check API response structure in `app/api/auth.ts`. Ensure your Copperx account has valid data.

## Authentication Issues

- **Issue**: "Otp is not latest otp".
- **Fix**: Enter OTP within 5 minutes or request a new one via the bot.

## Wallet Issues

- **Issue**: "No wallets found" in `/balance` or `/setdefault`.
- **Fix**: Ensure your Copperx account has wallets (even with 0 balance). Check API response in `app/api/wallets.ts`.

## Menu Overload

- **Issue**: Main menu appears after every action.
- **Fix**: Modified to show a "Menu 📋" button instead (see code changes in `app/bot/commands.ts`).

## Support

- Contact: [Copperx Community](https://t.me/copperxcommunity/2991)
