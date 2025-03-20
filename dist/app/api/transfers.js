"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBatchTransfers = exports.getPayees = exports.withdrawToBank = exports.sendToWallet = exports.sendToEmail = exports.getTransfers = void 0;
// app/api/transfers.ts
const copperx_1 = __importDefault(require("./copperx"));
/**
 * Get list of transfers
 * @param accessToken Access token for authentication
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns List of transfers
 */
const getTransfers = async (accessToken, page = 1, limit = 10) => {
    const headers = {};
    if (accessToken)
        headers.Authorization = `Bearer ${accessToken}`;
    const response = await copperx_1.default.get(`/api/transfers?page=${page}&limit=${limit}`, { headers });
    return response;
};
exports.getTransfers = getTransfers;
/**
 * Send USDC to an email address
 * @param email Recipient email
 * @param amount Amount in USDC
 * @returns Transfer details
 */
const sendToEmail = async (email, amount) => {
    const response = await copperx_1.default.post("/api/transfers/email", {
        email,
        amount,
    });
    return response;
};
exports.sendToEmail = sendToEmail;
/**
 * Send USDC to a wallet address
 * @param walletAddress Recipient wallet address
 * @param amount Amount in USDC
 * @returns Transfer details
 */
const sendToWallet = async (walletAddress, amount) => {
    const response = await copperx_1.default.post("/api/transfers/wallet", {
        walletAddress,
        amount,
    });
    return response;
};
exports.sendToWallet = sendToWallet;
/**
 * Withdraw USDC to a bank account
 * @param payeeId Payee ID for the bank account
 * @param amount Amount in USDC
 * @returns Transfer details
 */
const withdrawToBank = async (payeeId, amount) => {
    const response = await copperx_1.default.post("/api/transfers/bank", {
        payeeId,
        amount,
    });
    return response;
};
exports.withdrawToBank = withdrawToBank;
/**
 * Get list of payees (bank accounts)
 * @returns List of payees
 */
const getPayees = async () => {
    const response = await copperx_1.default.get("/api/payees");
    return response;
};
exports.getPayees = getPayees;
/**
 * Send batch transfers to multiple recipients
 * @param transfers List of transfers (email and amount)
 * @returns Batch transfer result
 */
const sendBatchTransfers = async (transfers) => {
    const response = await copperx_1.default.post("/api/transfers/batch", { transfers });
    return response;
};
exports.sendBatchTransfers = sendBatchTransfers;
