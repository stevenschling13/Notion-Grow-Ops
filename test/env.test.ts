import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/config/env.js";

describe("loadEnv", () => {
  it("parses minimal configuration", () => {
    const env = loadEnv({ HMAC_SECRET: "secret" } as NodeJS.ProcessEnv);
    expect(env.HMAC_SECRET).toBe("secret");
    expect(env.ENABLE_NOTION_SYNC).toBe(false);
  });

  it("fails when notion sync is enabled without required vars", () => {
    expect(() =>
      loadEnv({ HMAC_SECRET: "secret", ENABLE_NOTION_SYNC: "true" } as NodeJS.ProcessEnv),
    ).toThrowError(/ENABLE_NOTION_SYNC/);
  });
});
