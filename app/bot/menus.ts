// app/bot/menus.ts

import { Markup } from "telegraf";
import { Wallet, WalletBalance, Payee } from "../api/types";

/**
 * Create the main menu keyboard
 */
export const mainMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("💰 Balance", "balance"),
      Markup.button.callback("📤 Send", "send_menu"),
    ],
    [
      Markup.button.callback("📥 Deposit", "deposit"),
      Markup.button.callback("📊 History", "history"),
    ],
    [
      Markup.button.callback("👤 Profile", "profile"),
      Markup.button.callback("ℹ️ Help", "help"),
    ],
  ]);
};

/**
 * Create the transfer options keyboard
 */
export const transferMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📧 Send to Email", "send_email")],
    [Markup.button.callback("👛 Send to Wallet", "send_wallet")],
    [Markup.button.callback("🏦 Withdraw to Bank", "withdraw_bank")],
    [Markup.button.callback("🔙 Back to Main Menu", "main_menu")],
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
  const buttons = wallets.map((wallet) => {
    const label = wallet.isDefault
      ? `${wallet.network} (Default) - ${wallet.walletAddress.substring(
          0,
          8
        )}...`
      : `${wallet.network} - ${wallet.walletAddress.substring(0, 8)}...`;

    return [Markup.button.callback(label, `${actionPrefix}_${wallet.id}`)];
  });

  buttons.push([Markup.button.callback("🔙 Back", "main_menu")]);

  return Markup.inlineKeyboard(buttons);
};

/**
 * Create a keyboard for payee selection
 * @param payees Array of payees (bank accounts)
 */
export const payeesKeyboard = (payees: Payee[]) => {
  const buttons = payees.map((payee) => {
    return [Markup.button.callback(payee.nickName, `payee_${payee.id}`)];
  });

  buttons.push([Markup.button.callback("🔙 Back", "send_menu")]);

  return Markup.inlineKeyboard(buttons);
};

/**
 * Create a confirmation keyboard
 * @param action Action to confirm
 */
export const confirmationKeyboard = (action: string) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✅ Confirm", `confirm_${action}`),
      Markup.button.callback("❌ Cancel", "cancel"),
    ],
  ]);
};

/**
 * Create a keyboard showing wallet balances
 * @param balances Array of wallet balances
 */
export const balancesKeyboard = (balances: WalletBalance[]) => {
  // Group balances by network
  const networkBalances: Record<string, WalletBalance[]> = {};

  balances.forEach((balance) => {
    if (!networkBalances[balance.network]) {
      networkBalances[balance.network] = [];
    }
    networkBalances[balance.network].push(balance);
  });

  const buttons = Object.entries(networkBalances).map(([network, balances]) => {
    // Sum up balances for the network
    const totalBalance = balances.reduce((sum, balance) => {
      return sum + parseFloat(balance.balance);
    }, 0);

    return [
      Markup.button.callback(
        `${network}: ${totalBalance.toFixed(2)} ${balances[0].symbol}`,
        `balance_${network}`
      ),
    ];
  });

  buttons.push([Markup.button.callback("🔙 Main Menu", "main_menu")]);

  return Markup.inlineKeyboard(buttons);
};
