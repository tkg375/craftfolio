// Web Crypto PBKDF2 — no WASM, works in Cloudflare Workers

const ITERATIONS = 100_000;
const SALT_LEN = 16;
const KEY_LEN = 32;

async function deriveKey(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: ITERATIONS, hash: "SHA-256" } as Pbkdf2Params,
    keyMaterial,
    KEY_LEN * 8
  );
  return toHex(bits);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return arr;
}

export async function hashPassword(password: string): Promise<string> {
  const saltArr = new Uint8Array(SALT_LEN);
  crypto.getRandomValues(saltArr);
  const saltHex = toHex(saltArr.buffer);
  const keyHex = await deriveKey(password, saltHex);
  return `${saltHex}:${keyHex}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":");
  if (!saltHex || !keyHex) return false;
  const derived = await deriveKey(password, saltHex);
  // Constant-time comparison
  const a = fromHex(derived);
  const b = fromHex(keyHex);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
