import { describe, it, expect } from "vitest";
import { sign, verifySignature } from "../../src/security/hmac.js";

const secret = "unit-test-secret";

describe("HMAC utilities", () => {
  it("produces signatures that verify", () => {
    const payload = JSON.stringify({ test: true });
    const signature = sign(payload, secret);
    expect(verifySignature(payload, secret, signature)).toBe(true);
  });

  it("rejects non-hex signatures", () => {
    const payload = "{}";
    expect(verifySignature(payload, secret, "invalid-hex")).toBe(false);
  });

  it("rejects signatures with odd length", () => {
    const payload = "{}";
    const signature = sign(payload, secret);
    expect(verifySignature(payload, secret, signature.slice(0, -1))).toBe(false);
  });
});
