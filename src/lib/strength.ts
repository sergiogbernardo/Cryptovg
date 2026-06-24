import { ZxcvbnFactory, type ZxcvbnResult } from '@zxcvbn-ts/core';
import * as common from '@zxcvbn-ts/language-common';
import * as en from '@zxcvbn-ts/language-en';

// One factory, configured with the English + common dictionaries and graphs.
const zxcvbn = new ZxcvbnFactory({
  dictionary: { ...common.dictionary, ...en.dictionary },
  graphs: common.adjacencyGraphs,
  translations: en.translations,
});

export type { ZxcvbnResult };

export function analyze(password: string): ZxcvbnResult {
  return zxcvbn.check(password);
}

// zxcvbn score is 0..4; map it to our shared tone scale.
export function scoreTone(score: number): 'weak' | 'fair' | 'good' | 'strong' {
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'good';
  return 'strong';
}

const SCORE_LABELS = ['muito fraca', 'fraca', 'razoável', 'boa', 'forte'];

export function scoreLabel(score: number): string {
  return SCORE_LABELS[score] ?? '—';
}
