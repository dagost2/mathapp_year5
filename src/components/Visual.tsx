import { Visual as V } from '../curriculum/types'

/**
 * Renders the diagram attached to a question. Everything is inline SVG so it
 * scales cleanly on an iPad and needs no image assets.
 */
export function Visual({ visual }: { visual: V }) {
  switch (visual.kind) {
    case 'fractionBar':
      return <FractionBar parts={visual.parts} shaded={visual.shaded} label={visual.label} />
    case 'fractionBarPair':
      return (
        <div className="flex flex-col gap-3">
          <FractionBar parts={visual.a[1]} shaded={visual.a[0]} label={`${visual.a[0]}/${visual.a[1]}`} />
          <FractionBar parts={visual.b[1]} shaded={visual.b[0]} label={`${visual.b[0]}/${visual.b[1]}`} color="#0D9488" />
        </div>
      )
    case 'numberLine':
      return <NumberLine {...visual} />
    case 'grid':
      return <Grid rows={visual.rows} cols={visual.cols} unit={visual.unit} />
    case 'barChart':
      return <BarChart title={visual.title} data={visual.data} />
    case 'angle':
      return <Angle degrees={visual.degrees} />
    case 'spinner':
      return <Marbles segments={visual.segments} />
    case 'shape':
      return <Polygon sides={visual.sides} />
    case 'coordGrid':
      return <CoordGrid size={visual.size} points={visual.points} />
    case 'clock':
      return <Clock hour={visual.hour} minute={visual.minute} />
  }
}

function FractionBar({ parts, shaded, label, color = '#7C3AED' }: { parts: number; shaded: number; label?: string; color?: string }) {
  const w = 320
  const h = 54
  const seg = w / parts
  return (
    <svg viewBox={`0 0 ${w} ${h + 22}`} className="w-full max-w-sm mx-auto">
      {Array.from({ length: parts }, (_, i) => (
        <rect
          key={i}
          x={i * seg}
          y={0}
          width={seg}
          height={h}
          fill={i < shaded ? color : '#1E293B'}
          stroke="#94A3B8"
          strokeWidth={2}
        />
      ))}
      {label && (
        <text x={w / 2} y={h + 18} textAnchor="middle" fill="#CBD5E1" fontSize={16} fontWeight={600}>
          {label}
        </text>
      )}
    </svg>
  )
}

function NumberLine({ min, max, step, mark, showMark }: { min: number; max: number; step: number; mark?: number; showMark: boolean }) {
  const w = 340
  const ticks: number[] = []
  for (let v = min; v <= max; v += step) ticks.push(Number(v.toFixed(4)))
  const pos = (v: number) => 20 + ((v - min) / (max - min)) * (w - 40)
  return (
    <svg viewBox={`0 0 ${w} 70`} className="w-full max-w-md mx-auto">
      <line x1={20} y1={40} x2={w - 20} y2={40} stroke="#94A3B8" strokeWidth={2} />
      {ticks.map(v => (
        <g key={v}>
          <line x1={pos(v)} y1={32} x2={pos(v)} y2={48} stroke="#94A3B8" strokeWidth={2} />
          <text x={pos(v)} y={64} textAnchor="middle" fill="#CBD5E1" fontSize={12}>
            {v}
          </text>
        </g>
      ))}
      {showMark && mark !== undefined && <circle cx={pos(mark)} cy={40} r={7} fill="#7C3AED" stroke="#fff" strokeWidth={2} />}
    </svg>
  )
}

function Grid({ rows, cols, unit }: { rows: number; cols: number; unit?: string }) {
  const cell = Math.max(10, Math.min(26, 260 / Math.max(rows, cols)))
  const w = cols * cell
  const h = rows * cell
  return (
    <svg viewBox={`0 0 ${w + 60} ${h + 50}`} className="w-full max-w-sm mx-auto">
      <g transform="translate(30, 10)">
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#312E81" stroke="#818CF8" strokeWidth={1} />
          ))
        )}
        <text x={w / 2} y={h + 26} textAnchor="middle" fill="#CBD5E1" fontSize={14} fontWeight={600}>
          {cols} {unit}
        </text>
        <text x={-12} y={h / 2} textAnchor="middle" fill="#CBD5E1" fontSize={14} fontWeight={600} transform={`rotate(-90, -12, ${h / 2})`}>
          {rows} {unit}
        </text>
      </g>
    </svg>
  )
}

