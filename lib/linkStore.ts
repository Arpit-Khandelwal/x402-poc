// Simple in-memory link store for dev/demo use.
// NOTE: This is ephemeral and not suitable for production.
const linkStore = new Map<string, string>();

/**
 * Generates a random alphanumeric code.
 *
 * @param length - The length of the code to generate.
 * @returns The generated code string.
 */
function generateCode(length = 6) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/**
 * Creates a short link for the given URL.
 *
 * @param originalUrl - The URL to shorten.
 * @returns The generated short code.
 */
export function createShortLink(originalUrl: string) {
  // ensure unique code
  let code = generateCode();
  let attempts = 0;
  while (linkStore.has(code) && attempts < 10) {
    code = generateCode();
    attempts++;
  }
  // if collision persists, extend the length
  if (linkStore.has(code)) {
    code = generateCode(8);
  }
  linkStore.set(code, originalUrl);
  return code;
}

/**
 * Retrieves the original URL for a given code.
 *
 * @param code - The short code to look up.
 * @returns The original URL or null if not found.
 */
export function getOriginalUrl(code: string) {
  return linkStore.get(code) ?? null;
}

/**
 * Clears the link store.
 */
export function clearStore() {
  linkStore.clear();
}

export default linkStore;
