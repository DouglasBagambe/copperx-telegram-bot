/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/// app/bot/commands.ts

import { Markup } from "telegraf";
// import { Update } from "telegraf/typings/core/types/typegram";
import * as authAPI from "../api/auth";
import * as walletsAPI from "../api/wallets";
import * as transfersAPI from "../api/transfers";
import { getSession, setSession } from "../utils/session";
import {
  formatCurrency,
  formatDate,
  formatWalletAddress,
  formatTransferType,
  formatTransferStatus,
} from "../utils/format";
import { setupPusherNotifications } from "../notifications/pusher";
import {
  mainMenuKeyboard,
  transferMenuKeyboard,
  walletsKeyboard,
} from "./menus";
import { Telegraf, Context } from "telegraf";
import { Scenes } from "telegraf";

// Define custom context including scene support
interface CustomSession {
  accessToken?: string;
  organizationId?: string;
  defaultWalletId?: string;
  tempData?: {
    recipient?: string;
    amount?: number;
    walletAddress?: string;
    payeeId?: string;
  };
}

// export type MyContext = Scenes.SceneContext & {
//   session: CustomSession;
// };

export type MyContext = Scenes.WizardContext & {
  session: CustomSession;
};

// Helper functions to format data for display
const formatProfile = (profile: any) => {
  return `
*Profile Information*
Name: ${profile.name || "N/A"}
Email: ${profile.email || "N/A"}
Organization: ${profile.organization?.name || "N/A"}
KYC Status: ${profile.kycStatus || "Unknown"}
`;
};

const formatBalance = (balance: any, index: number) => {
  return `${index}. ${balance.network}: ${formatCurrency(
    balance.balance,
    balance.symbol
  )}\n`;
};

const formatTransaction = (tx: any, index: number) => {
  return (
    `${index}. ${formatTransferType(tx.type)} - ${formatCurrency(
      tx.amount
    )}\n` +
    `Status: ${formatTransferStatus(tx.status)}\n` +
    `Date: ${formatDate(tx.createdAt)}\n\n`
  );
};

