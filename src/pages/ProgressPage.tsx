import { Link } from 'react-router-dom'
import { STRANDS, SKILLS, skillsInStrand } from '../curriculum'
import { useStore, masteryPercent, masteryLabel } from '../store/useStore'

export default function ProgressPage() {
  const { progress, testResults, totalStars, resetAll, name } = useStore()

  const attempted = Object.values(progress).reduce((s, p) => s + p.attempted, 0)
  const correct = Object.values(progress).reduce((s, p) => s + p.correct, 0)
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0
  const mastered = SKILLS.filter(s => masteryPercent(progress[s.id]) >= 80).length

  const needsWork = SKILLS.map(s => ({ skill: s, pct: masteryPercent(progress[s.id]), p: progress[s.id] }))
    .filter(x => x.p && x.p.attempted >= 3 && x.pct < 60)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{name ? `${name}'s progress` : 'Progress'} ⭐</h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Stars earned" value={totalStars} accent="text-warn" />
        <Stat label="Questions done" value={attempted} />
        <Stat label="Accuracy" value={`${accuracy}%`} accent={accuracy >= 70 ? 'text-good' : 'text-slate-100'} />
        <Stat label="Topics mastered" value={`${mastered}/${SKILLS.length}`} accent="text-good" />
      </div>

      {needsWork.length > 0 && (
        <section className="card p-5">
          <h2 className="font-bold mb-1">Worth practising next</h2>
          <p className="text-xs text-slate-500 mb-3">These are the topics with the most room to improve.</p>
          <div className="space-y-2">
            {needsWork.map(({ skill, pct }) => (
              <Link
                key={skill.id}
                to={`/practice/${skill.id}`}
                className="flex items-center gap-3 rounded-xl bg-slate-900/50 border border-slate-700 p-3 hover:border-brand transition"
              >
                <span className="flex-1 font-semibold">{skill.title}</span>
                <span className="text-sm text-slate-400 tabular-nums">{pct}%</span>
                <span className="text-slate-500">›</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {testResults.length > 0 && (
        <section className="card p-5">
          <h2 className="font-bold mb-3">Mock test history</h2>
          <div className="space-y-2">
            {testResults.slice(0, 8).map(r => (
              <div key={r.date} className="flex items-center justify-between text-sm border-b border-slate-700/60 pb-2 last:border-0">
                <span className="text-slate-400">
                  {new Date(r.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
                <span className="font-bold tabular-nums">
                  {r.score}/{r.total}
                </span>
                <span
                  className={
                    r.score / r.total >= 0.75 ? 'text-good' : r.score / r.total >= 0.5 ? 'text-warn' : 'text-red-400'
                  }
                >
                  {Math.round((r.score / r.total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {STRANDS.map(strand => (
        <section key={strand.id}>
          <h2 className="font-bold mb-2">
            {strand.emoji} {strand.title}
          </h2>
          <div className="card divide-y divide-slate-700/60">
            {skillsInStrand(strand.id).map(skill => {
              const pct = masteryPercent(progress[skill.id])
              const { label, color } = masteryLabel(pct)
              const p = progress[skill.id]
              return (
                <div key={skill.id} className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{skill.title}</div>
                    <div className="text-xs text-slate-500">
                      {p ? `${p.correct}/${p.attempted} correct · best streak ${p.bestStreak}` : 'Not started yet'}
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${color}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <button
        onClick={() => {
          if (confirm('This will erase all progress and stars. Are you sure?')) resetAll()
        }}
        className="btn-ghost w-full py-3 text-red-300"
      >
        Reset all progress
      </button>
    </div>
  )
}

function Stat({ label, value, accent = 'text-slate-100' }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="card p-4">
      <div className={`text-2xl font-extrabold tabular-nums ${accent}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
