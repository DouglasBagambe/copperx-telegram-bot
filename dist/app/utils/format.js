"use strict";
// app/utils/format.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTransferStatus = exports.formatTransferType = exports.formatWalletAddress = exports.formatDate = exports.formatCurrency = void 0;
/**
 * Format a number as a currency
 * @param amount Amount to format
 * @param currency Currency code (default: USDC)
 * @returns Formatted currency string
 */
const formatCurrency = (amount, currency = "USDC") => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `${numAmount.toFixed(2)} ${currency}`;
};
exports.formatCurrency = formatCurrency;
/**
 * Format a date as a string
 * @param dateString ISO date string
 * @returns Formatted date string
 */
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
exports.formatDate = formatDate;
/**
 * Format a wallet address for display (shortened)
 * @param address Full wallet address
 * @returns Shortened address (first 6 and last 4 characters)
 */
const formatWalletAddress = (address) => {
    if (!address || address.length < 10)
        return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
exports.formatWalletAddress = formatWalletAddress;
/**
 * Format transfer type for display
 * @param type Transfer type from API
 * @returns Human-readable transfer type
 */
const formatTransferType = (type) => {
    const typeMap = {
        EMAIL_TRANSFER: "Email Transfer",
        WALLET_WITHDRAW: "Wallet Withdrawal",
        OFFRAMP: "Bank Withdrawal",
        DEPOSIT: "Deposit",
    };
    return typeMap[type] || type;
};
exports.formatTransferType = formatTransferType;
/**
 * Format transfer status for display
 * @param status Transfer status from API
 * @returns Human-readable status with emoji
 */
const formatTransferStatus = (status) => {
    const statusMap = {
        COMPLETED: "✅ Completed",
        PENDING: "⏳ Pending",
        FAILED: "❌ Failed",
        PROCESSING: "🔄 Processing",
    };
    return statusMap[status] || status;
};
exports.formatTransferStatus = formatTransferStatus;
