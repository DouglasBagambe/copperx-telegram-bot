// app/api/transfers.ts

import copperxAPI from "./copperx";
import { ApiResponse, Transfer, Payee } from "./types";

/**
 * Get transfer history
 * @param page Page number (default: 1)
 * @param limit Number of items per page (default: 10)
 * @returns Array of transfer objects
 */
export const getTransfers = async (
  page: number = 1,
  limit: number = 10
): Promise<Transfer[]> => {
  const response = await copperxAPI.get<ApiResponse<Transfer[]>>(
    `/api/transfers?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Send funds to an email address
 * @param email Recipient email
 * @param amount Amount to send (in USDC)
 * @returns Created transfer object
 */
export const sendToEmail = async (
  email: string,
  amount: string
): Promise<Transfer> => {
  const response = await copperxAPI.post<ApiResponse<Transfer>>(
    "/api/transfers/send",
    { email, amount }
  );
  return response.data;
};

/**
 * Send funds to an external wallet address
 * @param walletAddress Recipient wallet address
 * @param amount Amount to send (in USDC)
 * @returns Created transfer object
 */
export const sendToWallet = async (
  walletAddress: string,
  amount: string
): Promise<Transfer> => {
  const response = await copperxAPI.post<ApiResponse<Transfer>>(
    "/api/transfers/wallet-withdraw",
    { walletAddress, amount }
  );
  return response.data;
};

/**
 * Withdraw funds to a bank account
 * @param payeeId ID of the payee (bank account)
 * @param amount Amount to withdraw (in USDC)
 * @returns Created transfer object
 */
export const withdrawToBank = async (
  payeeId: string,
  amount: string
): Promise<Transfer> => {
  const response = await copperxAPI.post<ApiResponse<Transfer>>(
    "/api/transfers/offramp",
    { payeeId, amount }
  );
  return response.data;
};

/**
 * Get all payees (bank accounts) for the authenticated user
 * @returns Array of payee objects
 */
export const getPayees = async (): Promise<Payee[]> => {
  const response = await copperxAPI.get<ApiResponse<Payee[]>>("/api/payees");
  return response.data;
};

/**
 * Send bulk transfers
 * @param transfers Array of transfers to send
 * @returns Array of created transfer objects
 */
export const sendBatchTransfers = async (
  transfers: { email: string; amount: string }[]
): Promise<Transfer[]> => {
  const response = await copperxAPI.post<ApiResponse<Transfer[]>>(
    "/api/transfers/send-batch",
    { transfers }
  );
  return response.data;
};
