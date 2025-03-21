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
  const response = await copperxAPI.get("/api/wallets", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  let wallets: Wallet[] = [];
  if (Array.isArray(response)) {
    wallets = response as Wallet[];
  } else if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as any).data)
  ) {
    wallets = (response as any).data as Wallet[];
  } else {
    throw new Error("Invalid wallets response structure");
  }
  // Ensure walletAddress and network are strings
  return wallets.map((wallet) => ({
    ...wallet,
    walletAddress: wallet.walletAddress?.toString() ?? "",
    network: wallet.network?.toString() ?? "Unknown",
  }));
};

/**
 * Get the balances for all wallets
 * @param accessToken The user's access token for authentication
 * @returns Array of wallet balance objects
 */
export const getWalletBalances = async (
  accessToken: string
): Promise<WalletBalance[]> => {
  const response = await copperxAPI.get("/api/wallets/balances", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  let balances: WalletBalance[] = [];
  if (Array.isArray(response)) {
    balances = response as WalletBalance[];
  } else if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as any).data)
  ) {
    balances = (response as any).data as WalletBalance[];
  } else {
    throw new Error("Invalid wallet balances response structure");
  }
  // Ensure balance fields are strings
  return balances.map((balance) => ({
    ...balance,
    balance: balance.balance?.toString() ?? "0",
    availableBalance: balance.availableBalance?.toString() ?? "0",
    lockedBalance: balance.lockedBalance?.toString() ?? "0",
  }));
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
