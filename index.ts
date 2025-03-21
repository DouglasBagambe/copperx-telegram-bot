// index.ts

import http from "http";
import { Telegraf, session } from "telegraf";
import rateLimit from "telegraf-ratelimit";
import { loadEnv } from "./app/config/env";
import { MyContext, setupCommands } from "./app/bot/commands";
import { stage } from "./app/bot/scenes";
import { Context } from "telegraf";

// Load environment variables
const { TELEGRAM_BOT_TOKEN, NODE_ENV, PORT, RENDER_EXTERNAL_URL } = loadEnv();

// Initialize bot
const bot = new Telegraf<MyContext>(TELEGRAM_BOT_TOKEN);

// Rate limit middleware to prevent Telegram 429 errors
const limiter = rateLimit({
  window: 1000, // 1 second window
  limit: 1, // 1 message per second per chat
  onLimitExceeded: (ctx: Context) => {
    console.warn(`Rate limit exceeded for chat ${ctx.chat?.id}`);
    ctx.reply(
      "⚠️ Slow down! I'm getting too many requests. Please wait a moment and try again."
    );
  },
});

// Apply middlewares
bot.use(limiter); // Rate limiting
bot.use(session()); // Session for scenes
bot.use(stage.middleware()); // Scenes middleware

// Setup commands and handlers
setupCommands(bot);

// Global error handler
bot.catch((err, ctx) => {
  console.error("Unhandled error while processing", ctx.update, err);
  if ((err as any).response?.error_code === 429) {
    const retryAfter = (err as any).response.parameters.retry_after || 60;
    ctx.reply(
      `⚠️ Telegram rate limit hit. Please wait ${retryAfter} seconds and try again.`
    );
    return;
  }
  ctx.reply("❌ An unexpected error occurred. Please try again later.");
});

// Create HTTP server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("CopperX Telegram Bot is running!");
});

// Start the server
const port = PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Function to launch bot with retry on 429 errors
  const launchBotWithRetry = async (retryCount = 0) => {
    try {
      if (NODE_ENV !== "production") {
        // Development: Use polling
        await bot.launch();
        console.log("Copperx Payout Bot started successfully in polling mode");
      } else {
        // Production: Use webhook
        const webhookUrl =
          RENDER_EXTERNAL_URL ||
          "https://copperx-telegram-bot-408r.onrender.com";
        await bot.launch({
          webhook: {
            domain: webhookUrl,
            port: Number(port),
          },
        });
        console.log(`Bot started in webhook mode on ${webhookUrl}`);
      }
    } catch (error: any) {
      if (error.response?.error_code === 429) {
        const retryAfter = error.response.parameters.retry_after || 60;
        console.warn(
          `Telegram rate limit hit. Retrying after ${retryAfter} seconds... (Attempt ${
            retryCount + 1
          })`
        );
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return launchBotWithRetry(retryCount + 1);
      }
      console.error("Failed to launch bot:", error);
      process.exit(1); // Exit only on non-429 errors
    }
  };

  // Launch the bot
  launchBotWithRetry();
});

// Handle graceful shutdown
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  console.log("Bot stopped (SIGINT)");
  process.exit(0);
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  console.log("Bot stopped (SIGTERM)");
  process.exit(0);
});
