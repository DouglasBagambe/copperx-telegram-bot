// app/bot/commands.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Markup } from "telegraf";
import * as authAPI from "../api/auth";
import * as walletsAPI from "../api/wallets";
import * as transfersAPI from "../api/transfers";
import { getSession, setSession, clearSession } from "../utils/session";
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
  defaultWalletInfo?: {
    id: string;
    name: string;
    network: string;
  };
  tempData?: {
    recipient?: string;
    amount?: number;
    walletAddress?: string;
    payeeId?: string;
  };
}

export type MyContext = Scenes.WizardContext & {
  session: CustomSession;
};

// Helper functions to format data for display
const formatProfile = (profile: any) => {
  return `
*👤 Profile Information* 🌟
**Name**: ${profile.name || "N/A"}
**Email**: ${profile.email || "N/A"}
**Organization ID**: ${profile.organizationId || "N/A"}
**KYC Status**: ${profile.kycStatus || "Unknown"}
`;
};

const formatBalance = (balance: any, index: number) => {
  return `${index}. **${balance.network}**: ${formatCurrency(
    balance.balance,
    balance.symbol
  )}\n`;
};

const formatTransaction = (tx: any, index: number) => {
  return (
    `${index}. **${formatTransferType(tx.type)}** - ${formatCurrency(
      tx.amount
    )}\n` +
    `**Status**: ${formatTransferStatus(tx.status)}\n` +
    `**Date**: ${formatDate(tx.createdAt)}\n\n`
  );
};

// Shared function to show a loading animation
const showLoadingAnimation = async (ctx: MyContext, message: string) => {
  const loadingMsg = await ctx.reply(`${message}.`);
  let currentText = `${message}.`;
  const dots = [".", "..", "..."];
  let i = 0;
  const interval = setInterval(async () => {
    const newText = `${message}${dots[i % 3]}`;
    if (newText !== currentText) {
      try {
        await ctx.telegram.editMessageText(
          ctx.chat!.id,
          loadingMsg.message_id,
          undefined,
          newText
        );
        currentText = newText;
      } catch (error) {
        if (!(error as any).message.includes("message is not modified")) {
          console.error("Error updating loading message:", error);
          clearInterval(interval); // Stop on error to avoid rate limiting
        }
      }
    }
    i++;
  }, 1000); // Increased to 1 second
  return { loadingMsg, interval };
};

// Function to get wallet details by ID
const getWalletDetails = async (accessToken: string, walletId: string) => {
  const wallets = await walletsAPI.getWallets(accessToken);
  return wallets.find((w: any) => w.id === walletId);
};

// Shared logic for commands and callbacks
const fetchProfile = async (ctx: MyContext) => {
  const session = getSession(ctx.chat!.id);
  if (!session?.accessToken) {
    return ctx.reply("🔒 Please login first with /login.", mainMenuKeyboard());
  }
  const { loadingMsg, interval } = await showLoadingAnimation(
    ctx,
    "⏳ Loading profile"
  );
  try {
    const profile = await authAPI.getProfile(
      session.accessToken,
      session.organizationId
    );
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.replyWithMarkdown(formatProfile(profile), {
      // reply_markup: mainMenuKeyboard().reply_markup,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Menu 📋", "show_menu"),
      ]).reply_markup,
    });
  } catch (error) {
    console.error("Profile error:", error);
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `❌ Error fetching profile: ${(error as any).message || "Unknown error"}`,
      Markup.inlineKeyboard([
        Markup.button.callback("🔄 Retry", "profile"),
        Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
      ])
    );
  }
};

const fetchKYCStatus = async (ctx: MyContext) => {
  const session = getSession(ctx.chat!.id);
  if (!session?.accessToken) {
    return ctx.reply("🔒 Please login first with /login.", mainMenuKeyboard());
  }
  const { loadingMsg, interval } = await showLoadingAnimation(
    ctx,
    "⏳ Loading KYC status"
  );
  try {
    const kycStatus = await authAPI.getKYCStatus(session.accessToken);
    const status =
      kycStatus && kycStatus.length > 0 ? kycStatus[0].status : "none";
    const message =
      status === "approved"
        ? "✅ KYC approved! You're all set! 🎉"
        : `📋 KYC status: **${status}**. Complete at: [CopperX KYC](https://copperx.io/kyc)`;
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.replyWithMarkdown(message, {
      // reply_markup: mainMenuKeyboard().reply_markup,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Menu 📋", "show_menu"),
      ]).reply_markup,
    });
  } catch (error) {
    console.error("KYC error:", error);
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `❌ Error fetching KYC status: ${
        (error as any).message || "Unknown error"
      }`,
      Markup.inlineKeyboard([
        Markup.button.callback("🔄 Retry", "kyc"),
        Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
      ])
    );
  }
};

