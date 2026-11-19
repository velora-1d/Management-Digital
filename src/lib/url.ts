export function ensureHttpsUrl(value?: string | null): string {
  if (!value) return "";

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("/") ||
    value.includes("localhost") ||
    value.includes("127.0.0.1")
  ) {
    return value;
  }

  if (value.startsWith("http://")) {
    return `https://${value.slice("http://".length)}`;
  }

  return value;
}
