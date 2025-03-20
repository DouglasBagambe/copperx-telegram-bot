// app/bot/menus.ts
import { Markup } from "telegraf";
import { formatWalletAddress } from "../utils/format";
import { Wallet } from "../api/types";

/**
 * Create the main menu keyboard
 */
export const mainMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("📊 Dashboard", "dashboard"),
      Markup.button.callback("👤 Profile", "profile"),
      Markup.button.callback("💰 Balance", "balance"),
    ],
    [
      Markup.button.callback("📜 History", "history"),
      Markup.button.callback("💸 Send Funds", "send_menu"),
      Markup.button.callback("📥 Deposit", "deposit"),
    ],
    [
      Markup.button.callback("🏦 Set Default Wallet", "setdefault"),
      Markup.button.callback("📋 KYC Status", "kyc"),
      Markup.button.callback("ℹ️ Help", "help"),
    ],
  ]);
};

/**
 * Create the transfer options keyboard
 */
export const transferMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("📧 Send to Email", "send_email"),
      Markup.button.callback("🌐 Send to Wallet", "send_wallet"),
    ],
    [
      Markup.button.callback("🏧 Withdraw to Bank", "withdraw_bank"),
      Markup.button.callback("⬅️ Back", "main_menu"),
    ],
  ]);
};

/**
 * Create a keyboard for wallet selection
 * @param wallets Array of wallets
 * @param actionPrefix Prefix for callback data
 */
export const walletsKeyboard = (
  wallets: Wallet[],
  actionPrefix: string = "wallet"
) => {
  const buttons = wallets.map((w) =>
    Markup.button.callback(
      `${w.network} (${formatWalletAddress(w.walletAddress)})`,
      `${actionPrefix}_${w.id}`
    )
  );
  buttons.push(Markup.button.callback("⬅️ Back", "main_menu"));
  return Markup.inlineKeyboard(buttons.map((button) => [button]));
};
