# CopperX Telegram Bot API Documentation

This document outlines the API interactions used by the CopperX Telegram Bot for authentication, wallet management, and transfers.

## Base URL

The base URL for all API requests is configured via the `.env` file as `COPPERX_API_BASE_URL`. Example: `https://income-api.copperx.io`.

## Authentication

### Request Email OTP

- **Endpoint**: `POST /api/auth/email-otp/request`
- **Request Body**:

  ```json
  { "email": "user@example.com" }
  ```

Response:
jsonCopy{ "sid": "c2e867da-352e-450c-863b-f2a2d76d9420" }

Description: Requests an OTP to be sent to the provided email. Returns a session ID (sid) for OTP verification.

Authenticate with OTP

Endpoint: POST /api/auth/email-otp/authenticate
Request Body:
jsonCopy{ "email": "<user@example.com>", "otp": "123456", "sid": "c2e867da-352e-450c-863b-f2a2d76d9420" }

Response:
jsonCopy{ "accessToken": "jwt-token", "refreshToken": "refresh-token", "expireAt": "2025-03-21T00:00:00Z" }

Description: Verifies the OTP and returns authentication tokens. Errors with 400 if OTP is invalid or expired.

Get Profile

Endpoint: GET /api/auth/me
Headers:

Authorization: Bearer `accessToken`
X-Organization-ID: `organizationId` (optional)

Response:
jsonCopy{
"id": "user-id",
"email": "<user@example.com>",
"organizationId": "org-id",
"firstName": "John",
"lastName": "Doe",
"role": "user",
"status": "active",
"createdAt": "2023-01-01T00:00:00Z",
"updatedAt": "2023-01-02T00:00:00Z"
}

Description: Retrieves the authenticated user's profile.

Get KYC Status

Endpoint: GET /api/kycs
Headers:

Authorization: Bearer `accessToken`

Response:
jsonCopy[{ "id": "kyc-id", "status": "approved", "type": "individual", "organizationId": "org-id", "createdAt": "2023-01-01T00:00:00Z", "updatedAt": "2023-01-02T00:00:00Z" }]

Description: Fetches the user's KYC status.

Wallets

Endpoints: Defined in wallets.ts (e.g., /api/wallets, /api/wallets/balances).
Purpose: Manage wallet balances, set default wallets, and get deposit addresses.

Transfers

Endpoints: Defined in transfers.ts (e.g., /api/transfers, /api/transfers/send-email).
Purpose: Handle sending USDC to emails/wallets, withdrawing to banks, and batch transfers.

Error Handling
Common errors include 400 (Bad Request) for invalid OTPs or expired sessions. Check error.response.data.message for details.
Notes

All requests use the copperxAPI Axios instance (copperx.ts) with dynamic headers for authentication.
See types.ts for detailed TypeScript interfaces.
