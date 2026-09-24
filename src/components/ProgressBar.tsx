import { percentColor } from '../game/formulas'

export default function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value))
  return (
    <div className="bar" role="meter" aria-valuenow={Math.round(width)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${width}%`, background: percentColor(width) }} />
    </div>
  )
}
