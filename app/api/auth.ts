// app/api/auth.ts

import copperxAPI from "./copperx";
import { ApiResponse, User, OTPRequest, OTPAuthentication, KYC } from "./types";

/**
 * Request an OTP to be sent to the user's email
 * @param email The user's email address
 * @returns A session ID to be used when verifying the OTP
 */
export const requestEmailOTP = async (email: string): Promise<OTPRequest> => {
  const response = await copperxAPI.post<ApiResponse<OTPRequest>>(
    "/api/auth/email-otp/request",
    { email }
  );
  return response.data;
};

/**
 * Authenticate with an OTP sent to the user's email
 * @param email The user's email address
 * @param otp The OTP received via email
 * @param sid The session ID received from requestEmailOTP
 * @returns Authentication tokens
 */
export const authenticateWithOTP = async (
  email: string,
  otp: string,
  sid: string
): Promise<OTPAuthentication> => {
  const response = await copperxAPI.post<ApiResponse<OTPAuthentication>>(
    "/api/auth/email-otp/authenticate",
    { email, otp, sid }
  );

  // Set the access token in the API client
  copperxAPI.setAccessToken(response.data.accessToken);

  return response.data;
};

/**
 * Get the current user's profile information
 * @param accessToken Optional access token (will use default if not provided)
 * @param organizationId Optional organization ID
 * @returns User profile data
 */
export const getProfile = async (
  accessToken?: string,
  organizationId?: string
): Promise<User> => {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (organizationId) {
    headers["X-Organization-ID"] = organizationId;
  }

  const response = await copperxAPI.get<ApiResponse<User>>("/api/auth/me", {
    headers,
  });

  return response.data;
};

/**
 * Get the user's KYC status
 * @param accessToken Optional access token (will use default if not provided)
 * @returns KYC status information
 */
export const getKYCStatus = async (accessToken?: string): Promise<KYC[]> => {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await copperxAPI.get<ApiResponse<KYC[]>>("/api/kycs", {
    headers,
  });

  return response.data;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  copperxAPI.setAccessToken(null);
};
