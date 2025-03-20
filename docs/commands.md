# CopperX Telegram Bot Commands

This document describes the available commands for the CopperX Telegram Bot.

## General Commands

### `/start`

- **Description**: Initializes the bot. Shows a welcome message and either a login button (if not authenticated) or the main menu (if authenticated).
- **Response**: "Welcome to Copperx Payout Bot! Please login to start." or "Welcome back! What would you like to do?"

### `/help`

- **Description**: Displays a list of available commands and support information.
- **Response**:
  Commands
  /start - Start the bot
  /login - Authenticate with Copperx
  /profile - View your profile
  /kyc - Check KYC status
  /balance - Show wallet balances
  /setdefault - Set default wallet
  /deposit - Get deposit info
  /history - View recent transactions
  /send - Send USDC to email
  /sendwallet - Send USDC to wallet
  /withdraw - Withdraw to bank
  /help - Show this message
  Support: <https://t.me/copperxcommunity/2183>
  Copy

## Authentication

### `/login`

- **Description**: Starts the login process via email OTP. Prompts for email, then OTP.
- **Flow**: Enter email → Receive OTP → Enter OTP → "Login successful! ✅" or error message.

## Profile and KYC

### `/profile`

- **Description**: Displays the user's profile information (requires login).
- **Response**:
  Profile Information
  Name: John Doe
  Email: <user@example.com>
  Organization: CopperX Org
  KYC Status: Approved
  Copy

### `/kyc`

- **Description**: Shows the user's KYC status (requires login).
- **Response**: "KYC approved! ✅" or "KYC status: pending. Complete at: <https://copperx.io/kyc>"

## Wallet Management

### `/balance`

- **Description**: Lists wallet balances (requires login).
- **Response**:
  Wallet Balances
  Ethereum: 100.50 USDC
  Polygon: 50.25 USDC
  Copy

### `/setdefault`

- **Description**: Sets a default wallet from a list (requires login).
- **Response**: Inline keyboard with wallet options → "Default wallet set! ✅"

### `/deposit`

- **Description**: Provides deposit addresses (requires login).
- **Response**:
  Deposit Details
  Network: Ethereum
  Address: 0x1234...
  Copy

## Transfers

### `/history`

- **Description**: Shows the last 10 transactions (requires login).
- **Response**:
  Recent Transactions
  Send - 10.00 USDC Status: Completed Date: 2023-01-01 12:00
  Copy

### `/send`

- **Description**: Sends USDC to an email (requires login). Prompts for email and amount.
- **Flow**: Enter email → Enter amount → Confirm → "Successfully sent 10.00 USDC to <user@example.com>"

### `/sendwallet`

- **Description**: Sends USDC to a wallet address (requires login). Prompts for address and amount.
- **Flow**: Enter address → Enter amount → Confirm → "Successfully sent 10.00 USDC to wallet 0x1234..."

### `/withdraw`

- **Description**: Withdraws USDC to a bank account (requires login). Prompts for payee and amount.
- **Flow**: Select payee → Enter amount → Confirm → "Withdrawal initiated for 10.00 USDC"

## Notes

- Commands requiring login will respond with "Please login first with /login" if unauthenticated.
- Callback queries (e.g., "Confirm ✅") are handled via inline keyboards.
