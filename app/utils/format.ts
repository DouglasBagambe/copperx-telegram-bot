// app/utils/format.ts

/**
 * Format a number as a currency
 * @param amount Amount to format
 * @param currency Currency code (default: USDC)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: string | number | undefined,
  currency: string = "USDC"
): string => {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  return `${isNaN(numAmount) ? "0.00" : numAmount.toFixed(2)} ${currency}`;
};

/**
 * Format a date as a string
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format a wallet address for display (shortened)
 * @param address Full wallet address
 * @returns Shortened address (first 6 and last 4 characters)
 */
export const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

/**
 * Format transfer type for display
 * @param type Transfer type from API
 * @returns Human-readable transfer type
 */
export const formatTransferType = (type: string): string => {
  const typeMap: Record<string, string> = {
    EMAIL_TRANSFER: "Email Transfer",
    WALLET_WITHDRAW: "Wallet Withdrawal",
    OFFRAMP: "Bank Withdrawal",
    DEPOSIT: "Deposit",
  };

  return typeMap[type] || type;
};

/**
 * Format transfer status for display
 * @param status Transfer status from API
 * @returns Human-readable status with emoji
 */
export const formatTransferStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    COMPLETED: "✅ Completed",
    PENDING: "⏳ Pending",
    FAILED: "❌ Failed",
    PROCESSING: "🔄 Processing",
  };

  return statusMap[status] || status;
};
