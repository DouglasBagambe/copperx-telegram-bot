import http from "http";
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

// Create HTTP server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("CopperX Telegram Bot is running!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

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
} else {
  // For production, use webhook mode
  bot
    .launch({
      webhook: {
        domain:
          process.env.RENDER_EXTERNAL_URL ||
          "https://copperx-telegram-bot-1ez7.onrender.com",
        port: Number(PORT),
      },
    })
    .then(() => {
      console.log("Bot started in webhook mode");
    })
    .catch((err) => {
      console.error("Failed to start bot in webhook mode:", err);
    });
}
