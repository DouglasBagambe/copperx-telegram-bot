// app/api/wallets.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import copperxAPI from "./copperx";
import { ApiResponse, Wallet, WalletBalance } from "./types";

/**
 * Get all wallets for the authenticated user
 * @returns Array of wallet objects
 */
export const getWallets = async (accessToken?: string): Promise<Wallet[]> => {
  const response = await copperxAPI.get<ApiResponse<Wallet[]>>("/api/wallets");
  return response.data;
};

/**
 * Get the balances for all wallets
 * @returns Array of wallet balance objects
 */
export const getWalletBalances = async (
  accessToken?: string
): Promise<WalletBalance[]> => {
  const response = await copperxAPI.get<ApiResponse<WalletBalance[]>>(
    "/api/wallets/balances"
  );
  return response.data;
};

/**
 * Set a wallet as the default wallet
 * @param walletId The ID of the wallet to set as default
 * @returns The updated wallet object
 */
export const setDefaultWallet = async (walletId: string): Promise<Wallet> => {
  const response = await copperxAPI.post<ApiResponse<Wallet>>(
    "/api/wallets/default",
    { walletId }
  );
  return response.data;
};

/**
 * Get the default wallet for the authenticated user
 * @returns The default wallet object
 */
export const getDefaultWallet = async (): Promise<Wallet> => {
  const response = await copperxAPI.get<ApiResponse<Wallet>>(
    "/api/wallets/default"
  );
  return response.data;
};

/**
 * Get deposit account information
 * @returns Deposit account details
 */
export const getDepositAccounts = async (
  accessToken?: string
): Promise<any> => {
  const response = await copperxAPI.get<ApiResponse<any>>(
    "/api/deposit-accounts"
  );
  return response.data;
};
