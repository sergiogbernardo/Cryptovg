import { EFF_WORDLIST } from './wordlist';

// All randomness comes from the Web Crypto CSPRNG. Nothing is generated with
// Math.random, which is not cryptographically secure.

const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

const AMBIGUOUS = new Set('O0oIl1|`'.split(''));

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalize: boolean;
  appendNumber: boolean;
}

// Uniform integer in [0, max) without modulo bias.
function randomInt(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(arr.length)];
}

export function buildPool(opts: PasswordOptions): string {
  let pool = '';
  if (opts.lower) pool += CHARSETS.lower;
  if (opts.upper) pool += CHARSETS.upper;
  if (opts.digits) pool += CHARSETS.digits;
  if (opts.symbols) pool += CHARSETS.symbols;
  if (opts.excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join('');
  }
  return pool;
}

export function generatePassword(opts: PasswordOptions): string {
  const chars = [...buildPool(opts)];
  if (chars.length === 0) return '';
  let out = '';
  for (let i = 0; i < opts.length; i += 1) {
    out += chars[randomInt(chars.length)];
  }
  return out;
}

export function generatePassphrase(opts: PassphraseOptions): string {
  const words: string[] = [];
  for (let i = 0; i < opts.words; i += 1) {
    let word = pick(EFF_WORDLIST);
    if (opts.capitalize) word = word[0].toUpperCase() + word.slice(1);
    words.push(word);
  }
  let phrase = words.join(opts.separator);
  if (opts.appendNumber) phrase += opts.separator + randomInt(10);
  return phrase;
}