const fetchBalance = async (ctx: MyContext) => {
  const session = getSession(ctx.chat!.id);
  if (!session?.accessToken) {
    return ctx.reply("🔒 Please login first with /login.", mainMenuKeyboard());
  }
  const { loadingMsg, interval } = await showLoadingAnimation(
    ctx,
    "⏳ Loading balances"
  );
  try {
    const balances = await walletsAPI.getWalletBalances(session.accessToken);
    if (!Array.isArray(balances) || balances.length === 0) {
      clearInterval(interval);
      await ctx.deleteMessage(loadingMsg.message_id);
      return ctx.reply("💸 No wallets found.", mainMenuKeyboard());
    }
    let message = "*💰 Wallet Balances* 💎\n\n";

    // Add default wallet info if available
    if (session.defaultWalletInfo) {
      message += `*🏦 Default Wallet*: ${session.defaultWalletInfo.name} (${session.defaultWalletInfo.network})\n\n`;
    }

    balances.forEach((b, i) => (message += formatBalance(b, i + 1)));
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.replyWithMarkdown(message, {
      // reply_markup: mainMenuKeyboard().reply_markup,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Menu 📋", "show_menu"),
      ]).reply_markup,
    });
  } catch (error) {
    console.error("Balance error:", error);
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `❌ Error fetching balances: ${
        (error as any).message || "Unknown error"
      }`,
      Markup.inlineKeyboard([
        Markup.button.callback("🔄 Retry", "balance"),
        Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
      ])
    );
  }
};

const fetchDepositInfo = async (ctx: MyContext) => {
  const session = getSession(ctx.chat!.id);
  if (!session?.accessToken) {
    return ctx.reply("🔒 Please login first with /login.", mainMenuKeyboard());
  }
  const { loadingMsg, interval } = await showLoadingAnimation(
    ctx,
    "⏳ Loading deposit info"
  );
  try {
    const accounts = await walletsAPI.getDepositAccounts(session.accessToken);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      clearInterval(interval);
      await ctx.deleteMessage(loadingMsg.message_id);
      return ctx.reply("📥 No deposit accounts found.", mainMenuKeyboard());
    }
    let message = "*📥 Deposit Details* 📬\n\n";
    accounts.forEach((a: { network: any; address: any }) => {
      message += `**Network**: ${a.network}\n**Address**: \`${a.address}\`\n\n`;
    });
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.replyWithMarkdown(message, {
      // reply_markup: mainMenuKeyboard().reply_markup,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Menu 📋", "show_menu"),
      ]).reply_markup,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `❌ Error fetching deposit info: ${
        (error as any).message || "Unknown error"
      }`,
      Markup.inlineKeyboard([
        Markup.button.callback("🔄 Retry", "deposit"),
        Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
      ])
    );
  }
};

const fetchHistory = async (ctx: MyContext) => {
  const session = getSession(ctx.chat!.id);
  if (!session?.accessToken) {
    return ctx.reply("🔒 Please login first with /login.", mainMenuKeyboard());
  }
  const { loadingMsg, interval } = await showLoadingAnimation(
    ctx,
    "⏳ Loading transaction history"
  );
  try {
    const page = 1;
    const limit = 10;
    const txs = await transfersAPI.getTransfers(
      session.accessToken,
      page,
      limit
    );
    if (!Array.isArray(txs) || txs.length === 0) {
      clearInterval(interval);
      await ctx.deleteMessage(loadingMsg.message_id);
      return ctx.reply("📜 No transactions found.", mainMenuKeyboard());
    }
    let message = "*📜 Recent Transactions* 📅\n\n";
    txs
      .slice(0, 10)
      .forEach((tx, i) => (message += formatTransaction(tx, i + 1)));
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.replyWithMarkdown(message, {
      // reply_markup: mainMenuKeyboard().reply_markup,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Menu 📋", "show_menu"),
      ]).reply_markup,
    });
  } catch (error) {
    console.error("History error:", error);
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `❌ Error fetching history: ${(error as any).message || "Unknown error"}`,
      Markup.inlineKeyboard([
        Markup.button.callback("🔄 Retry", "history"),
        Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
      ])
    );
  }
};

