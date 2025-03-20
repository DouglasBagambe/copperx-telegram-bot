"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
// index.ts
const telegraf_1 = require("telegraf");
const env_1 = require("./app/config/env");
const commands_1 = require("./app/bot/commands");
const scenes_1 = require("./app/bot/scenes");
// Load environment variables
const { TELEGRAM_BOT_TOKEN, NODE_ENV } = (0, env_1.loadEnv)();
// Initialize bot
const bot = new telegraf_1.Telegraf(TELEGRAM_BOT_TOKEN);
// Register session middleware (required for scenes to work)
bot.use((0, telegraf_1.session)());
// Register stage middleware
bot.use(scenes_1.stage.middleware());
// Setup commands and handlers after all middlewares are applied
(0, commands_1.setupCommands)(bot);
// Export a handler for Render (webhook mode)
exports.default = async (req, res) => {
    try {
        if (req.method === "POST") {
            // Handle Telegram webhook updates
            await bot.handleUpdate(req.body);
            res.status(200).end();
        }
        else {
            res.status(200).send("CopperX Telegram Bot");
        }
    }
    catch (err) {
        console.error("Webhook error:", err);
        res.status(500).send("Internal Server Error");
    }
};
// For local development, use polling mode
if (NODE_ENV !== "production") {
    bot
        .launch()
        .then(() => console.log("Copperx Payout Bot started successfully in polling mode"))
        .catch((err) => {
        console.error("Failed to launch bot:", err);
        process.exit(1);
    });
    // Handle graceful shutdown
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