export function setupCommands(bot: Telegraf<MyContext>) {
  // Middleware to restore session and setup notifications
  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id;
    if (chatId) {
      const session = getSession(chatId);
      if (session?.accessToken && session?.organizationId) {
        try {
          await authAPI.getProfile(session.accessToken, session.organizationId);
          setupPusherNotifications(bot, chatId, session.organizationId);
        } catch (error) {
          console.error("Invalid session token:", error);
          setSession(chatId, {});
        }
      }
    }
    return next();
  });

  // /start
  bot.command("start", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    const message = session?.accessToken
      ? "Welcome back! What would you like to do?"
      : "Welcome to Copperx Payout Bot! Please login to start.";
    const keyboard = session?.accessToken
      ? mainMenuKeyboard()
      : Markup.inlineKeyboard([[Markup.button.callback("Login", "login")]]);
    await ctx.reply(message, { reply_markup: keyboard.reply_markup });
  });

  // /help
  bot.command("help", async (ctx) => {
    const helpText = `
*Commands*
/start - Start the bot
/login - Authenticate with Copperx
/profile - View your profile
/kyc - Check KYC status
/balance - Show wallet balances
/setdefault - Set default wallet
/deposit - Get deposit info
/history - View recent transactions
/send - Send USDC to email
/sendwallet - Send USDC to wallet
/withdraw - Withdraw to bank
/help - Show this message

Support: https://t.me/copperxcommunity/2183
    `;
    await ctx.replyWithMarkdown(helpText);
  });

  // /login
  bot.command("login", (ctx) => ctx.scene.enter("loginScene"));

  // /profile
  bot.command("profile", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    if (!session?.accessToken)
      return ctx.reply("Please login first with /login.");
    try {
      const profile = await authAPI.getProfile(
        session.accessToken,
        session.organizationId
      );
      await ctx.replyWithMarkdown(formatProfile(profile));
    } catch (error) {
      console.error("Profile error:", error);
      await ctx.reply("Error fetching profile.");
    }
  });

  // /kyc
  bot.command("kyc", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    if (!session?.accessToken)
      return ctx.reply("Please login first with /login.");
    try {
      const kycStatus = await authAPI.getKYCStatus(session.accessToken);
      const status = kycStatus.length > 0 ? kycStatus[0].status : "none";
      const message =
        status === "approved"
          ? "KYC approved! ✅"
          : `KYC status: ${status}. Complete at: https://copperx.io/kyc`;
      await ctx.reply(message);
    } catch (error) {
      console.error("KYC error:", error);
      await ctx.reply("Error fetching KYC status.");
    }
  });

  // /balance
  bot.command("balance", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    if (!session?.accessToken)
      return ctx.reply("Please login first with /login.");
    try {
      const balances = await walletsAPI.getWalletBalances(session.accessToken);
      if (balances.length === 0) return ctx.reply("No wallets found.");
      let message = "*Wallet Balances*\n\n";
      balances.forEach((b, i) => (message += formatBalance(b, i + 1)));
      await ctx.replyWithMarkdown(message);
    } catch (error) {
      console.error("Balance error:", error);
      await ctx.reply("Error fetching balances.");
    }
  });

  // /setdefault
  bot.command("setdefault", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    if (!session?.accessToken)
      return ctx.reply("Please login first with /login.");
    try {
      const wallets = await walletsAPI.getWallets(session.accessToken);
      if (wallets.length === 0) return ctx.reply("No wallets found.");
      await ctx.reply(
        "Choose default wallet:",
        walletsKeyboard(wallets, "setdefault")
      );
    } catch (error) {
      console.error("Set default error:", error);
      await ctx.reply("Error fetching wallets.");
    }
  });

  // /deposit
  bot.command("deposit", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    if (!session?.accessToken)
      return ctx.reply("Please login first with /login.");
    try {
      const accounts = await walletsAPI.getDepositAccounts(session.accessToken);
      if (accounts.length === 0) return ctx.reply("No deposit accounts found.");
      let message = "*Deposit Details*\n\n";
      accounts.forEach((a: { network: any; address: any }) => {
        message += `Network: ${a.network}\nAddress: \`${a.address}\`\n\n`;
      });
      await ctx.replyWithMarkdown(message);
    } catch (error) {
      console.error("Deposit error:", error);
      await ctx.reply("Error fetching deposit info.");
    }
  });

  // /history
  bot.command("history", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    if (!session?.accessToken)
      return ctx.reply("Please login first with /login.");
    try {
      const txs = await transfersAPI.getTransfers(Number(session.accessToken));
      if (txs.length === 0) return ctx.reply("No transactions found.");
      let message = "*Recent Transactions*\n\n";
      txs
        .slice(0, 10)
        .forEach((tx, i) => (message += formatTransaction(tx, i + 1)));
      await ctx.replyWithMarkdown(message);
    } catch (error) {
      console.error("History error:", error);
      await ctx.reply("Error fetching history.");
    }
  });

  // /send
  bot.command("send", (ctx) => {
    if (!getSession(ctx.chat!.id)?.accessToken)
      return ctx.reply("Please login first with /login.");
    ctx.scene.enter("sendScene");
  });

  // /sendwallet
  bot.command("sendwallet", (ctx) => {
    if (!getSession(ctx.chat!.id)?.accessToken)
      return ctx.reply("Please login first with /login.");
    ctx.scene.enter("sendWalletScene");
  });

  // /withdraw
  bot.command("withdraw", (ctx) => {
    if (!getSession(ctx.chat!.id)?.accessToken)
      return ctx.reply("Please login first with /login.");
    ctx.scene.enter("withdrawScene");
  });

  // Callback queries
  bot.on("callback_query", async (ctx) => {
    const data = (ctx.callbackQuery as any).data;
    const session = getSession(ctx.chat!.id);
    await ctx.answerCbQuery();

    if (data === "login") {
      // Check if stage is properly registered
      if (!ctx.scene) {
        console.error("Scene context is undefined!");
        await ctx.reply(
          "Sorry, there's an issue with the login system. Please try again later."
        );
        return;
      }

      try {
        // Enter login scene
        await ctx.scene.enter("loginScene");
      } catch (error) {
        console.error("Error entering login scene:", error);
        await ctx.reply(
          "Sorry, there was a problem processing your request. Please try again later."
        );
      }
    } else if (data === "help") {
      bot.telegram.sendMessage(ctx.chat!.id, "/help");
    } else if (data.startsWith("setdefault_")) {
      if (!session?.accessToken)
        return ctx.reply("Please login first with /login.");
      const walletId = data.split("_")[1];
      try {
        await walletsAPI.setDefaultWallet(walletId);
        setSession(ctx.chat!.id, { ...session, defaultWalletId: walletId });
        await ctx.reply("Default wallet set! ✅");
      } catch (error) {
        console.error("Set default error:", error);
        await ctx.reply("Error setting default wallet.");
      }
    } else if (data === "balance") {
      bot.telegram.sendMessage(ctx.chat!.id, "/balance");
    } else if (data === "send_menu") {
      await ctx.reply("Select transfer type:", transferMenuKeyboard());
    } else if (data === "profile") {
      bot.telegram.sendMessage(ctx.chat!.id, "/profile");
    } else if (data === "send_email") {
      bot.telegram.sendMessage(ctx.chat!.id, "/send");
    } else if (data === "send_wallet") {
      bot.telegram.sendMessage(ctx.chat!.id, "/sendwallet");
    } else if (data === "withdraw_bank") {
      bot.telegram.sendMessage(ctx.chat!.id, "/withdraw");
    } else if (data === "deposit") {
      bot.telegram.sendMessage(ctx.chat!.id, "/deposit");
    } else if (data === "history") {
      bot.telegram.sendMessage(ctx.chat!.id, "/history");
    } else if (data === "main_menu") {
      await ctx.reply("Main menu:", mainMenuKeyboard());
    }
  });

  return bot;
}
