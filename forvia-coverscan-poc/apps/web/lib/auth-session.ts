import { createHmac } from "node:crypto";

/** Simple signed session value for the demo cookie (server-only module). */
const SECRET = "coverscan-poc-demo-secret";

export function createSessionValue(email: string): string {
  const payload = Buffer.from(email, "utf8").toString("base64url");
  const signature = createHmac("sha256", SECRET).update(payload).digest("base64url").slice(0, 24);
  return `${payload}.${signature}`;
}
