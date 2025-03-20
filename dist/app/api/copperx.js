"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copperxAPI = void 0;
// app/api/copperx.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const env_1 = require("../config/env");
const { COPPERX_API_BASE_URL } = (0, env_1.loadEnv)();
class CopperxAPI {
    constructor() {
        this.accessToken = null;
        this.client = axios_1.default.create({
            baseURL: COPPERX_API_BASE_URL,
            timeout: 10000, // Set a 10-second timeout
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            httpAgent: new (require("http").Agent)({ family: 4 }), // Force IPv4
            httpsAgent: new (require("https").Agent)({ family: 4 }), // Force IPv4
        });
        // Add request interceptor for authentication
        this.client.interceptors.request.use((config) => {
            if (this.accessToken) {
                config.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return config;
        });
        // Add retry logic for failed requests
        (0, axios_retry_1.default)(this.client, {
            retries: 3, // Retry 3 times
            retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s delay
            retryCondition: (error) => {
                // Retry on network errors or 5xx status codes
                const isNetworkError = axios_retry_1.default.isNetworkOrIdempotentRequestError(error);
                const isServerError = error.response?.status
                    ? error.response.status >= 500
                    : false;
                return isNetworkError || isServerError;
            },
        });
    }
    setAccessToken(token) {
        this.accessToken = token;
    }
    async get(url, config) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    async post(url, data, config) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    async put(url, data, config) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        }
        catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    handleApiError(error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("API Error:", error.response?.data || error.message);
            // Handle 401 unauthorized errors
            if (error.response?.status === 401) {
                this.accessToken = null;
            }
            // Handle network errors specifically
            if (error.code === "ETIMEDOUT" || error.code === "ENETUNREACH") {
                throw new Error("Network error: Unable to reach the server. Please check your internet connection and try again.");
            }
            // Throw the error with a more descriptive message
            const errorMessage = error.response?.data?.message || error.message || "API request failed";
            throw new Error(errorMessage);
        }
        else {
            console.error("Unexpected error:", error);
            throw new Error("An unexpected error occurred");
        }
    }
}
exports.copperxAPI = new CopperxAPI();
exports.default = exports.copperxAPI;
