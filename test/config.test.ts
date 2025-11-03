import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../src/config.js";

describe("Config Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env = originalEnv;
  });

  it("loads config successfully with valid environment variables", () => {
    process.env.PORT = "3000";
    process.env.HMAC_SECRET = "a".repeat(64); // 64 character secret
    process.env.RATE_LIMIT_BYPASS_TOKEN = "bypass-token-123";

    const config = loadConfig();

    expect(config.port).toBe(3000);
    expect(config.hmacSecret).toBe("a".repeat(64));
    expect(config.rateLimitBypassToken).toBe("bypass-token-123");
  });

  it("uses default port 8080 when PORT is not set", () => {
    process.env.HMAC_SECRET = "a".repeat(64);
    delete process.env.PORT;

    const config = loadConfig();

    expect(config.port).toBe(8080);
  });

  it("throws error when HMAC_SECRET is not set", () => {
    delete process.env.HMAC_SECRET;

    expect(() => loadConfig()).toThrow(
      "HMAC_SECRET environment variable is required"
    );
  });

  it("throws error when HMAC_SECRET is 'change-me'", () => {
    process.env.HMAC_SECRET = "change-me";

    expect(() => loadConfig()).toThrow(
      "HMAC_SECRET must be changed from the default 'change-me' value"
    );
  });

  it("throws error when HMAC_SECRET is too short", () => {
    process.env.HMAC_SECRET = "short"; // Only 5 characters

    expect(() => loadConfig()).toThrow(
      "HMAC_SECRET must be at least 32 characters long"
    );
  });

  it("accepts HMAC_SECRET that is exactly 32 characters", () => {
    process.env.HMAC_SECRET = "a".repeat(32);

    expect(() => loadConfig()).not.toThrow();
    
    const config = loadConfig();
    expect(config.hmacSecret).toBe("a".repeat(32));
  });

  it("throws error when PORT is invalid", () => {
    process.env.PORT = "not-a-number";
    process.env.HMAC_SECRET = "a".repeat(64);

    expect(() => loadConfig()).toThrow("Invalid PORT value");
  });

  it("throws error when PORT is negative", () => {
    process.env.PORT = "-1";
    process.env.HMAC_SECRET = "a".repeat(64);

    expect(() => loadConfig()).toThrow("Invalid PORT value");
  });

  it("throws error when PORT is too large", () => {
    process.env.PORT = "99999";
    process.env.HMAC_SECRET = "a".repeat(64);

    expect(() => loadConfig()).toThrow("Invalid PORT value");
  });

  it("accepts PORT at boundary values", () => {
    process.env.HMAC_SECRET = "a".repeat(64);

    // Test port 1 (minimum)
    process.env.PORT = "1";
    expect(() => loadConfig()).not.toThrow();

    // Test port 65535 (maximum)
    process.env.PORT = "65535";
    expect(() => loadConfig()).not.toThrow();
  });

  it("allows undefined RATE_LIMIT_BYPASS_TOKEN", () => {
    process.env.HMAC_SECRET = "a".repeat(64);
    delete process.env.RATE_LIMIT_BYPASS_TOKEN;

    const config = loadConfig();

    expect(config.rateLimitBypassToken).toBeUndefined();
  });
});
