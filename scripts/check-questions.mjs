/**
 * Sanity check for every question generator.
 *
 * A wrong answer in a maths app is worse than no app, so this hammers each
 * generator hundreds of times and asserts the invariants that would make a
 * question unanswerable or unfair:
 *
 *   - the answer is present and not NaN/undefined
 *   - multiple-choice options actually contain the correct answer
 *   - there are no duplicate options
 *   - hints and worked solutions are non-empty and leak no "undefined"
 *
 * Run with:  npm run check
 */
import * as esbuild from 'esbuild'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// The curriculum is TypeScript, so bundle it to plain ESM before importing.
const outfile = join(mkdtempSync(join(tmpdir(), 'y5-')), 'curriculum.mjs')
await esbuild.build({
  entryPoints: ['src/curriculum/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  logLevel: 'error'
})

const { SKILLS, makeQuestion } = await import(pathToFileURL(outfile).href)

const RUNS = 300
let failures = 0
const report = []

for (const skill of SKILLS) {
  const problems = new Set()
  for (let i = 0; i < RUNS; i++) {
    const level = ((i % 3) + 1)
    let q
    try {
      q = makeQuestion(skill.id, level, i * 7919 + 13)
    } catch (err) {
      problems.add(`threw: ${err.message}`)
      continue
    }
    if (!q) {
      problems.add('generator returned null')
      continue
    }

    const text = JSON.stringify(q)
    if (text.includes('undefined') || text.includes('NaN')) problems.add('contains undefined/NaN')
    if (q.answer === undefined || q.answer === null || String(q.answer).trim() === '') problems.add('empty answer')
    if (!q.prompt || q.prompt.trim() === '') problems.add('empty prompt')
    if (!q.hints?.length) problems.add('no hints')
    if (!q.worked?.length) problems.add('no worked solution')

    if (q.inputMode === 'choice') {
      if (!q.choices?.length) {
        problems.add('choice question with no choices')
      } else {
        if (!q.choices.includes(q.answer)) problems.add(`answer "${q.answer}" missing from choices [${q.choices}]`)
        if (new Set(q.choices).size !== q.choices.length) problems.add('duplicate choices')
        if (q.choices.length < 3) problems.add(`only ${q.choices.length} choices`)
      }
    } else if (Number.isNaN(Number(q.answer))) {
      problems.add(`numeric question with non-numeric answer "${q.answer}"`)
    }
  }

  if (problems.size) {
    failures++
    report.push(`❌ ${skill.id}\n   - ${[...problems].join('\n   - ')}`)
  } else {
    report.push(`✅ ${skill.id}`)
  }
}

console.log(report.join('\n'))
console.log(`\n${SKILLS.length - failures}/${SKILLS.length} generators clean (${RUNS} runs each)`)
process.exit(failures ? 1 : 0)
