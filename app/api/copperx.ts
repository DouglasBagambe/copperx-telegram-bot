// app/api/copperx.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import { loadEnv } from "../config/env";

const { COPPERX_API_BASE_URL } = loadEnv();

class CopperxAPI {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
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
    axiosRetry(this.client, {
      retries: 3, // Retry 3 times
      retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s delay
      retryCondition: (error) => {
        // Retry on network errors or 5xx status codes
        const isNetworkError =
          axiosRetry.isNetworkOrIdempotentRequestError(error);
        const isServerError = error.response?.status
          ? error.response.status >= 500
          : false;
        return isNetworkError || isServerError;
      },
    });
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  private handleApiError(error: any) {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);

      // Handle 401 unauthorized errors
      if (error.response?.status === 401) {
        this.accessToken = null;
      }

      // Handle network errors specifically
      if (error.code === "ETIMEDOUT" || error.code === "ENETUNREACH") {
        throw new Error(
          "Network error: Unable to reach the server. Please check your internet connection and try again."
        );
      }

      // Throw the error with a more descriptive message
      const errorMessage =
        error.response?.data?.message || error.message || "API request failed";
      throw new Error(errorMessage);
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}

export const copperxAPI = new CopperxAPI();
export default copperxAPI;
