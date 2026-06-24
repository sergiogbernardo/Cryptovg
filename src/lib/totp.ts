// RFC 6238 TOTP, implemented on top of the Web Crypto API. No external library
// and no network: the secret never leaves the browser.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export type TotpAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

export interface TotpConfig {
  secret: string; // base32
  digits: number;
  period: number;
  algorithm: TotpAlgorithm;
}

export interface ParsedOtpauth extends TotpConfig {
  label?: string;
  issuer?: string;
}

export const DEFAULT_TOTP: TotpConfig = {
  secret: '',
  digits: 6,
  period: 30,
  algorithm: 'SHA-1',
};

// Copy into a standalone ArrayBuffer so the Web Crypto types accept it
// regardless of the underlying buffer kind.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function base32Decode(input: string): Uint8Array {
  const clean = input.replace(/=+$/, '').replace(/\s/g, '').toUpperCase();
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of clean) {
    const index = BASE32_ALPHABET.indexOf(ch);
    if (index === -1) throw new Error(`Caractere base32 inválido: "${ch}"`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export function parseOtpauth(uri: string): ParsedOtpauth {
  const url = new URL(uri);
  if (url.protocol !== 'otpauth:') throw new Error('A URI precisa começar com otpauth://');
  const params = url.searchParams;
  const algorithm = (params.get('algorithm') ?? 'SHA1').toUpperCase();
  return {
    secret: params.get('secret') ?? '',
    digits: Number(params.get('digits') ?? 6),
    period: Number(params.get('period') ?? 30),
    algorithm: algorithm === 'SHA256' ? 'SHA-256' : algorithm === 'SHA512' ? 'SHA-512' : 'SHA-1',
    issuer: params.get('issuer') ?? undefined,
    label: decodeURIComponent(url.pathname.replace(/^\/+/, '')) || undefined,
  };
}

export async function generateTotp(cfg: TotpConfig, forTime = Date.now()): Promise<string> {
  const key = base32Decode(cfg.secret);
  if (key.length === 0) throw new Error('Secret vazio');

  // 8-byte big-endian counter = elapsed time steps.
  let counter = Math.floor(forTime / 1000 / cfg.period);
  const message = new Uint8Array(8);
  for (let i = 7; i >= 0; i -= 1) {
    message[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(key),
    { name: 'HMAC', hash: cfg.algorithm },
    false,
    ['sign'],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', cryptoKey, toArrayBuffer(message)),
  );

  // Dynamic truncation (RFC 4226 §5.3).
  const offset = signature[signature.length - 1] & 0x0f;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  return (binary % 10 ** cfg.digits).toString().padStart(cfg.digits, '0');
}

export function secondsRemaining(period: number, forTime = Date.now()): number {
  return period - (Math.floor(forTime / 1000) % period);
}
