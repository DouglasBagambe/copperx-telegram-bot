// app/utils/session.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserSession } from "../api/types";

// In-memory sessions store (replace with Redis for production)
const sessions: Record<number, UserSession> = {};

/**
 * Get a user session by Telegram chat ID
 * @param chatId Telegram chat ID
 * @returns User session or undefined if not found
 */
export const getSession = (chatId: number): UserSession | undefined => {
  return sessions[chatId];
};

/**
 * Create or update a user session
 * @param chatId Telegram chat ID
 * @param session Session data
 */
export const setSession = (
  chatId: number,
  session: Partial<UserSession>
): void => {
  sessions[chatId] = {
    ...sessions[chatId],
    ...session,
    chatId,
  };
};

/**
 * Remove a user session
 * @param chatId Telegram chat ID
 */
export const clearSession = (chatId: number): void => {
  delete sessions[chatId];
};

// export const clearSession = (chatId: number) => {
//   sessions[chatId] = {
//     accessToken: "",
//     refreshToken: "",
//     expireAt: "",
//     organizationId: "0",
//   }; // Clear all session data
// };

/**
 * Check if a user is authenticated
 * @param chatId Telegram chat ID
 * @returns True if the user is authenticated
 */
export const isAuthenticated = (chatId: number): boolean => {
  const session = getSession(chatId);

  if (!session || !session.accessToken) {
    return false;
  }

  // Check if token is expired
  if (session.expireAt) {
    const expireDate = new Date(session.expireAt);
    if (expireDate <= new Date()) {
      return false;
    }
  }

  return true;
};

/**
 * Get temporary state for multi-step flows
 * @param chatId Telegram chat ID
 * @param key State key
 * @returns State value or undefined
 */
export const getState = (chatId: number, key: string): any => {
  const session = getSession(chatId);
  return session?.[key as keyof UserSession];
};

/**
 * Set temporary state for multi-step flows
 * @param chatId Telegram chat ID
 * @param key State key
 * @param value State value
 */
export const setState = (chatId: number, key: string, value: any): void => {
  const session = getSession(chatId);
  if (session) {
    setSession(chatId, { ...session, [key]: value });
  }
};
