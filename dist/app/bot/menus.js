"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletsKeyboard = exports.transferMenuKeyboard = exports.mainMenuKeyboard = void 0;
// app/bot/menus.ts
const telegraf_1 = require("telegraf");
const format_1 = require("../utils/format");
/**
 * Create the main menu keyboard
 */
const mainMenuKeyboard = () => {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback("📊 Dashboard", "dashboard"),
            telegraf_1.Markup.button.callback("👤 Profile", "profile"),
            telegraf_1.Markup.button.callback("💰 Balance", "balance"),
        ],
        [
            telegraf_1.Markup.button.callback("📜 History", "history"),
            telegraf_1.Markup.button.callback("💸 Send Funds", "send_menu"),
            telegraf_1.Markup.button.callback("📥 Deposit", "deposit"),
        ],
        [
            telegraf_1.Markup.button.callback("🏦 Set Default Wallet", "setdefault"),
            telegraf_1.Markup.button.callback("📋 KYC Status", "kyc"),
            telegraf_1.Markup.button.callback("ℹ️ Help", "help"),
        ],
    ]);
};
exports.mainMenuKeyboard = mainMenuKeyboard;
/**
 * Create the transfer options keyboard
 */
const transferMenuKeyboard = () => {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback("📧 Send to Email", "send_email"),
            telegraf_1.Markup.button.callback("🌐 Send to Wallet", "send_wallet"),
        ],
        [
            telegraf_1.Markup.button.callback("🏧 Withdraw to Bank", "withdraw_bank"),
            telegraf_1.Markup.button.callback("⬅️ Back", "main_menu"),
        ],
    ]);
};
exports.transferMenuKeyboard = transferMenuKeyboard;
/**
 * Create a keyboard for wallet selection
 * @param wallets Array of wallets
 * @param actionPrefix Prefix for callback data
 */
const walletsKeyboard = (wallets, actionPrefix = "wallet") => {
    const buttons = wallets.map((w) => telegraf_1.Markup.button.callback(`${w.network} (${(0, format_1.formatWalletAddress)(w.walletAddress)})`, `${actionPrefix}_${w.id}`));
    buttons.push(telegraf_1.Markup.button.callback("⬅️ Back", "main_menu"));
    return telegraf_1.Markup.inlineKeyboard(buttons.map((button) => [button]));
};
exports.walletsKeyboard = walletsKeyboard;
