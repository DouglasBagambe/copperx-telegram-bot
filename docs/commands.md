# Command Reference

## General

- `/start`: Starts the bot. Shows welcome message and login/main menu.
- `/help`: Lists all commands and support link: [Copperx Community](https://t.me/copperxcommunity/2183).

## Authentication

- `/login`: Login via email OTP. Steps: Enter email → Enter OTP → Success.
- `/logout`: Logs out and clears session.

## Profile & KYC

- `/profile`: Shows user profile (name, email, etc.).
- `/kyc`: Displays KYC status. Links to Copperx if not approved.
- `/dashboard`: Overview of profile, balances, and recent transactions.

## Wallet Management

- `/balance`: Lists wallet balances across networks.
- `/setdefault`: Sets a default wallet from a list.
- `/deposit`: Shows deposit addresses for funding.

## Transfers

- `/history`: Displays last 10 transactions.
- `/send`: Sends USDC to an email. Steps: Enter email → Amount → Confirm.
- `/sendwallet`: Sends USDC to a wallet address. Steps: Enter address → Amount → Confirm.
- `/withdraw`: Withdraws to a bank. Steps: Select payee → Amount → Confirm.

## Notes

- Unauthenticated users are prompted to `/login`.
- Inline keyboards provide options like "Confirm ✅" or "Cancel ❌".
