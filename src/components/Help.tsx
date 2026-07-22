import { useState } from 'react'
import { Guide } from '../curriculum/types'

/** Full-screen "how does this work?" explainer for the current skill. */
export function GuideModal({ title, guide, onClose }: { title: string; guide: Guide; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div
        className="card w-full sm:max-w-lg max-h-[88vh] overflow-y-auto p-5 rounded-b-none sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold text-brand">How {title.toLowerCase()} works</h2>
          <button onClick={onClose} className="btn-ghost px-3 py-1.5 shrink-0" aria-label="Close">
            ✕
          </button>
        </div>

        <p className="text-slate-200 leading-relaxed mb-4">{guide.summary}</p>

        <h3 className="font-bold text-slate-300 mb-2">Step by step</h3>
        <ol className="space-y-2 mb-4">
          {guide.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand text-white text-sm font-bold grid place-items-center">
                {i + 1}
              </span>
              <span className="text-slate-200 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>

        {guide.example && (
          <div className="rounded-xl bg-slate-900/60 border border-slate-700 p-4 mb-4">
            <h3 className="font-bold text-slate-300 mb-2">Worked example</h3>
            <p className="text-slate-100 font-semibold mb-2">{guide.example.question}</p>
            <ul className="space-y-1 mb-2">
              {guide.example.working.map((w, i) => (
                <li key={i} className="text-slate-300 text-sm">
                  {w}
                </li>
              ))}
            </ul>
            <p className="text-good font-bold">Answer: {guide.example.answer}</p>
          </div>
        )}

        {guide.watchOut && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/40 p-4">
            <h3 className="font-bold text-warn mb-1">⚠️ Watch out</h3>
            <p className="text-amber-100/90 text-sm leading-relaxed">{guide.watchOut}</p>
          </div>
        )}

        <button onClick={onClose} className="btn-primary w-full mt-5">
          Got it
        </button>
      </div>
    </div>
  )
}

/** Progressive hints — one at a time, so she gets the smallest nudge that works. */
export function HintList({ hints, shown }: { hints: string[]; shown: number }) {
  if (shown === 0) return null
  return (
    <div className="space-y-2 mt-3">
      {hints.slice(0, shown).map((h, i) => (
        <div key={i} className="rounded-xl bg-blue-500/10 border border-blue-500/40 p-3 flex gap-2.5">
          <span className="shrink-0">💡</span>
          <p className="text-blue-100 text-sm leading-relaxed">{h}</p>
        </div>
      ))}
    </div>
  )
}

/** The full solution. Only reachable on request or after a wrong answer. */
export function WorkedSolution({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/40 p-4 mt-3">
      <h3 className="font-bold text-good mb-2">How to do it</h3>
      <ol className="space-y-1.5">
        {steps.map((s, i) => (
          <li key={i} className="text-emerald-50 text-sm leading-relaxed">
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Small collapsible used on the skill list to preview a guide before starting. */
export function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="text-sm text-brand font-semibold">
        {open ? '− ' : '+ '}
        {title}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}