function BarChart({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const w = 340
  const h = 190
  const max = Math.max(...data.map(d => d.value))
  const step = max <= 10 ? 1 : max <= 25 ? 5 : 10
  const top = Math.ceil(max / step) * step
  const barW = (w - 60) / data.length
  const colors = ['#7C3AED', '#2563EB', '#0D9488', '#EA580C']
  const gridlines: number[] = []
  for (let v = 0; v <= top; v += step) gridlines.push(v)
  return (
    <svg viewBox={`0 0 ${w} ${h + 46}`} className="w-full max-w-md mx-auto">
      <text x={w / 2} y={14} textAnchor="middle" fill="#E2E8F0" fontSize={14} fontWeight={700}>
        {title}
      </text>
      {gridlines.map(v => {
        const y = h - (v / top) * (h - 30) + 4
        return (
          <g key={v}>
            <line x1={40} y1={y} x2={w - 10} y2={y} stroke="#334155" strokeWidth={1} />
            <text x={34} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize={11}>
              {v}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const bh = (d.value / top) * (h - 30)
        return (
          <g key={d.label}>
            <rect x={44 + i * barW} y={h - bh + 4} width={barW - 14} height={bh} fill={colors[i % colors.length]} rx={3} />
            <text x={44 + i * barW + (barW - 14) / 2} y={h + 22} textAnchor="middle" fill="#CBD5E1" fontSize={11}>
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Angle({ degrees }: { degrees: number }) {
  const cx = 60
  const cy = 130
  const r = 110
  const rad = (degrees * Math.PI) / 180
  const x2 = cx + r * Math.cos(-rad)
  const y2 = cy + r * Math.sin(-rad)
  return (
    <svg viewBox="0 0 220 160" className="w-full max-w-xs mx-auto">
      <path
        d={`M ${cx + 34} ${cy} A 34 34 0 0 0 ${cx + 34 * Math.cos(-rad)} ${cy + 34 * Math.sin(-rad)}`}
        fill="none"
        stroke="#F59E0B"
        strokeWidth={3}
      />
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#E2E8F0" strokeWidth={4} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#E2E8F0" strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="#7C3AED" />
    </svg>
  )
}

function Marbles({ segments }: { segments: { label: string; color: string }[] }) {
  const perRow = 6
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto" style={{ maxWidth: perRow * 44 }}>
      {segments.map((s, i) => (
        <div
          key={i}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner"
          style={{ background: s.color }}
        >
          {s.label}
        </div>
      ))}
    </div>
  )
}

function Polygon({ sides }: { sides: number }) {
  const n = Math.max(3, sides)
  const r = 62
  const cx = 80
  const cy = 80
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto">
      <polygon points={pts} fill="#EA580C" fillOpacity={0.25} stroke="#FB923C" strokeWidth={3} strokeLinejoin="round" />
    </svg>
  )
}

function CoordGrid({ size, points }: { size: number; points: { x: number; y: number; label: string }[] }) {
  const cell = 220 / size
  const pad = 26
  const px = (x: number) => pad + x * cell
  const py = (y: number) => pad + (size - y) * cell
  return (
    <svg viewBox={`0 0 ${220 + pad * 2} ${220 + pad * 2}`} className="w-full max-w-xs mx-auto">
      {Array.from({ length: size + 1 }, (_, i) => (
        <g key={i}>
          <line x1={px(i)} y1={py(0)} x2={px(i)} y2={py(size)} stroke="#334155" strokeWidth={1} />
          <line x1={px(0)} y1={py(i)} x2={px(size)} y2={py(i)} stroke="#334155" strokeWidth={1} />
          <text x={px(i)} y={py(0) + 16} textAnchor="middle" fill="#94A3B8" fontSize={11}>
            {i}
          </text>
          <text x={px(0) - 10} y={py(i) + 4} textAnchor="end" fill="#94A3B8" fontSize={11}>
            {i}
          </text>
        </g>
      ))}
      <line x1={px(0)} y1={py(0)} x2={px(size)} y2={py(0)} stroke="#94A3B8" strokeWidth={2} />
      <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(size)} stroke="#94A3B8" strokeWidth={2} />
      {points.map(p => (
        <g key={p.label}>
          <circle cx={px(p.x)} cy={py(p.y)} r={6} fill="#EA580C" stroke="#fff" strokeWidth={2} />
          <text x={px(p.x) + 11} y={py(p.y) - 8} fill="#FDBA74" fontSize={14} fontWeight={700}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Clock({ hour, minute }: { hour: number; minute: number }) {
  const cx = 80
  const cy = 80
  const minAngle = (minute / 60) * Math.PI * 2 - Math.PI / 2
  const hrAngle = (((hour % 12) + minute / 60) / 12) * Math.PI * 2 - Math.PI / 2
  return (
    <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto">
      <circle cx={cx} cy={cy} r={70} fill="#1E293B" stroke="#94A3B8" strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2
        return (
          <text
            key={i}
            x={cx + 56 * Math.cos(a)}
            y={cy + 56 * Math.sin(a) + 5}
            textAnchor="middle"
            fill="#CBD5E1"
            fontSize={13}
            fontWeight={600}
          >
            {i === 0 ? 12 : i}
          </text>
        )
      })}
      <line x1={cx} y1={cy} x2={cx + 34 * Math.cos(hrAngle)} y2={cy + 34 * Math.sin(hrAngle)} stroke="#E2E8F0" strokeWidth={5} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + 50 * Math.cos(minAngle)} y2={cy + 50 * Math.sin(minAngle)} stroke="#7C3AED" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="#F59E0B" />
    </svg>
  )
}
