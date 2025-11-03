/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are set and valid on startup
 */

export interface Config {
  port: number;
  hmacSecret: string;
  rateLimitBypassToken?: string;
}

/**
 * Validates that HMAC_SECRET meets security requirements
 * - Must be set
 * - Must be at least 32 characters (recommended: 64 hex chars from openssl rand -hex 32)
 */
function validateHmacSecret(secret: string | undefined): string {
  if (!secret) {
    throw new Error(
      "HMAC_SECRET environment variable is required for security. " +
      "Generate one with: openssl rand -hex 32"
    );
  }

  if (secret === "change-me") {
    throw new Error(
      "HMAC_SECRET must be changed from the default 'change-me' value. " +
      "Generate a secure secret with: openssl rand -hex 32"
    );
  }

  if (secret.length < 32) {
    throw new Error(
      `HMAC_SECRET must be at least 32 characters long for security (current: ${secret.length}). ` +
      "Generate a secure secret with: openssl rand -hex 32"
    );
  }

  return secret;
}

/**
 * Validates and loads configuration from environment variables
 * Throws on startup if required variables are missing or invalid
 */
export function loadConfig(): Config {
  const port = Number(process.env.PORT || 8080);
  
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}. Must be between 1 and 65535.`);
  }

  const hmacSecret = validateHmacSecret(process.env.HMAC_SECRET);
  const rateLimitBypassToken = process.env.RATE_LIMIT_BYPASS_TOKEN;

  return {
    port,
    hmacSecret,
    rateLimitBypassToken,
  };
}
