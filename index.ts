/* eslint-disable @typescript-eslint/no-explicit-any */
// index.ts
import { Context, MiddlewareFn, Telegraf, session } from "telegraf";
import { loadEnv } from "./app/config/env";
import { MyContext, setupCommands } from "./app/bot/commands";
import { stage } from "./app/bot/scenes";
import { Update } from "telegraf/types";

// Load environment variables
const { TELEGRAM_BOT_TOKEN, NODE_ENV } = loadEnv();

// Initialize bot
const bot = new Telegraf<MyContext>(TELEGRAM_BOT_TOKEN);

// Register session middleware (required for scenes to work)
bot.use(session());

// Register stage middleware
bot.use(stage.middleware() as MiddlewareFn<Context<Update>>);

// Setup commands and handlers after all middlewares are applied
setupCommands(bot);

// Export a handler for Render (webhook mode)
export default async (req: any, res: any) => {
  try {
    if (req.method === "POST") {
      // Handle Telegram webhook updates
      await bot.handleUpdate(req.body);
      res.status(200).end();
    } else {
      res.status(200).send("CopperX Telegram Bot");
    }
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
};

// For local development, use polling mode
if (NODE_ENV !== "production") {
  bot
    .launch()
    .then(() =>
      console.log("Copperx Payout Bot started successfully in polling mode")
    )
    .catch((err) => {
      console.error("Failed to launch bot:", err);
      process.exit(1);
    });

  // Handle graceful shutdown
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
