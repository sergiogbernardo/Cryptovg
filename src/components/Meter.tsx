import { TONE_BAR, type Tone } from '../lib/entropy';

interface Props {
  // Fraction 0..1.
  value: number;
  tone: Tone;
}

export default function Meter({ value, tone }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full rounded-full transition-all duration-300 ${TONE_BAR[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
