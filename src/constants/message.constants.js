export const MESSAGES = {
  // Auth
  AUTH_TOKEN_MISSING: "Authentication token is missing",
  AUTH_TOKEN_INVALID: "Invalid or expired token",
  EMAIL_EXISTS: "Email already exists",
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
  USER_NOT_FOUND: "User not found",

  // Validation
  NAME_EMAIL_PASSWORD_PHONE_REQUIRED: "name, email, password and phone are required",
  EMAIL_PASSWORD_REQUIRED: "email and password are required",
  EMAIL_FORMAT_INVALID: "Email format is invalid",
  AGE_MIN_18: "Age must be at least 18",
  AGE_MAX_60: "Age must be at most 60",
  ROLE_REQUIRED: "role is required",
  INVALID_ROLE: "Invalid role",

  // Success
  SIGNUP_SUCCESS: "User signed up successfully",
  LOGIN_SUCCESS: "Login successful",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_ROLE_UPDATED: "User role updated successfully",

  // Server
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  API_RUNNING: "Assignment 9 API is running",
  DB_URI_NOT_DEFINED: "Database URI is not defined in configuration",
  DB_CONNECTED: "Connected to MongoDB",
  SERVER_FAILED_START: "Failed to start server",

  // Admin
  FORBIDDEN_ADMIN: "Access denied. Admin only.",

  // Profile / Saraha
  PROFILE_SLUG_FORMAT_INVALID: "profileSlug must be lowercase letters, numbers, and single hyphens between segments",
  PROFILE_SLUG_TAKEN: "This profile link is already taken",
  PROFILE_PIC_REQUIRED: "Profile image file is required (field name: profilePic)",
  PROFILE_PIC_UPDATED: "Profile picture updated",
  PROFILE_PIC_INVALID_TYPE: "Only JPEG, PNG, WebP, or GIF images are allowed",

  // Messages
  MESSAGE_CONTENT_REQUIRED: "Message content is required",
  MESSAGE_TOO_LONG: "Message is too long",
  RECIPIENT_NOT_FOUND: "No user found with this profile link",
  MESSAGE_NOT_FOUND: "Message not found",
  MESSAGE_DELETED: "Message deleted",
  MESSAGE_MARKED_READ: "Message marked as read",
  MESSAGE_SENT: "Your message was sent anonymously",
  MESSAGE_SENT_PUBLIC: "Your message was sent",

  // Tokens / session
  REFRESH_TOKEN_MISSING: "Refresh token is missing",
  REFRESH_TOKEN_INVALID: "Invalid or expired refresh token",
  LOGOUT_SUCCESS: "Logged out successfully",
  LOGOUT_ALL_SUCCESS: "Logged out from all devices",
  TOKEN_REFRESHED: "Tokens refreshed",

  // OTP / verify
  EMAIL_OTP_REQUIRED: "email and otp are required",
  EMAIL_REQUIRED: "email is required",
  ACCOUNT_ALREADY_VERIFIED: "Account is already verified",
  OTP_NOT_FOUND: "No verification code on file; request a new one",
  OTP_EXPIRED: "Verification code has expired",
  OTP_INVALID: "Invalid verification code",
  OTP_RESENT: "A new verification code has been sent",
  ACCOUNT_VERIFIED: "Account verified successfully",
};
