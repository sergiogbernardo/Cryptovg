import { lazy, Suspense, useState } from 'react';
import MatrixRain from './components/MatrixRain';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import GeneratorPanel from './components/GeneratorPanel';
import BreachPanel from './components/BreachPanel';
import TotpPanel from './components/TotpPanel';

// The strength panel pulls in zxcvbn with full dictionaries (~900 kB gzip), so
// load it only when its tab is opened to keep the initial bundle small.
const StrengthPanel = lazy(() => import('./components/StrengthPanel'));

const TABS = [
  { id: 'generator', label: 'Gerador' },
  { id: 'strength', label: 'Força' },
  { id: 'breach', label: 'Vazamento' },
  { id: 'totp', label: 'TOTP' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('generator');

  return (
    <div className="relative min-h-screen bg-grid-glow">
      <MatrixRain />
      <div className="relative z-10">
        <TopBar />

        <main className="mx-auto w-full max-w-3xl px-4 py-10 lg:px-6">
          <Hero />

          <nav className="mb-6 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-4 py-1.5 font-display text-sm font-semibold transition ${
                  tab === t.id
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'generator' && <GeneratorPanel />}
          {tab === 'strength' && (
            <Suspense
              fallback={<p className="panel font-mono text-xs text-slate-500">carregando…</p>}
            >
              <StrengthPanel />
            </Suspense>
          )}
          {tab === 'breach' && <BreachPanel />}
          {tab === 'totp' && <TotpPanel />}
        </main>

        <footer className="border-t border-emerald-500/10 py-6 text-center font-mono text-xs text-slate-600">
          © 2026 Sergio Bernardo
        </footer>
      </div>
    </div>
  );
}
