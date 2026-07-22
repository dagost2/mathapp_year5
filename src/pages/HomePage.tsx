import { useState } from 'react'
import { Link } from 'react-router-dom'
import { STRANDS, skillsInStrand } from '../curriculum'
import { useStore, masteryPercent, masteryLabel } from '../store/useStore'

const STRAND_BG: Record<string, string> = {
  number: 'bg-number',
  algebra: 'bg-algebra',
  measurement: 'bg-measurement',
  space: 'bg-space',
  stats: 'bg-stats'
}

export default function HomePage() {
  const { name, setName, progress, totalStars } = useStore()
  const [editingName, setEditingName] = useState(!name)
  const [draft, setDraft] = useState(name)

  return (
    <div className="space-y-6">
      <header>
        {editingName ? (
          <div className="card p-4">
            <label className="block text-sm text-slate-400 mb-2">What is your name?</label>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-lg outline-none focus:border-brand"
              />
              <button
                onClick={() => {
                  setName(draft.trim())
                  setEditingName(false)
                }}
                disabled={!draft.trim()}
                className="btn-primary"
              >
                Go
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">Hi {name}! 👋</h1>
              <p className="text-slate-400">Ready for some maths practice?</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-extrabold text-warn">⭐ {totalStars}</div>
              <div className="text-xs text-slate-500">stars</div>
            </div>
          </div>
        )}
      </header>

      <Link to="/test" className="card p-4 flex items-center gap-4 hover:border-brand transition">
        <span className="text-3xl">📝</span>
        <div className="flex-1">
          <h2 className="font-bold text-lg">Try a mock NAPLAN test</h2>
          <p className="text-sm text-slate-400">40 questions, just like the real thing</p>
        </div>
        <span className="text-slate-500">›</span>
      </Link>

      {STRANDS.map(strand => {
        const skills = skillsInStrand(strand.id)
        return (
          <section key={strand.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{strand.emoji}</span>
              <div>
                <h2 className="font-bold text-lg leading-tight">{strand.title}</h2>
                <p className="text-xs text-slate-500">{strand.blurb}</p>
              </div>
            </div>

            <div className="space-y-2">
              {skills.map(skill => {
                const pct = masteryPercent(progress[skill.id])
                const { label, color } = masteryLabel(pct)
                return (
                  <Link
                    key={skill.id}
                    to={`/practice/${skill.id}`}
                    className="card p-4 flex items-center gap-3 hover:border-brand transition"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{skill.title}</h3>
                      <p className="text-xs text-slate-500 truncate">{skill.blurb}</p>
                      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${STRAND_BG[strand.id]} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-bold ${color}`}>{label}</div>
                      <div className="text-lg font-extrabold tabular-nums">{pct}%</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