const fetchDashboard = async (ctx: MyContext) => {
  const session = getSession(ctx.chat!.id);
  if (!session?.accessToken) {
    return ctx.reply("🔒 Please login first with /login.", mainMenuKeyboard());
  }
  try {
    const { loadingMsg, interval } = await showLoadingAnimation(
      ctx,
      "⏳ Loading dashboard"
    );

    // Make API calls
    const [profile, balances, txs] = await Promise.all([
      authAPI.getProfile(session.accessToken, session.organizationId),
      walletsAPI.getWalletBalances(session.accessToken).catch(() => []),
      transfersAPI.getTransfers(session.accessToken, 1, 3).catch(() => []),
    ]);

    let message = "*📊 Dashboard Overview* 🌟\n\n";

    // Check if profile exists
    if (profile) {
      message += `**👤 Profile**\nName: ${profile.name || "N/A"}\nEmail: ${
        profile.email || "N/A"
      }\n\n`;
    } else {
      message += "**👤 Profile**\nUnable to load profile data\n\n";
    }

    // Display default wallet if available
    if (session.defaultWalletInfo) {
      message += `**🏦 Default Wallet**\n${session.defaultWalletInfo.name} (${session.defaultWalletInfo.network})\n\n`;
    } else {
      message +=
        "**🏦 Default Wallet**\nNot set. Use /setdefault to set one.\n\n";
    }

    // Check if balances exists and is an array
    message += `**💰 Balances**\n`;
    if (!balances || !Array.isArray(balances) || balances.length === 0) {
      message += "No wallets found.\n";
    } else {
      balances
        .slice(0, 3)
        .forEach((b, i) => (message += formatBalance(b, i + 1)));
    }

    // Check if txs exists and is an array
    message += "\n**📜 Recent Transactions**\n";
    if (!txs || !Array.isArray(txs) || txs.length === 0) {
      message += "No transactions found.\n";
    } else {
      txs.forEach((tx, i) => (message += formatTransaction(tx, i + 1)));
    }

    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.replyWithMarkdown(message, {
      // reply_markup: mainMenuKeyboard().reply_markup,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Menu 📋", "show_menu"),
      ]).reply_markup,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    const { loadingMsg, interval } = await showLoadingAnimation(
      ctx,
      "⏳ Loading dashboard"
    );
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `❌ Error loading dashboard: ${
        (error as Error).message || "Unknown error"
      }`,
      Markup.inlineKeyboard([
        Markup.button.callback("🔄 Retry", "dashboard"),
        Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
      ])
    );
  }
};

const setDefaultWallet = async (ctx: MyContext, walletId: string) => {
  const session = getSession(ctx.chat!.id);
  if (!session?.accessToken) {
    return ctx.reply("🔒 Please login first with /login.", mainMenuKeyboard());
  }
  const { loadingMsg, interval } = await showLoadingAnimation(
    ctx,
    "⏳ Setting default wallet"
  );
  try {
    // Call API to set default wallet
    await walletsAPI.setDefaultWallet(walletId, session.accessToken);

    // Get wallet details to store for reference
    const walletDetails = await getWalletDetails(session.accessToken, walletId);

    // Store both the ID and additional wallet info
    setSession(ctx.chat!.id, {
      ...session,
      defaultWalletId: walletId,
      defaultWalletInfo: {
        id: walletId,
        name: walletDetails?.name || "Wallet",
        network: walletDetails?.network || "Unknown",
      },
    });

    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `🏦 Default wallet set to: ${walletDetails?.name || "Wallet"} (${
        walletDetails?.network || "Unknown"
      }) ✅`,
      mainMenuKeyboard()
    );
  } catch (error) {
    console.error("Set default error:", error);
    clearInterval(interval);
    await ctx.deleteMessage(loadingMsg.message_id);
    await ctx.reply(
      `❌ Error setting default wallet: ${
        (error as any).message || "Unknown error"
      }`,
      Markup.inlineKeyboard([
        Markup.button.callback("🔄 Retry", `setdefault_${walletId}`),
        Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
      ])
    );
  }
};

const logoutUser = async (ctx: MyContext) => {
  const chatId = ctx.chat!.id;
  clearSession(chatId);
  await ctx.reply(
    "🔓 You have been logged out successfully!",
    Markup.inlineKeyboard([[Markup.button.callback("🔐 Login Again", "login")]])
  );
};

