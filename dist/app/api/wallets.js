"use strict";
// app/api/wallets.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepositAccounts = exports.getDefaultWallet = exports.setDefaultWallet = exports.getWalletBalances = exports.getWallets = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const copperx_1 = __importDefault(require("./copperx"));
/**
 * Get all wallets for the authenticated user
 * @param accessToken The user's access token for authentication
 * @returns Array of wallet objects
 */
const getWallets = async (accessToken) => {
    const response = await copperx_1.default.get("/api/wallets", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
};
exports.getWallets = getWallets;
/**
 * Get the balances for all wallets
 * @param accessToken The user's access token for authentication
 * @returns Array of wallet balance objects
 */
const getWalletBalances = async (accessToken) => {
    const response = await copperx_1.default.get("/api/wallets/balances", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
};
exports.getWalletBalances = getWalletBalances;
/**
 * Set a wallet as the default wallet
 * @param walletId The ID of the wallet to set as default
 * @param accessToken The user's access token for authentication
 * @returns The updated wallet object
 */
const setDefaultWallet = async (walletId, accessToken) => {
    const response = await copperx_1.default.post("/api/wallets/default", { walletId }, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
};
exports.setDefaultWallet = setDefaultWallet;
/**
 * Get the default wallet for the authenticated user
 * @param accessToken The user's access token for authentication
 * @returns The default wallet object
 */
const getDefaultWallet = async (accessToken) => {
    const response = await copperx_1.default.get("/api/wallets/default", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
};
exports.getDefaultWallet = getDefaultWallet;
/**
 * Get deposit account information
 * @param accessToken The user's access token for authentication
 * @returns Deposit account details
 */
const getDepositAccounts = async (accessToken) => {
    const response = await copperx_1.default.get("/api/deposit-accounts", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
};
exports.getDepositAccounts = getDepositAccounts;
