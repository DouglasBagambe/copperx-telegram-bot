// app/api/transfers.ts
import copperxAPI from "./copperx";
import { Transfer, Payee } from "./types";

/**
 * Get list of transfers
 * @param accessToken Access token for authentication
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns List of transfers
 */
export const getTransfers = async (
  accessToken: string,
  page: number = 1,
  limit: number = 10
): Promise<Transfer[]> => {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await copperxAPI.get<Transfer[]>(
    `/api/transfers?page=${page}&limit=${limit}`,
    { headers }
  );
  return response;
};

/**
 * Send USDC to an email address
 * @param email Recipient email
 * @param amount Amount in USDC
 * @returns Transfer details
 */
export const sendToEmail = async (
  email: string,
  amount: string
): Promise<Transfer> => {
  const response = await copperxAPI.post<Transfer>("/api/transfers/email", {
    email,
    amount,
  });
  return response;
};

/**
 * Send USDC to a wallet address
 * @param walletAddress Recipient wallet address
 * @param amount Amount in USDC
 * @returns Transfer details
 */
export const sendToWallet = async (
  walletAddress: string,
  amount: string
): Promise<Transfer> => {
  const response = await copperxAPI.post<Transfer>("/api/transfers/wallet", {
    walletAddress,
    amount,
  });
  return response;
};

/**
 * Withdraw USDC to a bank account
 * @param payeeId Payee ID for the bank account
 * @param amount Amount in USDC
 * @returns Transfer details
 */
export const withdrawToBank = async (
  payeeId: string,
  amount: string
): Promise<Transfer> => {
  const response = await copperxAPI.post<Transfer>("/api/transfers/bank", {
    payeeId,
    amount,
  });
  return response;
};

/**
 * Get list of payees (bank accounts)
 * @returns List of payees
 */
export const getPayees = async (): Promise<Payee[]> => {
  const response = await copperxAPI.get<Payee[]>("/api/payees");
  return response;
};

/**
 * Send batch transfers to multiple recipients
 * @param transfers List of transfers (email and amount)
 * @returns Batch transfer result
 */
export const sendBatchTransfers = async (
  transfers: Array<{ email: string; amount: string }>
): Promise<any> => {
  const response = await copperxAPI.post("/api/transfers/batch", { transfers });
  return response;
};
