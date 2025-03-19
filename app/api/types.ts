// API Response Types
export interface ApiResponse<T> {
  status: string;
  data: T;
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  walletAddress: string;
  network: string;
  isDefault: boolean;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  id: string;
  walletId: string;
  network: string;
  symbol: string;
  balance: string;
  availableBalance: string;
  lockedBalance: string;
  updatedAt: string;
}

// Transfer Types
export interface Transfer {
  id: string;
  type: string;
  status: string;
  amount: string;
  sourceOrganizationId: string;
  destinationEmail?: string;
  destinationWalletAddress?: string;
  destinationPayeeId?: string;
  createdAt: string;
  updatedAt: string;
}

// KYC Types
export interface KYC {
  id: string;
  status: string;
  type: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface OTPRequest {
  sid: string;
}

export interface OTPAuthentication {
  accessToken: string;
  refreshToken: string;
  expireAt: string;
}

// Payee Types
export interface Payee {
  id: string;
  nickName: string;
  accountType: string;
  updatedAt: string;
  createdAt: string;
}

// Session Types
export interface UserSession {
  accessToken: string;
  refreshToken: string;
  expireAt: string;
  organizationId: string;
  defaultWalletId?: string;
  email?: string;
  chatId?: number;
}
