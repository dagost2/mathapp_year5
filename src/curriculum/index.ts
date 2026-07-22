import { Skill, Strand, Level, Question, makeRng } from './types'
import { numberSkills } from './skills/number'
import { algebraSkills } from './skills/algebra'
import { measurementSkills } from './skills/measurement'
import { spaceSkills } from './skills/space'
import { statsSkills } from './skills/stats'

export const STRANDS: Strand[] = [
  { id: 'number', title: 'Number', blurb: 'Place value, operations, fractions, decimals & percentages', color: 'number', emoji: '🔢' },
  { id: 'algebra', title: 'Algebra', blurb: 'Patterns, missing numbers & multi-step problems', color: 'algebra', emoji: '🧩' },
  { id: 'measurement', title: 'Measurement', blurb: 'Length, area, volume, time, units & angles', color: 'measurement', emoji: '📏' },
  { id: 'space', title: 'Space', blurb: 'Shapes, symmetry, coordinates & transformations', color: 'space', emoji: '📐' },
  { id: 'stats', title: 'Statistics', blurb: 'Graphs, averages & chance', color: 'stats', emoji: '📊' }
]

export const SKILLS: Skill[] = [...numberSkills, ...algebraSkills, ...measurementSkills, ...spaceSkills, ...statsSkills]

export const SKILL_BY_ID = new Map(SKILLS.map(s => [s.id, s]))

export function skillsInStrand(strandId: string): Skill[] {
  return SKILLS.filter(s => s.strandId === strandId)
}

/** Generates a fresh question for a skill at a level, seeded off the clock. */
export function makeQuestion(skillId: string, level: Level, seed?: number): Question | null {
  const skill = SKILL_BY_ID.get(skillId)
  if (!skill) return null
  const s = seed ?? Math.floor(Math.random() * 1e9)
  return skill.generate(level, makeRng(s))
}

/**
 * Builds a practice set for one skill. Questions ramp up in difficulty across
 * the set so she starts on something achievable.
 */
export function buildPracticeSet(skillId: string, count: number, startLevel: Level): Question[] {
  const out: Question[] = []
  for (let i = 0; i < count; i++) {
    // Ramp: first third at startLevel, then step up, capped at 3.
    const bump = Math.floor(i / Math.max(1, Math.ceil(count / 3)))
    const level = Math.min(3, startLevel + bump) as Level
    const q = makeQuestion(skillId, level, Math.floor(Math.random() * 1e9))
    if (q) out.push({ ...q, id: `${skillId}-${i}-${q.id}` })
  }
  return out
}

/**
 * Builds a mock NAPLAN paper: 40 questions sampled across every strand, in
 * roughly the proportions ACARA uses for the Year 5 numeracy test.
 */
export function buildMockTest(): Question[] {
  const weights: Record<string, number> = { number: 16, algebra: 6, measurement: 8, space: 6, stats: 4 }
  const out: Question[] = []
  for (const strand of STRANDS) {
    const skills = skillsInStrand(strand.id)
    const n = weights[strand.id] ?? 4
    for (let i = 0; i < n; i++) {
      const skill = skills[Math.floor(Math.random() * skills.length)]
      const level = (1 + Math.floor(Math.random() * 3)) as Level
      const q = makeQuestion(skill.id, level)
      if (q) out.push({ ...q, id: `mock-${strand.id}-${i}-${q.id}` })
    }
  }
  // Shuffle so strands are interleaved like a real paper.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export * from './types'
