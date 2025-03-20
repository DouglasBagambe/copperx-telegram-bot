"use strict";
// app/notifications/pusher.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPusherNotifications = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const pusher_js_1 = __importDefault(require("pusher-js"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const session_1 = require("../utils/session");
const { PUSHER_APP_KEY, PUSHER_APP_CLUSTER, COPPERX_API_BASE_URL } = (0, env_1.loadEnv)();
/**
 * Setup Pusher notifications for a user
 * @param bot Telegraf bot instance
 * @param chatId Telegram chat ID
 * @param organizationId User organization ID
 */
const setupPusherNotifications = (bot, chatId, organizationId) => {
    const session = (0, session_1.getSession)(chatId);
    if (!session || !session.accessToken) {
        console.error("Cannot setup notifications: User not authenticated");
        return;
    }
    const pusherClient = new pusher_js_1.default(PUSHER_APP_KEY, {
        cluster: PUSHER_APP_CLUSTER,
        authorizer: (channel) => ({
            authorize: async (socketId, callback) => {
                try {
                    const response = await axios_1.default.post(`${COPPERX_API_BASE_URL}/api/notifications/auth`, {
                        socket_id: socketId,
                        channel_name: channel.name,
                    }, {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    });
                    if (response.data) {
                        callback(null, response.data);
                    }
                    else {
                        callback(new Error("Pusher authentication failed"), null);
                    }
                }
                catch (error) {
                    console.error("Pusher authorization error:", error);
                    callback(error, null);
                }
            },
        }),
    });
    // Subscribe to organization's private channel
    const channelName = `private-org-${organizationId}`;
    const channel = pusherClient.subscribe(channelName);
    channel.bind("pusher:subscription_succeeded", () => {
        console.log(`Successfully subscribed to channel: ${channelName}`);
    });
    channel.bind("pusher:subscription_error", (error) => {
        console.error("Subscription error:", error);
    });
    // Bind to the deposit event
    channel.bind("deposit", (data) => {
        bot.telegram.sendMessage(chatId, `💰 *New Deposit Received*\n\n` +
            `${data.amount} USDC deposited on ${data.network}`, { parse_mode: "Markdown" });
    });
};
exports.setupPusherNotifications = setupPusherNotifications;
