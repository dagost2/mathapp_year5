import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Level } from '../curriculum/types'

export interface SkillProgress {
  attempted: number
  correct: number
  /** Correct answers in a row right now — drives the level ramp. */
  streak: number
  /** Best streak ever, kept for the badge on the skill card. */
  bestStreak: number
  /** How hard the next practice set starts. */
  level: Level
  lastPracticed: number | null
  /** Correct on the FIRST try, no hints used. The honest mastery signal. */
  cleanCorrect: number
}

export interface TestResult {
  date: number
  score: number
  total: number
  /** Per-strand correct/total, for the "what to work on" panel. */
  byStrand: Record<string, { correct: number; total: number }>
}

interface State {
  name: string
  progress: Record<string, SkillProgress>
  testResults: TestResult[]
  totalStars: number
  setName: (name: string) => void
  recordAnswer: (skillId: string, correct: boolean, usedHelp: boolean) => void
  recordTest: (result: TestResult) => void
  resetAll: () => void
}

const blank = (): SkillProgress => ({
  attempted: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  level: 1,
  lastPracticed: null,
  cleanCorrect: 0
})

export const useStore = create<State>()(
  persist(
    (set) => ({
      name: '',
      progress: {},
      testResults: [],
      totalStars: 0,

      setName: name => set({ name }),

      recordAnswer: (skillId, correct, usedHelp) =>
        set(state => {
          const p = { ...(state.progress[skillId] ?? blank()) }
          p.attempted += 1
          p.lastPracticed = Date.now()
          if (correct) {
            p.correct += 1
            p.streak += 1
            p.bestStreak = Math.max(p.bestStreak, p.streak)
            if (!usedHelp) p.cleanCorrect += 1
          } else {
            p.streak = 0
          }
          // Move up a level after 5 clean answers in a row; drop back if she
          // is struggling, so practice stays in the achievable zone.
          if (p.streak >= 5 && p.level < 3) {
            p.level = (p.level + 1) as Level
            p.streak = 0
          } else if (!correct && p.attempted >= 4 && p.correct / p.attempted < 0.4 && p.level > 1) {
            p.level = (p.level - 1) as Level
          }
          return {
            progress: { ...state.progress, [skillId]: p },
            totalStars: state.totalStars + (correct ? (usedHelp ? 1 : 2) : 0)
          }
        }),

      recordTest: result => set(state => ({ testResults: [result, ...state.testResults].slice(0, 20) })),

      resetAll: () => set({ progress: {}, testResults: [], totalStars: 0 })
    }),
    { name: 'year5-maths-progress' }
  )
)

/** 0–100. Needs 8 clean correct answers to read as mastered. */
export function masteryPercent(p?: SkillProgress): number {
  if (!p || p.attempted === 0) return 0
  const accuracy = p.correct / p.attempted
  const volume = Math.min(1, p.cleanCorrect / 8)
  return Math.round(accuracy * volume * 100)
}

export function masteryLabel(pct: number): { label: string; color: string } {
  if (pct >= 80) return { label: 'Mastered', color: 'text-good' }
  if (pct >= 50) return { label: 'Getting there', color: 'text-warn' }
  if (pct > 0) return { label: 'Started', color: 'text-slate-400' }
  return { label: 'Not started', color: 'text-slate-500' }
}
