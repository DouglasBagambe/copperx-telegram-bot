// app/api/wallets.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import copperxAPI from "./copperx";
import { ApiResponse, Wallet, WalletBalance } from "./types";

/**
 * Get all wallets for the authenticated user
 * @param accessToken The user's access token for authentication
 * @returns Array of wallet objects
 */
export const getWallets = async (accessToken: string): Promise<Wallet[]> => {
  const response = await copperxAPI.get<ApiResponse<Wallet[]>>("/api/wallets", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

/**
 * Get the balances for all wallets
 * @param accessToken The user's access token for authentication
 * @returns Array of wallet balance objects
 */
export const getWalletBalances = async (
  accessToken: string
): Promise<WalletBalance[]> => {
  const response = await copperxAPI.get<ApiResponse<WalletBalance[]>>(
    "/api/wallets/balances",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};

/**
 * Set a wallet as the default wallet
 * @param walletId The ID of the wallet to set as default
 * @param accessToken The user's access token for authentication
 * @returns The updated wallet object
 */
export const setDefaultWallet = async (
  walletId: string,
  accessToken: string
): Promise<Wallet> => {
  const response = await copperxAPI.post<ApiResponse<Wallet>>(
    "/api/wallets/default",
    { walletId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};

/**
 * Get the default wallet for the authenticated user
 * @param accessToken The user's access token for authentication
 * @returns The default wallet object
 */
export const getDefaultWallet = async (
  accessToken: string
): Promise<Wallet> => {
  const response = await copperxAPI.get<ApiResponse<Wallet>>(
    "/api/wallets/default",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};

/**
 * Get deposit account information
 * @param accessToken The user's access token for authentication
 * @returns Deposit account details
 */
export const getDepositAccounts = async (accessToken: string): Promise<any> => {
  const response = await copperxAPI.get<ApiResponse<any>>(
    "/api/deposit-accounts",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};
