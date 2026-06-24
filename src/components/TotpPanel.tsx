import { useEffect, useState } from 'react';
import {
  DEFAULT_TOTP,
  generateTotp,
  parseOtpauth,
  secondsRemaining,
  type TotpConfig,
} from '../lib/totp';
import CopyButton from './CopyButton';

export default function TotpPanel() {
  const [raw, setRaw] = useState('');
  const [config, setConfig] = useState<TotpConfig>(DEFAULT_TOTP);
  const [code, setCode] = useState('------');
  const [remaining, setRemaining] = useState(config.period);
  const [error, setError] = useState<string | null>(null);

  // Parse the input into a config whenever it changes (base32 secret or
  // otpauth:// URI).
  useEffect(() => {
    const value = raw.trim();
    if (!value) {
      setConfig(DEFAULT_TOTP);
      setError(null);
      return;
    }
    if (value.startsWith('otpauth://')) {
      try {
        const parsed = parseOtpauth(value);
        setConfig({
          secret: parsed.secret,
          digits: parsed.digits,
          period: parsed.period,
          algorithm: parsed.algorithm,
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'URI inválida');
      }
    } else {
      setConfig({ ...DEFAULT_TOTP, secret: value });
      setError(null);
    }
  }, [raw]);

  // Recompute the code every second.
  useEffect(() => {
    let active = true;
    const tick = async () => {
      if (!config.secret) {
        if (active) setCode('------');
        return;
      }
      try {
        const next = await generateTotp(config);
        if (active) {
          setCode(next);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setCode('------');
          setError(e instanceof Error ? e.message : 'Secret inválido');
        }
      }
      if (active) setRemaining(secondsRemaining(config.period));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [config]);

  return (
    <div className="space-y-4">
      <div className="panel">
        <label className="field-label" htmlFor="totp-input">
          secret (base32) ou URI otpauth://
        </label>
        <textarea
          id="totp-input"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={2}
          autoComplete="off"
          spellCheck={false}
          placeholder="JBSWY3DPEHPK3PXP  ou  otpauth://totp/Conta?secret=…"
          className="w-full resize-none rounded-lg border border-emerald-500/20 bg-black/50 px-3 py-2 font-mono text-sm text-emerald-200 outline-none focus:border-emerald-400/50"
        />
        <p className="mt-2 font-mono text-xs text-slate-500">
          HMAC via Web Crypto. O secret não sai do navegador.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="panel">
        <div className="flex items-center justify-between gap-3">
          <code className="font-mono text-4xl tracking-[0.3em] text-emerald-300">{code}</code>
          <CopyButton value={code === '------' ? '' : code} />
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between font-mono text-xs text-slate-500">
            <span>
              {config.algorithm} · {config.digits} dígitos · {config.period}s
            </span>
            <span className="text-emerald-300">{remaining}s</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-1000 ease-linear"
              style={{ width: `${(remaining / config.period) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
