"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stageMiddleware = exports.stage = exports.BATCH_SEND_SCENE_ID = exports.WITHDRAW_SCENE_ID = exports.SEND_WALLET_SCENE_ID = exports.SEND_SCENE_ID = exports.LOGIN_SCENE_ID = void 0;
// app/bot/scenes.ts
const telegraf_1 = require("telegraf");
const auth_1 = require("../api/auth");
const transfers_1 = require("../api/transfers");
const session_1 = require("../utils/session");
const format_1 = require("../utils/format");
const menus_1 = require("./menus");
// Scene IDs
exports.LOGIN_SCENE_ID = "loginScene";
exports.SEND_SCENE_ID = "sendScene";
exports.SEND_WALLET_SCENE_ID = "sendWalletScene";
exports.WITHDRAW_SCENE_ID = "withdrawScene";
exports.BATCH_SEND_SCENE_ID = "batchSendScene";
// Login scene
const loginScene = new telegraf_1.Scenes.WizardScene(exports.LOGIN_SCENE_ID, 
// Step 1: Request email
async (ctx) => {
    await ctx.reply("📧 Please enter your email address:");
    return ctx.wizard.next();
}, 
// Step 2: Request OTP
async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please enter a valid email address.");
        return;
    }
    const email = ctx.message.text.trim();
    if (!email.includes("@") || !email.includes(".")) {
        await ctx.reply("❌ Invalid email format. Please try again:");
        return;
    }
    ctx.wizard.state.email = email;
    try {
        const response = await (0, auth_1.requestEmailOTP)(email);
        ctx.wizard.state.sid = response.sid;
        await ctx.reply(`🔑 OTP sent to *${email}*. Please enter the code you received:`, { parse_mode: "Markdown" });
        return ctx.wizard.next();
    }
    catch (error) {
        console.error("OTP request error:", error);
        await ctx.reply("❌ Error sending OTP. Please try again later.");
        return ctx.scene.leave();
    }
}, 
// Step 3: Verify OTP
async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please enter a valid OTP code.");
        return;
    }
    const otp = ctx.message.text.trim();
    const { email, sid } = ctx.wizard.state;
    if (!email || !sid) {
        await ctx.reply("❌ Session error. Please restart with /login.");
        return ctx.scene.leave();
    }
    try {
        const authResponse = await (0, auth_1.authenticateWithOTP)(email, otp, sid);
        const expireAt = new Date();
        expireAt.setHours(expireAt.getHours() + 24);
        (0, session_1.setSession)(ctx.chat.id, {
            accessToken: authResponse.accessToken,
            organizationId: authResponse.organizationId || "",
            expireAt: expireAt.toISOString(),
        });
        await ctx.reply("🎉 Login successful! You're all set! ✅", (0, menus_1.mainMenuKeyboard)());
        return ctx.scene.leave();
    }
    catch (error) {
        console.error("OTP verification error:", error);
        const errorMessage = error.message || "Authentication failed";
        if (errorMessage.includes("not the latest one")) {
            await ctx.reply("⏳ Your OTP has expired. Request a new one?", telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.button.callback("🔄 Request New OTP", "request_new_otp"),
                telegraf_1.Markup.button.callback("❌ Cancel", "cancel_login"),
            ]));
            return ctx.wizard.next();
        }
        await ctx.reply(`❌ Authentication failed: ${errorMessage}. Try /login again.`);
        return ctx.scene.leave();
    }
}, 
// Step 4: Handle new OTP request or cancel
async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery))
        return;
    const action = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    if (action === "request_new_otp") {
        ctx.wizard.selectStep(1); // Go back to step 2 (request OTP)
        return ctx.wizard.selectStep(1);
    }
    else {
        await ctx.reply("🔒 Login canceled.", (0, menus_1.mainMenuKeyboard)());
        return ctx.scene.leave();
    }
});
// Send to email scene
const sendScene = new telegraf_1.Scenes.WizardScene(exports.SEND_SCENE_ID, async (ctx) => {
    await ctx.reply("📧 Enter recipient email address:");
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please enter a valid email address.");
        return;
    }
    const email = ctx.message.text.trim();
    if (!email.includes("@") || !email.includes(".")) {
        await ctx.reply("❌ Invalid email format. Please try again:");
        return;
    }
    ctx.wizard.state.recipient = email;
    await ctx.reply("💸 Enter amount to send (in USDC):");
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please enter a valid amount.");
        return;
    }
    const amountText = ctx.message.text.trim().replace(",", ".");
    const amount = parseFloat(amountText);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply("❌ Invalid amount. Please enter a positive number:");
        return;
    }
    ctx.wizard.state.amount = amount;
    const { recipient } = ctx.wizard.state;
    await ctx.reply(`📤 *Please confirm transfer:*\n\nSend *${(0, format_1.formatCurrency)(amount)}* to *${recipient}*`, {
        parse_mode: "Markdown",
        reply_markup: telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("✅ Confirm", "confirm_send"),
            telegraf_1.Markup.button.callback("❌ Cancel", "cancel_send"),
        ]).reply_markup,
    });
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery))
        return;
    const action = ctx.callbackQuery.data;
    const { recipient, amount } = ctx.wizard.state;
    await ctx.answerCbQuery();
    if (action === "confirm_send") {
        try {
            const transfer = await (0, transfers_1.sendToEmail)(recipient, amount.toString());
            await ctx.reply(`🎉 *Successfully sent ${(0, format_1.formatCurrency)(amount)} to ${recipient}!*\n\nTransaction ID: ${transfer.id}`, {
                parse_mode: "Markdown",
                reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
            });
        }
        catch (error) {
            console.error("Send to email error:", error);
            await ctx.reply(`❌ Error: ${error.message || "Failed to send funds."}`, (0, menus_1.mainMenuKeyboard)());
        }
    }
    else {
        await ctx.reply("📤 Transfer canceled.", (0, menus_1.mainMenuKeyboard)());
    }
    return ctx.scene.leave();
});
// Send to wallet scene
const sendWalletScene = new telegraf_1.Scenes.WizardScene(exports.SEND_WALLET_SCENE_ID, async (ctx) => {
    await ctx.reply("🌐 Enter recipient wallet address:");
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please enter a valid wallet address.");
        return;
    }
    const walletAddress = ctx.message.text.trim();
    if (walletAddress.length < 20) {
        await ctx.reply("❌ Invalid wallet address format. Please try again:");
        return;
    }
    ctx.wizard.state.walletAddress = walletAddress;
    await ctx.reply("💸 Enter amount to send (in USDC):");
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please enter a valid amount.");
        return;
    }
    const amountText = ctx.message.text.trim().replace(",", ".");
    const amount = parseFloat(amountText);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply("❌ Invalid amount. Please enter a positive number:");
        return;
    }
    ctx.wizard.state.amount = amount;
    const { walletAddress } = ctx.wizard.state;
    const formattedAddress = (0, format_1.formatWalletAddress)(walletAddress);
    await ctx.reply(`📤 *Please confirm transfer:*\n\nSend *${(0, format_1.formatCurrency)(amount)}* to wallet *${formattedAddress}*`, {
        parse_mode: "Markdown",
        reply_markup: telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("✅ Confirm", "confirm_wallet_send"),
            telegraf_1.Markup.button.callback("❌ Cancel", "cancel_wallet_send"),
        ]).reply_markup,
    });
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery))
        return;
    const action = ctx.callbackQuery.data;
    const { walletAddress, amount } = ctx.wizard.state;
    await ctx.answerCbQuery();
    if (action === "confirm_wallet_send") {
        try {
            const transfer = await (0, transfers_1.sendToWallet)(walletAddress, amount.toString());
            await ctx.reply(`🎉 *Successfully sent ${(0, format_1.formatCurrency)(amount)} to wallet ${(0, format_1.formatWalletAddress)(walletAddress)}*\n\nTransaction ID: ${transfer.id}`, {
                parse_mode: "Markdown",
                reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
            });
        }
        catch (error) {
            console.error("Send to wallet error:", error);
            await ctx.reply(`❌ Error: ${error.message || "Failed to send funds."}`, (0, menus_1.mainMenuKeyboard)());
        }
    }
    else {
        await ctx.reply("📤 Transfer canceled.", (0, menus_1.mainMenuKeyboard)());
    }
    return ctx.scene.leave();
});
// Withdraw to bank scene
const withdrawScene = new telegraf_1.Scenes.WizardScene(exports.WITHDRAW_SCENE_ID, async (ctx) => {
    try {
        const payees = await (0, transfers_1.getPayees)();
        if (!Array.isArray(payees) || payees.length === 0) {
            await ctx.reply("🏧 No bank accounts found. Please add a bank account on the CopperX web platform first.", (0, menus_1.mainMenuKeyboard)());
            return ctx.scene.leave();
        }
        const buttons = payees.map((p) => telegraf_1.Markup.button.callback(`${p.nickName} (${p.bankName})`, `payee_${p.id}`));
        buttons.push(telegraf_1.Markup.button.callback("⬅️ Cancel", "cancel_withdraw"));
        const keyboard = telegraf_1.Markup.inlineKeyboard(buttons.map((button) => [button]));
        await ctx.reply("🏧 Select bank account for withdrawal:", keyboard);
        return ctx.wizard.next();
    }
    catch (error) {
        console.error("Get payees error:", error);
        await ctx.reply("❌ Error fetching bank accounts. Please check your network and try again later.", (0, menus_1.mainMenuKeyboard)());
        return ctx.scene.leave();
    }
}, async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery))
        return;
    const data = ctx.callbackQuery.data;
    await ctx.answerCbQuery();
    if (data === "cancel_withdraw") {
        await ctx.reply("🏧 Withdrawal canceled.", (0, menus_1.mainMenuKeyboard)());
        return ctx.scene.leave();
    }
    if (!data.startsWith("payee_")) {
        await ctx.reply("❌ Invalid selection. Please try again.");
        return;
    }
    const payeeId = data.substring(6);
    ctx.wizard.state.payeeId = payeeId;
    await ctx.reply("💸 Enter amount to withdraw (in USDC):");
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please enter a valid amount.");
        return;
    }
    const amountText = ctx.message.text.trim().replace(",", ".");
    const amount = parseFloat(amountText);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply("❌ Invalid amount. Please enter a positive number:");
        return;
    }
    ctx.wizard.state.amount = amount;
    await ctx.reply(`🏧 *Please confirm withdrawal:*\n\nWithdraw *${(0, format_1.formatCurrency)(amount)}* to your bank account`, {
        parse_mode: "Markdown",
        reply_markup: telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("✅ Confirm", "confirm_withdraw"),
            telegraf_1.Markup.button.callback("❌ Cancel", "cancel_withdraw_final"),
        ]).reply_markup,
    });
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery))
        return;
    const action = ctx.callbackQuery.data;
    const { payeeId, amount } = ctx.wizard.state;
    await ctx.answerCbQuery();
    if (action === "confirm_withdraw") {
        try {
            const transfer = await (0, transfers_1.withdrawToBank)(payeeId, amount.toString());
            await ctx.reply(`🎉 *Withdrawal initiated for ${(0, format_1.formatCurrency)(amount)} to your bank account!*\n\nTransaction ID: ${transfer.id}\n\nFunds will arrive in 1-3 business days.`, {
                parse_mode: "Markdown",
                reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
            });
        }
        catch (error) {
            console.error("Bank withdrawal error:", error);
            await ctx.reply(`❌ Error: ${error.message || "Failed to process withdrawal."}`, (0, menus_1.mainMenuKeyboard)());
        }
    }
    else {
        await ctx.reply("🏧 Withdrawal canceled.", (0, menus_1.mainMenuKeyboard)());
    }
    return ctx.scene.leave();
});
// Batch send scene
const batchSendScene = new telegraf_1.Scenes.WizardScene(exports.BATCH_SEND_SCENE_ID, async (ctx) => {
    await ctx.reply("📦 *Batch Send*\n\n" +
        "Send USDC to multiple recipients at once.\n\n" +
        "Please send your list in the following format (one per line):\n" +
        "`email1@example.com,10`\n" +
        "`email2@example.com,15.5`\n\n" +
        "Each line should contain an email address and amount separated by a comma.", { parse_mode: "Markdown" });
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("❌ Please send your list as text.");
        return;
    }
    const text = ctx.message.text.trim();
    const lines = text.split("\n");
    const transfers = [];
    const errors = [];
    lines.forEach((line, index) => {
        const parts = line.split(",");
        if (parts.length !== 2) {
            errors.push(`Line ${index + 1}: Invalid format`);
            return;
        }
        const email = parts[0].trim();
        const amount = parts[1].trim().replace(",", ".");
        if (!email.includes("@") || !email.includes(".")) {
            errors.push(`Line ${index + 1}: Invalid email format`);
            return;
        }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            errors.push(`Line ${index + 1}: Invalid amount`);
            return;
        }
        transfers.push({ email, amount: numAmount.toString() });
    });
    if (errors.length > 0) {
        await ctx.reply("❌ *There were errors in your list:*\n\n" +
            errors.join("\n") +
            "\n\nPlease correct them and try again.", { parse_mode: "Markdown" });
        return;
    }
    ctx.wizard.state.batchTransfers = transfers;
    let totalAmount = 0;
    transfers.forEach((t) => {
        totalAmount += parseFloat(t.amount);
    });
    await ctx.reply(`📦 *Batch Summary:*\n\n` +
        `Total Recipients: ${transfers.length}\n` +
        `Total Amount: ${(0, format_1.formatCurrency)(totalAmount)}\n\n` +
        `Do you want to continue with this batch transfer?`, {
        parse_mode: "Markdown",
        reply_markup: telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback("✅ Confirm", "confirm_batch"),
            telegraf_1.Markup.button.callback("❌ Cancel", "cancel_batch"),
        ]).reply_markup,
    });
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery))
        return;
    const action = ctx.callbackQuery.data;
    const { batchTransfers } = ctx.wizard.state;
    await ctx.answerCbQuery();
    if (action === "confirm_batch") {
        try {
            const result = await (0, transfers_1.sendBatchTransfers)(batchTransfers);
            let totalAmount = 0;
            batchTransfers.forEach((t) => {
                totalAmount += parseFloat(t.amount);
            });
            await ctx.reply(`🎉 *Successfully initiated ${batchTransfers.length} transfers for a total of ${(0, format_1.formatCurrency)(totalAmount)}!*\n\n` +
                `All recipients will be notified by email.`, {
                parse_mode: "Markdown",
                reply_markup: (0, menus_1.mainMenuKeyboard)().reply_markup,
            });
        }
        catch (error) {
            console.error("Batch send error:", error);
            await ctx.reply(`❌ Error: ${error.message || "Failed to process batch transfers."}`, (0, menus_1.mainMenuKeyboard)());
        }
    }
    else {
        await ctx.reply("📦 Batch transfer canceled.", (0, menus_1.mainMenuKeyboard)());
    }
    return ctx.scene.leave();
});
// Set up stage with all scenes
exports.stage = new telegraf_1.Scenes.Stage([
    loginScene,
    sendScene,
    sendWalletScene,
    withdrawScene,
    batchSendScene,
]);
// Export stage middleware
exports.stageMiddleware = exports.stage.middleware();
