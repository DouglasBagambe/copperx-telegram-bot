/* eslint-disable @typescript-eslint/no-explicit-any */
// index.ts
import { Context, MiddlewareFn, Telegraf, session } from "telegraf";
import { loadEnv } from "./app/config/env";
import { MyContext, setupCommands } from "./app/bot/commands";
import { stage } from "./app/bot/scenes";
import { Update } from "telegraf/types";

// Load environment variables
const { TELEGRAM_BOT_TOKEN } = loadEnv();

// Initialize bot
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Register session middleware (required for scenes to work)
bot.use(session());

// Register stage middleware
bot.use(stage.middleware() as MiddlewareFn<Context<Update>>);

// Setup commands and handlers after all middlewares are applied
setupCommands(bot as unknown as Telegraf<MyContext>);

// Launch the bot
bot
  .launch()
  .then(() => console.log("Copperx Payout Bot started successfully"))
  .catch((err) => {
    console.error("Failed to launch bot:", err);
    process.exit(1);
  });

// Handle graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export default bot;
