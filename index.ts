/* eslint-disable @typescript-eslint/no-explicit-any */
// index.ts
import { Telegraf } from "telegraf";
import { loadEnv } from "./app/config/env";
import { setupCommands } from "./app/bot/commands";
import { stageMiddleware } from "./app/bot/scenes";

// Import MyContext from commands.ts for consistency
import { MyContext } from "./app/bot/commands";

// Load environment variables
const { TELEGRAM_BOT_TOKEN } = loadEnv();

// Initialize bot with MyContext from commands.ts
const bot = new Telegraf<MyContext>(TELEGRAM_BOT_TOKEN);

// Apply scene middleware with type assertion to match MyContext
bot.use(stageMiddleware as any); // Temporary fallback; refine if needed

// Setup commands and handlers
setupCommands(bot);

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
