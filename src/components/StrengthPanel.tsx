import { useMemo, useState } from 'react';
import { analyze, scoreLabel, scoreTone } from '../lib/strength';
import { TONE_TEXT } from '../lib/entropy';
import Meter from './Meter';

export default function StrengthPanel() {
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);

  const result = useMemo(() => (password ? analyze(password) : null), [password]);
  const tone = result ? scoreTone(result.score) : 'weak';

  return (
    <div className="space-y-4">
      <div className="panel">
        <label className="field-label" htmlFor="strength-input">
          senha para analisar
        </label>
        <div className="flex gap-2">
          <input
            id="strength-input"
            type={reveal ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="digite ou cole uma senha"
            className="w-full rounded-lg border border-emerald-500/20 bg-black/50 px-3 py-2 font-mono text-sm text-emerald-200 outline-none focus:border-emerald-400/50"
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="rounded-md border border-emerald-500/20 px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition hover:border-emerald-400/50 hover:text-emerald-300"
          >
            {reveal ? 'ocultar' : 'ver'}
          </button>
        </div>
        <p className="mt-2 font-mono text-xs text-slate-500">
          A análise roda 100% no navegador (zxcvbn). Nada é enviado.
        </p>
      </div>

      {result && (
        <div className="panel space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="field-label mb-0">força</span>
              <span className={`font-mono text-xs ${TONE_TEXT[tone]}`}>
                {scoreLabel(result.score)} ({result.score}/4)
              </span>
            </div>
            <Meter value={(result.score + 1) / 5} tone={tone} />
          </div>

          <dl className="grid grid-cols-1 gap-2 font-mono text-xs sm:grid-cols-2">
            <div className="flex justify-between gap-2 border-b border-emerald-500/10 pb-1">
              <dt className="text-slate-500">quebra offline (lenta)</dt>
              <dd className="text-emerald-300">
                {String(result.crackTimes.offlineSlowHashingXPerSecond)}
              </dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-emerald-500/10 pb-1">
              <dt className="text-slate-500">quebra offline (rápida)</dt>
              <dd className="text-emerald-300">
                {String(result.crackTimes.offlineFastHashingXPerSecond)}
              </dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-emerald-500/10 pb-1">
              <dt className="text-slate-500">tentativas (guesses)</dt>
              <dd className="text-emerald-300">{result.guesses.toLocaleString('pt-BR')}</dd>
            </div>
            <div className="flex justify-between gap-2 border-b border-emerald-500/10 pb-1">
              <dt className="text-slate-500">cálculo</dt>
              <dd className="text-emerald-300">{result.calcTime} ms</dd>
            </div>
          </dl>

          {(result.feedback.warning || result.feedback.suggestions.length > 0) && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
              {result.feedback.warning && (
                <p className="text-amber-300">{result.feedback.warning}</p>
              )}
              {result.feedback.suggestions.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-slate-400">
                  {result.feedback.suggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
