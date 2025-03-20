"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = void 0;
// app/config/env.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnv = () => {
    const requiredVars = ["TELEGRAM_BOT_TOKEN", "COPPERX_API_BASE_URL"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }
    return {
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        COPPERX_API_BASE_URL: process.env.COPPERX_API_BASE_URL,
        PUSHER_APP_KEY: process.env.PUSHER_APP_KEY || "e089376087cac1a62785",
        PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER || "ap1",
        NODE_ENV: process.env.NODE_ENV || "development",
    };
};
exports.loadEnv = loadEnv;
