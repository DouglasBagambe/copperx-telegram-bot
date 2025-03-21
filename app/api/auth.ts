// app/api/auth.ts
import copperxAPI from "./copperx";
import { User, OTPRequest, OTPAuthentication, KYC } from "./types";

/**
 * Request an OTP to be sent to the user's email
 * @param email The user's email address
 * @returns A session ID to be used when verifying the OTP
 */
export const requestEmailOTP = async (email: string): Promise<OTPRequest> => {
  try {
    const response = await copperxAPI.post<any>("/api/auth/email-otp/request", {
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
  } catch (error: any) {
    console.error("Error in requestEmailOTP:", error.response?.data || error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to request OTP";
    if (error.code === "ETIMEDOUT" || error.code === "ENETUNREACH") {
      throw new Error(
        "Network error: Unable to reach the server. Please check your internet connection and try again."
      );
    }
    throw new Error(errorMessage);
  }
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
  try {
    const response = await copperxAPI.post<any>(
      "/api/auth/email-otp/authenticate",
      {
        email,
        otp,
        sid,
      }
    );

    if (response && response.accessToken) {
      copperxAPI.setAccessToken(response.accessToken);
      return response;
    }

    // Fallback in case the structure is different (e.g., response.data.accessToken)
    if (response.data && response.accessToken) {
      copperxAPI.setAccessToken(response.data.accessToken);
      return response.data;
    }

    throw new Error("Invalid authentication response");
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error);
    const errorMessage =
      error.response?.data?.message || "Authentication failed";

    if (errorMessage.includes("Otp is not latest otp")) {
      throw new Error(
        "OTP code is not the latest one. Please request a new OTP."
      );
    }

    if (error.code === "ETIMEDOUT" || error.code === "ENETUNREACH") {
      throw new Error(
        "Network error: Unable to reach the server. Please check your internet connection and try again."
      );
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get the current user's profile information
 * @param accessToken Optional access token
 * @param organizationId Optional organization ID
 * @returns User profile data
 */
export const getProfile = async (
  accessToken?: string,
  organizationId?: string
): Promise<User> => {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (organizationId) headers["X-Organization-ID"] = organizationId;

  try {
    const response = await copperxAPI.get<User>("/api/auth/me", {
      headers,
    });

    console.log("Raw profile response:", response); // Debug log
    let userData: User;
    if (response && typeof response === "object" && "data" in response) {
      userData = response.data as unknown as User;
    } else if (response && typeof response === "object") {
      userData = response as User;
    } else {
      throw new Error("Invalid profile response structure");
    }
    const firstName = userData.firstName ?? "";
    const lastName = userData.lastName ?? "";
    return {
      ...userData,
      name:
        firstName || lastName
          ? `${firstName} ${lastName}`.trim()
          : "Unknown User",
    };

    // // Check if the response itself contains user data
    // if (response && response.name !== undefined) {
    //   return response;
    // }

    // Fallback in case the structure is response.data
    // if (
    //   response.data &&
    //   typeof response.data === "object" &&
    //   (response.data as User).name !== undefined
    // ) {
    //   return response.data;
    // }

    // return response; // Return whatever we got as a last resort
  } catch (error: any) {
    console.error("Error in getProfile:", error.response?.data || error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to get profile";

    if (error.code === "ETIMEDOUT" || error.code === "ENETUNREACH") {
      throw new Error(
        "Network error: Unable to reach the server. Please check your internet connection and try again."
      );
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get the user's KYC status
 * @param accessToken Optional access token
 * @returns KYC status information
 */
export const getKYCStatus = async (accessToken?: string): Promise<KYC[]> => {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response: KYC[] = await copperxAPI.get<KYC[]>("/api/kycs", { headers });
  return response;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  copperxAPI.setAccessToken(null);
};
