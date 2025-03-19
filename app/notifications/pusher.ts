// app/notifications/pusher.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import Pusher from "pusher-js";
import axios from "axios";
import { loadEnv } from "../config/env";
import { getSession } from "../utils/session";
import { Telegraf } from "telegraf";
import { MyContext } from "../bot/commands";

const { PUSHER_APP_KEY, PUSHER_APP_CLUSTER, COPPERX_API_BASE_URL } = loadEnv();

/**
 * Setup Pusher notifications for a user
 * @param bot Telegraf bot instance
 * @param chatId Telegram chat ID
 * @param organizationId User organization ID
 */
export const setupPusherNotifications = (
  bot: Telegraf<MyContext>,
  chatId: number,
  organizationId: string
): void => {
  const session = getSession(chatId);
  if (!session || !session.accessToken) {
    console.error("Cannot setup notifications: User not authenticated");
    return;
  }

  const pusherClient = new Pusher(PUSHER_APP_KEY, {
    cluster: PUSHER_APP_CLUSTER,
    authorizer: (channel: { name: any }) => ({
      authorize: async (
        socketId: any,
        callback: (arg0: Error | null, arg1: null) => void
      ) => {
        try {
          const response = await axios.post(
            `${COPPERX_API_BASE_URL}/api/notifications/auth`,
            {
              socket_id: socketId,
              channel_name: channel.name,
            },
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          if (response.data) {
            callback(null, response.data);
          } else {
            callback(new Error("Pusher authentication failed"), null);
          }
        } catch (error) {
          console.error("Pusher authorization error:", error);
          callback(error as Error, null);
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

  channel.bind("pusher:subscription_error", (error: any) => {
    console.error("Subscription error:", error);
  });

  // Bind to the deposit event
  channel.bind("deposit", (data: any) => {
    bot.telegram.sendMessage(
      chatId,
      `💰 *New Deposit Received*\n\n` +
        `${data.amount} USDC deposited on ${data.network}`,
      { parse_mode: "Markdown" }
    );
  });
};
