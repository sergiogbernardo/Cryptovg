import { useCallback, useEffect, useState } from 'react';
import {
  buildPool,
  generatePassphrase,
  generatePassword,
  type PasswordOptions,
  type PassphraseOptions,
} from '../lib/generator';
import { bitsFromPool, bitsFromWords, rateBits, TONE_TEXT } from '../lib/entropy';
import CopyButton from './CopyButton';
import Meter from './Meter';

type Mode = 'password' | 'passphrase';

const DEFAULT_PASSWORD: PasswordOptions = {
  length: 20,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

const DEFAULT_PASSPHRASE: PassphraseOptions = {
  words: 5,
  separator: '-',
  capitalize: false,
  appendNumber: false,
};

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-emerald-400"
      />
      {label}
    </label>
  );
}

export default function GeneratorPanel() {
  const [mode, setMode] = useState<Mode>('password');
  const [pwd, setPwd] = useState(DEFAULT_PASSWORD);
  const [phrase, setPhrase] = useState(DEFAULT_PASSPHRASE);
  const [value, setValue] = useState('');

  const regenerate = useCallback(() => {
    setValue(mode === 'password' ? generatePassword(pwd) : generatePassphrase(phrase));
  }, [mode, pwd, phrase]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const bits =
    mode === 'password'
      ? bitsFromPool([...buildPool(pwd)].length, pwd.length)
      : bitsFromWords(phrase.words) + (phrase.appendNumber ? Math.log2(10) : 0);
  const rating = rateBits(bits);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['password', 'passphrase'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
              mode === m
                ? 'bg-emerald-400/15 text-emerald-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {m === 'password' ? 'Senha' : 'Passphrase'}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="flex items-start justify-between gap-3">
          <code className="break-all font-mono text-lg text-emerald-300">{value || '—'}</code>
          <div className="flex shrink-0 gap-2">
            <CopyButton value={value} />
            <button
              type="button"
              onClick={regenerate}
              className="rounded-md border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition hover:border-emerald-400/50 hover:text-emerald-300"
            >
              gerar
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="field-label mb-0">entropia</span>
            <span className={`font-mono text-xs ${TONE_TEXT[rating.tone]}`}>
              {Math.round(bits)} bits · {rating.label}
            </span>
          </div>
          <Meter value={bits / 100} tone={rating.tone} />
        </div>
      </div>

      <div className="panel space-y-4">
        {mode === 'password' ? (
          <>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="field-label mb-0">comprimento</span>
                <span className="font-mono text-xs text-emerald-300">{pwd.length}</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={pwd.length}
                onChange={(e) => setPwd({ ...pwd, length: Number(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Check label="a-z" checked={pwd.lower} onChange={(v) => setPwd({ ...pwd, lower: v })} />
              <Check label="A-Z" checked={pwd.upper} onChange={(v) => setPwd({ ...pwd, upper: v })} />
              <Check
                label="0-9"
                checked={pwd.digits}
                onChange={(v) => setPwd({ ...pwd, digits: v })}
              />
              <Check
                label="símbolos"
                checked={pwd.symbols}
                onChange={(v) => setPwd({ ...pwd, symbols: v })}
              />
              <Check
                label="excluir ambíguos"
                checked={pwd.excludeAmbiguous}
                onChange={(v) => setPwd({ ...pwd, excludeAmbiguous: v })}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="field-label mb-0">palavras</span>
                <span className="font-mono text-xs text-emerald-300">{phrase.words}</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                value={phrase.words}
                onChange={(e) => setPhrase({ ...phrase, words: Number(e.target.value) })}
                className="w-full accent-emerald-400"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                separador
                <select
                  value={phrase.separator}
                  onChange={(e) => setPhrase({ ...phrase, separator: e.target.value })}
                  className="rounded-md border border-emerald-500/20 bg-black/50 px-2 py-1 font-mono text-xs text-emerald-300"
                >
                  <option value="-">-</option>
                  <option value=".">.</option>
                  <option value="_">_</option>
                  <option value=" ">espaço</option>
                </select>
              </label>
              <Check
                label="Capitalizar"
                checked={phrase.capitalize}
                onChange={(v) => setPhrase({ ...phrase, capitalize: v })}
              />
              <Check
                label="Acrescentar número"
                checked={phrase.appendNumber}
                onChange={(v) => setPhrase({ ...phrase, appendNumber: v })}
              />
            </div>
            <p className="font-mono text-xs text-slate-500">
              Diceware com a wordlist EFF (7776 palavras, ~12,9 bits por palavra).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
