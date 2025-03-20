"use strict";
// app/utils/session.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.setState = exports.getState = exports.isAuthenticated = exports.clearSession = exports.setSession = exports.getSession = void 0;
// In-memory sessions store (replace with Redis for production)
const sessions = {};
/**
 * Get a user session by Telegram chat ID
 * @param chatId Telegram chat ID
 * @returns User session or undefined if not found
 */
const getSession = (chatId) => {
    return sessions[chatId];
};
exports.getSession = getSession;
/**
 * Create or update a user session
 * @param chatId Telegram chat ID
 * @param session Session data
 */
const setSession = (chatId, session) => {
    sessions[chatId] = {
        ...sessions[chatId],
        ...session,
        chatId,
    };
};
exports.setSession = setSession;
/**
 * Remove a user session
 * @param chatId Telegram chat ID
 */
const clearSession = (chatId) => {
    delete sessions[chatId];
};
exports.clearSession = clearSession;
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
const isAuthenticated = (chatId) => {
    const session = (0, exports.getSession)(chatId);
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
exports.isAuthenticated = isAuthenticated;
/**
 * Get temporary state for multi-step flows
 * @param chatId Telegram chat ID
 * @param key State key
 * @returns State value or undefined
 */
const getState = (chatId, key) => {
    const session = (0, exports.getSession)(chatId);
    return session?.[key];
};
exports.getState = getState;
/**
 * Set temporary state for multi-step flows
 * @param chatId Telegram chat ID
 * @param key State key
 * @param value State value
 */
const setState = (chatId, key, value) => {
    const session = (0, exports.getSession)(chatId);
    if (session) {
        (0, exports.setSession)(chatId, { ...session, [key]: value });
    }
};
exports.setState = setState;
