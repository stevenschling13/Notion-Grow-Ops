import { createHmac, timingSafeEqual } from "crypto";

const HEX_SIGNATURE_REGEX = /^[0-9a-f]+$/i;

export function sign(body: string | Buffer, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(body: string | Buffer, secret: string, signature: string): boolean {
  if (!HEX_SIGNATURE_REGEX.test(signature) || signature.length % 2 !== 0) {
    return false;
  }
  const computed = createHmac("sha256", secret).update(body).digest();
  const provided = Buffer.from(signature, "hex");
  if (computed.length !== provided.length) {
    return false;
  }
  return timingSafeEqual(computed, provided);
}
