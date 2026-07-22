/**
 * Core content model.
 *
 * Questions are *generated*, not stored, so practice never runs out and a
 * repeated skill never shows the same numbers twice in a row. Every generator
 * is a pure function of a seeded RNG, so any question can be replayed exactly
 * (used by "review your mistakes").
 */

export type StrandId = 'number' | 'algebra' | 'measurement' | 'space' | 'stats'

export type Level = 1 | 2 | 3

/** Diagram attached to a question. Rendered by src/components/Visual.tsx. */
export type Visual =
  | { kind: 'fractionBar'; parts: number; shaded: number; label?: string }
  | { kind: 'fractionBarPair'; a: [number, number]; b: [number, number] }
  | { kind: 'numberLine'; min: number; max: number; step: number; mark?: number; showMark: boolean }
  | { kind: 'grid'; rows: number; cols: number; unit?: string; shaded?: number }
  | { kind: 'barChart'; title: string; data: { label: string; value: number }[] }
  | { kind: 'angle'; degrees: number }
  | { kind: 'spinner'; segments: { label: string; color: string }[] }
  | { kind: 'shape'; sides: number; label?: string }
  | { kind: 'coordGrid'; size: number; points: { x: number; y: number; label: string }[] }
  | { kind: 'clock'; hour: number; minute: number }

export type InputMode = 'choice' | 'number'

export interface Question {
  /** Stable within a session; used as a React key and for mistake replay. */
  id: string
  skillId: string
  level: Level
  prompt: string
  visual?: Visual
  /** Canonical answer, compared as a trimmed string. */
  answer: string
  /** Present only when inputMode === 'choice'. */
  choices?: string[]
  inputMode: InputMode
  /** Shown after the numeric input, e.g. "cm" or "$". */
  unit?: string
  /** Progressive nudges — revealed one at a time, never the answer. */
  hints: string[]
  /** Full worked solution, one step per line. Shown on request or after a miss. */
  worked: string[]
}

/** The "how does this work?" explainer, always available from a question. */
export interface Guide {
  summary: string
  steps: string[]
  example?: { question: string; working: string[]; answer: string }
  watchOut?: string
}

export interface Skill {
  id: string
  strandId: StrandId
  title: string
  blurb: string
  guide: Guide
  generate: (level: Level, rng: Rng) => Question
}

export interface Strand {
  id: StrandId
  title: string
  blurb: string
  /** Tailwind colour token, see tailwind.config.js */
  color: string
  emoji: string
}

/** Seeded RNG so questions are reproducible from their id. */
export interface Rng {
  int: (min: number, max: number) => number
  pick: <T>(items: T[]) => T
  shuffle: <T>(items: T[]) => T[]
  bool: () => boolean
  seed: number
}

export function makeRng(seed: number): Rng {
  let s = seed >>> 0
  const next = () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  const pick = <T,>(items: T[]) => items[int(0, items.length - 1)]
  const shuffle = <T,>(items: T[]) => {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }
  return { int, pick, shuffle, bool: () => next() < 0.5, seed }
}

/**
 * Builds a 4-option multiple choice list from the correct answer plus
 * plausible distractors, de-duplicated and shuffled.
 */
export function choicesFrom(correct: string | number, distractors: (string | number)[], rng: Rng): string[] {
  const seen = new Set<string>([String(correct)])
  const out: string[] = [String(correct)]
  for (const d of distractors) {
    const s = String(d)
    if (!seen.has(s) && out.length < 4) {
      seen.add(s)
      out.push(s)
    }
  }
  return rng.shuffle(out)
}

/** Formats a number the way a Year 5 student writes it (no trailing zeros). */
export function fmt(n: number): string {
  return Number(n.toFixed(4)).toString()
}

/** Thousands separators, e.g. 24500 -> "24 500" (Australian convention). */
export function grouped(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}
