import dotenv from "dotenv";

dotenv.config();

export const loadEnv = () => {
  const requiredVars = [
    "TELEGRAM_BOT_TOKEN",
    "COPPERX_API_BASE_URL",
    "PUSHER_APP_KEY",
    "PUSHER_APP_CLUSTER",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
    COPPERX_API_BASE_URL: process.env.COPPERX_API_BASE_URL!,
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY!,
    PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER!,
  };
};
