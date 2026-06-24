import { useState } from 'react';
import { checkPassword, type BreachResult } from '../lib/hibp';

export default function BreachPanel() {
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BreachResult | null>(null);

  const check = async () => {
    if (!password) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await checkPassword(password));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na checagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="panel border-emerald-500/20 bg-emerald-500/5">
        <p className="panel-title">Como sua senha fica protegida</p>
        <p className="mt-2 text-sm text-slate-300">
          A senha é convertida em hash SHA-1 <strong>aqui no navegador</strong>. Só os{' '}
          <strong>5 primeiros caracteres</strong> do hash são enviados ao Have I Been Pwned
          (k-anonymity). O serviço devolve todos os sufixos com esse prefixo e a comparação é feita
          localmente — sua senha nunca sai do dispositivo.
        </p>
      </div>

      <div className="panel">
        <label className="field-label" htmlFor="breach-input">
          senha para checar
        </label>
        <div className="flex gap-2">
          <input
            id="breach-input"
            type={reveal ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
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
        <button
          type="button"
          onClick={check}
          disabled={!password || loading}
          className="mt-3 rounded-lg bg-emerald-400/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-400/25 disabled:opacity-40"
        >
          {loading ? 'checando…' : 'checar vazamento'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && !error && (
        <div
          className={`panel ${
            result.found
              ? 'border-red-500/30 bg-red-500/10'
              : 'border-emerald-500/30 bg-emerald-500/10'
          }`}
        >
          {result.found ? (
            <p className="text-sm text-red-300">
              ⚠ Esta senha apareceu em{' '}
              <strong>{result.count.toLocaleString('pt-BR')}</strong> vazamentos. Não use.
            </p>
          ) : (
            <p className="text-sm text-emerald-300">
              ✓ Esta senha não consta na base do HIBP. Isso não garante que seja forte — combine com
              a aba <strong>Força</strong>.
            </p>
          )}
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
            prefixo enviado: {result.prefix}…
          </p>
        </div>
      )}
    </div>
  );
}
