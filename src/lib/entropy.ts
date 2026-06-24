// Entropy estimates (in bits) for generated secrets, plus a shared rating used
// by the meters across panels.

export function bitsFromPool(poolSize: number, length: number): number {
  if (poolSize <= 1 || length <= 0) return 0;
  return Math.log2(poolSize) * length;
}

export function bitsFromWords(words: number, listSize = 7776): number {
  if (words <= 0) return 0;
  return Math.log2(listSize) * words;
}

export type Tone = 'weak' | 'fair' | 'good' | 'strong';

export function rateBits(bits: number): { tone: Tone; label: string } {
  if (bits < 40) return { tone: 'weak', label: 'fraca' };
  if (bits < 60) return { tone: 'fair', label: 'razoável' };
  if (bits < 80) return { tone: 'good', label: 'boa' };
  return { tone: 'strong', label: 'forte' };
}

export const TONE_BAR: Record<Tone, string> = {
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-emerald-500',
  strong: 'bg-emerald-400',
};

export const TONE_TEXT: Record<Tone, string> = {
  weak: 'text-red-400',
  fair: 'text-amber-400',
  good: 'text-emerald-400',
  strong: 'text-emerald-300',
};
