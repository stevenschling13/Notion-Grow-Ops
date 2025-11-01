import { describe, it, expect } from "vitest";

import { extractNotionIdFromUrl } from "../src/integrations/notion.js";

describe("notion helpers", () => {
  it("extracts ids from pretty urls", () => {
    const url = "https://www.notion.so/Grow-Ops-Record-12345678abcd1234abcd1234abcd1234";
    expect(extractNotionIdFromUrl(url)).toBe("12345678abcd1234abcd1234abcd1234".toLowerCase());
  });

  it("extracts ids from hyphenated urls", () => {
    const url = "https://www.notion.so/12345678-abcd-1234-abcd-1234abcd1234";
    expect(extractNotionIdFromUrl(url)).toBe("12345678abcd1234abcd1234abcd1234");
  });

  it("throws for invalid urls", () => {
    expect(() => extractNotionIdFromUrl("https://example.com/nope")).toThrowError();
  });
});
