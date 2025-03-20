"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getKYCStatus = exports.getProfile = exports.authenticateWithOTP = exports.requestEmailOTP = void 0;
// app/api/auth.ts
const copperx_1 = __importDefault(require("./copperx"));
/**
 * Request an OTP to be sent to the user's email
 * @param email The user's email address
 * @returns A session ID to be used when verifying the OTP
 */
const requestEmailOTP = async (email) => {
    try {
        const response = await copperx_1.default.post("/api/auth/email-otp/request", {
            email,
        });
        console.log("Full API response:", response);
        // Check if the response itself contains sid (not response.data)
        if (response && response.sid) {
            return { sid: response.sid };
        }
        // Fallback in case the structure is different (e.g., response.data.sid)
        if (response.data && response.data.sid) {
            return { sid: response.data.sid };
        }
        throw new Error("Sid not found in API response");
    }
    catch (error) {
        console.error("Error in requestEmailOTP:", error.response?.data || error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to request OTP";
        if (error.code === "ETIMEDOUT" || error.code === "ENETUNREACH") {
            throw new Error("Network error: Unable to reach the server. Please check your internet connection and try again.");
        }
        throw new Error(errorMessage);
    }
};
exports.requestEmailOTP = requestEmailOTP;
/**
 * Authenticate with an OTP sent to the user's email
 * @param email The user's email address
 * @param otp The OTP received via email
 * @param sid The session ID received from requestEmailOTP
 * @returns Authentication tokens
 */
const authenticateWithOTP = async (email, otp, sid) => {
    try {
        const response = await copperx_1.default.post("/api/auth/email-otp/authenticate", {
            email,
            otp,
            sid,
        });
        if (response && response.accessToken) {
            copperx_1.default.setAccessToken(response.accessToken);
            return response;
        }
        // Fallback in case the structure is different (e.g., response.data.accessToken)
        if (response.data && response.accessToken) {
            copperx_1.default.setAccessToken(response.data.accessToken);
            return response.data;
        }
        throw new Error("Invalid authentication response");
    }
    catch (error) {
        console.error("API Error:", error.response?.data || error);
        const errorMessage = error.response?.data?.message || "Authentication failed";
        if (errorMessage.includes("Otp is not latest otp")) {
            throw new Error("OTP code is not the latest one. Please request a new OTP.");
        }
        if (error.code === "ETIMEDOUT" || error.code === "ENETUNREACH") {
            throw new Error("Network error: Unable to reach the server. Please check your internet connection and try again.");
        }
        throw new Error(errorMessage);
    }
};
exports.authenticateWithOTP = authenticateWithOTP;
/**
 * Get the current user's profile information
 * @param accessToken Optional access token
 * @param organizationId Optional organization ID
 * @returns User profile data
 */
const getProfile = async (accessToken, organizationId) => {
    const headers = {};
    if (accessToken)
        headers.Authorization = `Bearer ${accessToken}`;
    if (organizationId)
        headers["X-Organization-ID"] = organizationId;
    const response = await copperx_1.default.get("/api/auth/me", {
        headers,
    });
    return response;
};
exports.getProfile = getProfile;
/**
 * Get the user's KYC status
 * @param accessToken Optional access token
 * @returns KYC status information
 */
const getKYCStatus = async (accessToken) => {
    const headers = {};
    if (accessToken)
        headers.Authorization = `Bearer ${accessToken}`;
    const response = await copperx_1.default.get("/api/kycs", { headers });
    return response;
};
exports.getKYCStatus = getKYCStatus;
/**
 * Logout the current user
 */
const logout = () => {
    copperx_1.default.setAccessToken(null);
};
exports.logout = logout;