export function setupCommands(bot: Telegraf<MyContext>) {
  // Set up bot menu commands
  bot.telegram.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "login", description: "Authenticate with CopperX" },
    { command: "dashboard", description: "View dashboard overview" },
    { command: "profile", description: "View your profile" },
    { command: "kyc", description: "Check KYC status" },
    { command: "balance", description: "Show wallet balances" },
    { command: "setdefault", description: "Set default wallet" },
    { command: "deposit", description: "Get deposit info" },
    { command: "history", description: "View recent transactions" },
    { command: "send", description: "Send USDC to email" },
    { command: "sendwallet", description: "Send USDC to wallet" },
    { command: "withdraw", description: "Withdraw to bank" },
    { command: "logout", description: "Logout from the bot" },
    { command: "help", description: "Show help information" },
  ]);

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
    try {
      const session = getSession(ctx.chat!.id);
      const welcomeBanner = `
  *🌟 Welcome to CopperX Payout Bot 🌟*
  
  💸 **Manage your crypto payouts with ease!**
  
  🔐 Please login to get started.
      `;
      const keyboard = session?.accessToken
        ? mainMenuKeyboard()
        : Markup.inlineKeyboard([
            [Markup.button.callback("🔐 Login", "login")],
          ]);
      await ctx.replyWithMarkdown(welcomeBanner, {
        reply_markup: keyboard.reply_markup,
      });
    } catch (error: any) {
      if (error.response?.error_code === 429) {
        const retryAfter = error.response.parameters.retry_after || 60;
        await ctx.reply(
          `⚠️ Telegram rate limit hit. Please wait ${retryAfter} seconds and try again.`
        );
        return;
      }
      console.error("Error in /start command:", error);
      await ctx.reply(
        "❌ An error occurred while starting the bot. Please try again later."
      );
    }
  });

  // /help
  bot.command("help", async (ctx) => {
    const helpText = `
*📖 Commands Guide* ℹ️

**🚀 /start** - Start the bot
**🔐 /login** - Authenticate with CopperX
**📊 /dashboard** - View dashboard overview
**👤 /profile** - View your profile
**✅ /kyc** - Check KYC status
**💰 /balance** - Show wallet balances
**🏦 /setdefault** - Set default wallet
**📥 /deposit** - Get deposit info
**📜 /history** - View recent transactions
**📧 /send** - Send USDC to email
**🌐 /sendwallet** - Send USDC to wallet
**🏧 /withdraw** - Withdraw to bank
**ℹ️ /help** - Show this message
**🔓 /logout** - Logout from the bot

*💬 Support*: [Join our community!](https://t.me/copperxcommunity/2183)
    `;
    await ctx.replyWithMarkdown(helpText, {
      // reply_markup: mainMenuKeyboard().reply_markup,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback("Menu 📋", "show_menu"),
      ]).reply_markup,
    });
  });

  // /login
  bot.command("login", (ctx) => ctx.scene.enter("loginScene"));

  // /logout
  bot.command("logout", logoutUser);

  // /profile
  bot.command("profile", fetchProfile);

  // /kyc
  bot.command("kyc", fetchKYCStatus);

  // /balance
  bot.command("balance", fetchBalance);

  // /dashboard
  bot.command("dashboard", fetchDashboard);

  // /setdefault
  bot.command("setdefault", async (ctx) => {
    const session = getSession(ctx.chat!.id);
    if (!session?.accessToken) {
      return ctx.reply(
        "🔒 Please login first with /login.",
        mainMenuKeyboard()
      );
    }
    const { loadingMsg, interval } = await showLoadingAnimation(
      ctx,
      "⏳ Loading wallets"
    );
    try {
      const wallets = await walletsAPI.getWallets(session.accessToken);
      if (!Array.isArray(wallets) || wallets.length === 0) {
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        return ctx.reply(
          "🏦 No wallets found. Please add a wallet on the Copperx platform.",
          mainMenuKeyboard()
        );
      }
      clearInterval(interval);
      await ctx.deleteMessage(loadingMsg.message_id);
      await ctx.reply(
        "🏦 Choose default wallet:",
        walletsKeyboard(wallets, "setdefault")
      );
    } catch (error) {
      console.error("Set default error:", error);
      clearInterval(interval);
      await ctx.deleteMessage(loadingMsg.message_id);
      await ctx.reply(
        `❌ Error fetching wallets: ${
          (error as any).message || "Unknown error"
        }`,
        Markup.inlineKeyboard([
          Markup.button.callback("🔄 Retry", "setdefault"),
          Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ])
      );
    }
  });

  // /deposit
  bot.command("deposit", fetchDepositInfo);

  // /history
  bot.command("history", fetchHistory);

  // /send
  bot.command("send", (ctx) => {
    if (!getSession(ctx.chat!.id)?.accessToken) {
      return ctx.reply(
        "🔒 Please login first with /login.",
        mainMenuKeyboard()
      );
    }
    ctx.scene.enter("sendScene");
  });

  // /sendwallet
  bot.command("sendwallet", (ctx) => {
    if (!getSession(ctx.chat!.id)?.accessToken) {
      return ctx.reply(
        "🔒 Please login first with /login.",
        mainMenuKeyboard()
      );
    }
    ctx.scene.enter("sendWalletScene");
  });

  // /withdraw
  bot.command("withdraw", (ctx) => {
    if (!getSession(ctx.chat!.id)?.accessToken) {
      return ctx.reply(
        "🔒 Please login first with /login.",
        mainMenuKeyboard()
      );
    }
    ctx.scene.enter("withdrawScene");
  });

  // Callback queries
  bot.on("callback_query", async (ctx) => {
    const data = (ctx.callbackQuery as any).data;
    const session = getSession(ctx.chat!.id);
    await ctx.answerCbQuery();

    if (data === "login") {
      if (!ctx.scene) {
        console.error("Scene context is undefined!");
        await ctx.reply(
          "❌ Sorry, there's an issue with the login system. Please try again later.",
          mainMenuKeyboard()
        );
        return;
      }
      try {
        await ctx.scene.enter("loginScene");
      } catch (error) {
        console.error("Error entering login scene:", error);
        await ctx.reply(
          "❌ Sorry, there was a problem processing your request. Please try again later.",
          mainMenuKeyboard()
        );
      }
    } else if (data === "logout") {
      await logoutUser(ctx);
    } else if (data === "help") {
      const helpText = `
*📖 Commands Guide* ℹ️

**🚀 /start** - Start the bot
**🔐 /login** - Authenticate with CopperX
**📊 /dashboard** - View dashboard overview
**👤 /profile** - View your profile
**✅ /kyc** - Check KYC status
**💰 /balance** - Show wallet balances
**🏦 /setdefault** - Set default wallet
**📥 /deposit** - Get deposit info
**📜 /history** - View recent transactions
**📧 /send** - Send USDC to email
**🌐 /sendwallet** - Send USDC to wallet
**🏧 /withdraw** - Withdraw to bank
**ℹ️ /help** - Show this message
**🔓 /logout** - Logout from the bot

*💬 Support*: [Join our community!](https://t.me/copperxcommunity/2183)
      `;
      await ctx.replyWithMarkdown(helpText, {
        // reply_markup: mainMenuKeyboard().reply_markup,
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback("Menu 📋", "show_menu"),
        ]).reply_markup,
      });
    } else if (data.startsWith("setdefault_")) {
      const walletId = data.split("_")[1];
      await setDefaultWallet(ctx, walletId);
    } else if (data === "balance") {
      await fetchBalance(ctx);
    } else if (data === "dashboard") {
      await fetchDashboard(ctx);
    } else if (data === "send_menu") {
      await ctx.reply("💸 Select transfer type:", transferMenuKeyboard());
    } else if (data === "profile") {
      await fetchProfile(ctx);
    } else if (data === "kyc") {
      await fetchKYCStatus(ctx);
    } else if (data === "send_email") {
      if (!session?.accessToken) {
        return ctx.reply(
          "🔒 Please login first with /login.",
          mainMenuKeyboard()
        );
      }
      await ctx.scene.enter("sendScene");
    } else if (data === "send_wallet") {
      if (!session?.accessToken) {
        return ctx.reply(
          "🔒 Please login first with /login.",
          mainMenuKeyboard()
        );
      }
      await ctx.scene.enter("sendWalletScene");
    } else if (data === "withdraw_bank") {
      if (!session?.accessToken) {
        return ctx.reply(
          "🔒 Please login first with /login.",
          mainMenuKeyboard()
        );
      }
      await ctx.scene.enter("withdrawScene");
    } else if (data === "deposit") {
      await fetchDepositInfo(ctx);
    } else if (data === "history") {
      await fetchHistory(ctx);
    } else if (data === "main_menu") {
      await ctx.reply("🌟 Main Menu:", mainMenuKeyboard());
    } else if (data === "show_menu") {
      await ctx.reply("🌟 Main Menu:", mainMenuKeyboard());
    }
  });

  return bot;
}
