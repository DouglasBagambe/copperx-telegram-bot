# API Integration

## Base URL

`COPPERX_API_BASE_URL` (e.g., `https://income-api.copperx.io`)

## Authentication

- **Request OTP**: `POST /api/auth/email-otp/request`  
  Body: `{ "email": "user@example.com" }`  
  Response: `{ "sid": "session-id" }`
- **Authenticate OTP**: `POST /api/auth/email-otp/authenticate`  
  Body: `{ "email": "user@example.com", "otp": "123456", "sid": "session-id" }`  
  Response: `{ "accessToken": "jwt", "refreshToken": "jwt", "expireAt": "2025-03-21T00:00:00Z" }`
- **Get Profile**: `GET /api/auth/me`  
  Headers: `Authorization: Bearer <accessToken>`  
  Response: `{ "id": "user-id", "email": "user@example.com", "firstName": "John", ... }`
- **Get KYC**: `GET /api/kycs`  
  Headers: `Authorization: Bearer <accessToken>`  
  Response: `[{ "id": "kyc-id", "status": "approved", ... }]`

## Wallets

- **Get Wallets**: `GET /api/wallets`  
  Response: `[{ "id": "wallet-id", "network": "Polygon", ... }]`
- **Get Balances**: `GET /api/wallets/balances`  
  Response: `[{ "network": "Polygon", "balance": "0", ... }]`
- **Set Default**: `POST /api/wallets/default`  
  Body: `{ "walletId": "wallet-id" }`

## Transfers

- **List Transfers**: `GET /api/transfers?page=1&limit=10`  
  Response: `[{ "id": "tx-id", "amount": "10", "status": "COMPLETED", ... }]`
- **Send to Email**: `POST /api/transfers/email`  
  Body: `{ "email": "recipient@example.com", "amount": "10" }`

## Notifications

- **Pusher Auth**: `POST /api/notifications/auth`  
  Body: `{ "socket_id": "socket-id", "channel_name": "private-org-<org-id>" }`
- Channel: `private-org-<organizationId>`  
  Event: `deposit` → `{ "amount": "10", "network": "Polygon" }`
