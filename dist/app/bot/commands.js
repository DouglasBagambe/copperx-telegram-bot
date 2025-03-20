"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommands = setupCommands;
// app/bot/commands.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const telegraf_1 = require("telegraf");
const authAPI = __importStar(require("../api/auth"));
const walletsAPI = __importStar(require("../api/wallets"));
const transfersAPI = __importStar(require("../api/transfers"));
const session_1 = require("../utils/session");
const format_1 = require("../utils/format");
const pusher_1 = require("../notifications/pusher");
const menus_1 = require("./menus");
// Helper functions to format data for display
const formatProfile = (profile) => {
    return `
*👤 Profile Information* 🌟
**Name**: ${profile.name || "N/A"}
**Email**: ${profile.email || "N/A"}
**Organization**: ${profile.organization?.name || "N/A"}
**KYC Status**: ${profile.kycStatus || "Unknown"}
`;
};
const formatBalance = (balance, index) => {
    return `${index}. **${balance.network}**: ${(0, format_1.formatCurrency)(balance.balance, balance.symbol)}\n`;
};
const formatTransaction = (tx, index) => {
    return (`${index}. **${(0, format_1.formatTransferType)(tx.type)}** - ${(0, format_1.formatCurrency)(tx.amount)}\n` +
        `**Status**: ${(0, format_1.formatTransferStatus)(tx.status)}\n` +
        `**Date**: ${(0, format_1.formatDate)(tx.createdAt)}\n\n`);
};
// Shared function to show a loading animation
const showLoadingAnimation = async (ctx, message) => {
    const loadingMsg = await ctx.reply(`${message}.`);
    let currentText = `${message}.`;
    const dots = [".", "..", "..."];
    let i = 0;
    const interval = setInterval(async () => {
        const newText = `${message}${dots[i % 3]}`;
        if (newText !== currentText) {
            try {
                await ctx.telegram.editMessageText(ctx.chat.id, loadingMsg.message_id, undefined, newText);
                currentText = newText;
            }
            catch (error) {
                // Ignore "message is not modified" errors, but log other errors
                if (!error.message.includes("message is not modified")) {
                    console.error("Error updating loading message:", error);
                }
            }
        }
        i++;
    }, 500);
    return { loadingMsg, interval };
};
// Function to get wallet details by ID
const getWalletDetails = async (accessToken, walletId) => {
    const wallets = await walletsAPI.getWallets(accessToken);
    return wallets.find((w) => w.id === walletId);
};
// Shared logic for commands and callbacks
const fetchProfile = async (ctx) => {
    const session = (0, session_1.getSession)(ctx.chat.id);
    if (!session?.accessToken) {
        return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
    }
    const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading profile");
    try {
        const profile = await authAPI.getProfile(session.accessToken, session.organizationId);
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.replyWithMarkdown(formatProfile(profile), {
            reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
        });
    }
    catch (error) {
        console.error("Profile error:", error);
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.reply(`❌ Error fetching profile: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("🔄 Retry", "profile"),
            telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ]));
    }
};
const fetchKYCStatus = async (ctx) => {
    const session = (0, session_1.getSession)(ctx.chat.id);
    if (!session?.accessToken) {
        return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
    }
    const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading KYC status");
    try {
        const kycStatus = await authAPI.getKYCStatus(session.accessToken);
        const status = kycStatus && kycStatus.length > 0 ? kycStatus[0].status : "none";
        const message = status === "approved"
            ? "✅ KYC approved! You're all set! 🎉"
            : `📋 KYC status: **${status}**. Complete at: [CopperX KYC](https://copperx.io/kyc)`;
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.replyWithMarkdown(message, {
            reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
        });
    }
    catch (error) {
        console.error("KYC error:", error);
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.reply(`❌ Error fetching KYC status: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("🔄 Retry", "kyc"),
            telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ]));
    }
};
const fetchBalance = async (ctx) => {
    const session = (0, session_1.getSession)(ctx.chat.id);
    if (!session?.accessToken) {
        return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
    }
    const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading balances");
    try {
        const balances = await walletsAPI.getWalletBalances(session.accessToken);
        if (!Array.isArray(balances) || balances.length === 0) {
            clearInterval(interval);
            await ctx.deleteMessage(loadingMsg.message_id);
            return ctx.reply("💸 No wallets found.", (0, menus_1.mainMenuKeyboard)());
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
            reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
        });
    }
    catch (error) {
        console.error("Balance error:", error);
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.reply(`❌ Error fetching balances: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("🔄 Retry", "balance"),
            telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ]));
    }
};
const fetchDepositInfo = async (ctx) => {
    const session = (0, session_1.getSession)(ctx.chat.id);
    if (!session?.accessToken) {
        return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
    }
    const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading deposit info");
    try {
        const accounts = await walletsAPI.getDepositAccounts(session.accessToken);
        if (!Array.isArray(accounts) || accounts.length === 0) {
            clearInterval(interval);
            await ctx.deleteMessage(loadingMsg.message_id);
            return ctx.reply("📥 No deposit accounts found.", (0, menus_1.mainMenuKeyboard)());
        }
        let message = "*📥 Deposit Details* 📬\n\n";
        accounts.forEach((a) => {
            message += `**Network**: ${a.network}\n**Address**: \`${a.address}\`\n\n`;
        });
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.replyWithMarkdown(message, {
            reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
        });
    }
    catch (error) {
        console.error("Deposit error:", error);
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.reply(`❌ Error fetching deposit info: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("🔄 Retry", "deposit"),
            telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ]));
    }
};
const fetchHistory = async (ctx) => {
    const session = (0, session_1.getSession)(ctx.chat.id);
    if (!session?.accessToken) {
        return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
    }
    const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading transaction history");
    try {
        const page = 1;
        const limit = 10;
        const txs = await transfersAPI.getTransfers(session.accessToken, page, limit);
        if (!Array.isArray(txs) || txs.length === 0) {
            clearInterval(interval);
            await ctx.deleteMessage(loadingMsg.message_id);
            return ctx.reply("📜 No transactions found.", (0, menus_1.mainMenuKeyboard)());
        }
        let message = "*📜 Recent Transactions* 📅\n\n";
        txs
            .slice(0, 10)
            .forEach((tx, i) => (message += formatTransaction(tx, i + 1)));
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.replyWithMarkdown(message, {
            reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
        });
    }
    catch (error) {
        console.error("History error:", error);
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.reply(`❌ Error fetching history: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("🔄 Retry", "history"),
            telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ]));
    }
};
const fetchDashboard = async (ctx) => {
    const session = (0, session_1.getSession)(ctx.chat.id);
    if (!session?.accessToken) {
        return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
    }
    try {
        const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading dashboard");
        // Make API calls
        const [profile, balances, txs] = await Promise.all([
            authAPI.getProfile(session.accessToken, session.organizationId),
            walletsAPI.getWalletBalances(session.accessToken).catch(() => []),
            transfersAPI.getTransfers(session.accessToken, 1, 3).catch(() => []),
        ]);
        let message = "*📊 Dashboard Overview* 🌟\n\n";
        // Check if profile exists
        if (profile) {
            message += `**👤 Profile**\nName: ${profile.name || "N/A"}\nEmail: ${profile.email || "N/A"}\n\n`;
        }
        else {
            message += "**👤 Profile**\nUnable to load profile data\n\n";
        }
        // Display default wallet if available
        if (session.defaultWalletInfo) {
            message += `**🏦 Default Wallet**\n${session.defaultWalletInfo.name} (${session.defaultWalletInfo.network})\n\n`;
        }
        else {
            message +=
                "**🏦 Default Wallet**\nNot set. Use /setdefault to set one.\n\n";
        }
        // Check if balances exists and is an array
        message += `**💰 Balances**\n`;
        if (!balances || !Array.isArray(balances) || balances.length === 0) {
            message += "No wallets found.\n";
        }
        else {
            balances
                .slice(0, 3)
                .forEach((b, i) => (message += formatBalance(b, i + 1)));
        }
        // Check if txs exists and is an array
        message += "\n**📜 Recent Transactions**\n";
        if (!txs || !Array.isArray(txs) || txs.length === 0) {
            message += "No transactions found.\n";
        }
        else {
            txs.forEach((tx, i) => (message += formatTransaction(tx, i + 1)));
        }
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.replyWithMarkdown(message, {
            reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
        });
    }
    catch (error) {
        console.error("Dashboard error:", error);
        const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading dashboard");
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.reply(`❌ Error loading dashboard: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("🔄 Retry", "dashboard"),
            telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ]));
    }
};
const setDefaultWallet = async (ctx, walletId) => {
    const session = (0, session_1.getSession)(ctx.chat.id);
    if (!session?.accessToken) {
        return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
    }
    const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Setting default wallet");
    try {
        // Call API to set default wallet
        await walletsAPI.setDefaultWallet(walletId, session.accessToken);
        // Get wallet details to store for reference
        const walletDetails = await getWalletDetails(session.accessToken, walletId);
        // Store both the ID and additional wallet info
        (0, session_1.setSession)(ctx.chat.id, {
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
        await ctx.reply(`🏦 Default wallet set to: ${walletDetails?.name || "Wallet"} (${walletDetails?.network || "Unknown"}) ✅`, (0, menus_1.mainMenuKeyboard)());
    }
    catch (error) {
        console.error("Set default error:", error);
        clearInterval(interval);
        await ctx.deleteMessage(loadingMsg.message_id);
        await ctx.reply(`❌ Error setting default wallet: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("🔄 Retry", `setdefault_${walletId}`),
            telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
        ]));
    }
};
const logoutUser = async (ctx) => {
    const chatId = ctx.chat.id;
    (0, session_1.clearSession)(chatId);
    await ctx.reply("🔓 You have been logged out successfully!", telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback("🔐 Login Again", "login")]]));
};
function setupCommands(bot) {
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
            const session = (0, session_1.getSession)(chatId);
            if (session?.accessToken && session?.organizationId) {
                try {
                    await authAPI.getProfile(session.accessToken, session.organizationId);
                    (0, pusher_1.setupPusherNotifications)(bot, chatId, session.organizationId);
                }
                catch (error) {
                    console.error("Invalid session token:", error);
                    (0, session_1.setSession)(chatId, {});
                }
            }
        }
        return next();
    });
    // /start
    bot.command("start", async (ctx) => {
        const session = (0, session_1.getSession)(ctx.chat.id);
        const welcomeBanner = `
*🌟 Welcome to CopperX Payout Bot 🌟*

💸 **Manage your crypto payouts with ease!**

${session?.accessToken
            ? "🚀 Welcome back! What would you like to do today?"
            : "🔐 Please login to get started."}
    `;
        const keyboard = session?.accessToken
            ? (0, menus_1.mainMenuKeyboard)()
            : telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback("🔐 Login", "login")]]);
        await ctx.replyWithMarkdown(welcomeBanner, {
            reply_markup: keyboard.reply_markup,
        });
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
            reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
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
        const session = (0, session_1.getSession)(ctx.chat.id);
        if (!session?.accessToken) {
            return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
        }
        const { loadingMsg, interval } = await showLoadingAnimation(ctx, "⏳ Loading wallets");
        try {
            const wallets = await walletsAPI.getWallets(session.accessToken);
            if (!Array.isArray(wallets) || wallets.length === 0) {
                clearInterval(interval);
                await ctx.deleteMessage(loadingMsg.message_id);
                return ctx.reply("🏦 No wallets found.", (0, menus_1.mainMenuKeyboard)());
            }
            clearInterval(interval);
            await ctx.deleteMessage(loadingMsg.message_id);
            await ctx.reply("🏦 Choose default wallet:", (0, menus_1.walletsKeyboard)(wallets, "setdefault"));
        }
        catch (error) {
            console.error("Set default error:", error);
            clearInterval(interval);
            await ctx.deleteMessage(loadingMsg.message_id);
            await ctx.reply(`❌ Error fetching wallets: ${error.message || "Unknown error"}`, telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.callback("🔄 Retry", "setdefault"),
                telegraf_1.Markup.button.callback("⬅️ Back to Main Menu", "main_menu"),
            ]));
        }
    });
    // /deposit
    bot.command("deposit", fetchDepositInfo);
    // /history
    bot.command("history", fetchHistory);
    // /send
    bot.command("send", (ctx) => {
        if (!(0, session_1.getSession)(ctx.chat.id)?.accessToken) {
            return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
        }
        ctx.scene.enter("sendScene");
    });
    // /sendwallet
    bot.command("sendwallet", (ctx) => {
        if (!(0, session_1.getSession)(ctx.chat.id)?.accessToken) {
            return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
        }
        ctx.scene.enter("sendWalletScene");
    });
    // /withdraw
    bot.command("withdraw", (ctx) => {
        if (!(0, session_1.getSession)(ctx.chat.id)?.accessToken) {
            return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
        }
        ctx.scene.enter("withdrawScene");
    });
    // Callback queries
    bot.on("callback_query", async (ctx) => {
        const data = ctx.callbackQuery.data;
        const session = (0, session_1.getSession)(ctx.chat.id);
        await ctx.answerCbQuery();
        if (data === "login") {
            if (!ctx.scene) {
                console.error("Scene context is undefined!");
                await ctx.reply("❌ Sorry, there's an issue with the login system. Please try again later.", (0, menus_1.mainMenuKeyboard)());
                return;
            }
            try {
                await ctx.scene.enter("loginScene");
            }
            catch (error) {
                console.error("Error entering login scene:", error);
                await ctx.reply("❌ Sorry, there was a problem processing your request. Please try again later.", (0, menus_1.mainMenuKeyboard)());
            }
        }
        else if (data === "logout") {
            await logoutUser(ctx);
        }
        else if (data === "help") {
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
                reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
            });
        }
        else if (data.startsWith("setdefault_")) {
            const walletId = data.split("_")[1];
            await setDefaultWallet(ctx, walletId);
        }
        else if (data === "balance") {
            await fetchBalance(ctx);
        }
        else if (data === "dashboard") {
            await fetchDashboard(ctx);
        }
        else if (data === "send_menu") {
            await ctx.reply("💸 Select transfer type:", (0, menus_1.transferMenuKeyboard)());
        }
        else if (data === "profile") {
            await fetchProfile(ctx);
        }
        else if (data === "kyc") {
            await fetchKYCStatus(ctx);
        }
        else if (data === "send_email") {
            if (!session?.accessToken) {
                return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
            }
            await ctx.scene.enter("sendScene");
        }
        else if (data === "send_wallet") {
            if (!session?.accessToken) {
                return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
            }
            await ctx.scene.enter("sendWalletScene");
        }
        else if (data === "withdraw_bank") {
            if (!session?.accessToken) {
                return ctx.reply("🔒 Please login first with /login.", (0, menus_1.mainMenuKeyboard)());
            }
            await ctx.scene.enter("withdrawScene");
        }
        else if (data === "deposit") {
            await fetchDepositInfo(ctx);
        }
        else if (data === "history") {
            await fetchHistory(ctx);
        }
        else if (data === "main_menu") {
            await ctx.reply("🌟 Main Menu:", (0, menus_1.mainMenuKeyboard)());
        }
    });
    return bot;
}
