// Simple in-memory link store for dev/demo use.
// NOTE: This is ephemeral and not suitable for production.
const linkStore = new Map<string, string>();

function generateCode(length = 6)
{
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
}

export function createShortLink(originalUrl: string)
{
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

export function getOriginalUrl(code: string)
{
    return linkStore.get(code) ?? null;
}

export function clearStore()
{
    linkStore.clear();
}

export default linkStore;
