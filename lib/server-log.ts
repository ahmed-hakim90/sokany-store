import "server-only";

/**
 * سجل بنية JSON (سطر واحد) — يسهّل التجميع في Vercel/Cloud Logging.
 */
export function logServerJson(
  event: string,
  fields: Record<string, unknown>,
): void {
  const payload = {
    ts: new Date().toISOString(),
    event,
    ...fields,
  };
  console.log(JSON.stringify(payload));
}
