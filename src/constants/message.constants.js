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

  // Messages
  MESSAGE_CONTENT_REQUIRED: "Message content is required",
  MESSAGE_TOO_LONG: "Message is too long",
  RECIPIENT_NOT_FOUND: "No user found with this profile link",
  MESSAGE_NOT_FOUND: "Message not found",
  MESSAGE_DELETED: "Message deleted",
  MESSAGE_MARKED_READ: "Message marked as read",
  MESSAGE_SENT: "Your message was sent anonymously",
};
