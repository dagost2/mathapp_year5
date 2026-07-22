import { useEffect, useState } from 'react'
import { Question } from '../curriculum/types'
import { SKILL_BY_ID } from '../curriculum'
import { Visual } from './Visual'
import { Keypad } from './Keypad'
import { GuideModal, HintList, WorkedSolution } from './Help'

interface Props {
  question: Question
  /** Called once the child moves on. `usedHelp` gates the "clean" mastery count. */
  onNext: (correct: boolean, usedHelp: boolean) => void
  /** Test mode hides hints and feedback — it should feel like the real paper. */
  testMode?: boolean
  index: number
  total: number
}

/** Tolerant comparison: "2.5" matches "2.50", "$3" matches "3". */
function isCorrect(given: string, expected: string): boolean {
  const clean = (s: string) => s.trim().replace(/^\$/, '').replace(/\s+/g, ' ')
  const a = clean(given)
  const b = clean(expected)
  if (a.toLowerCase() === b.toLowerCase()) return true
  const na = Number(a)
  const nb = Number(b)
  return !Number.isNaN(na) && !Number.isNaN(nb) && Math.abs(na - nb) < 1e-9
}

export function QuestionCard({ question, onNext, testMode = false, index, total }: Props) {
  const [entry, setEntry] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintsShown, setHintsShown] = useState(0)
  const [showWorked, setShowWorked] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const skill = SKILL_BY_ID.get(question.skillId)

  // Reset every piece of per-question state when the question changes.
  useEffect(() => {
    setEntry('')
    setPicked(null)
    setResult(null)
    setAttempts(0)
    setHintsShown(0)
    setShowWorked(false)
  }, [question.id])

  const usedHelp = hintsShown > 0 || showWorked || attempts > 1

  const submit = (value: string) => {
    if (result === 'right') return
    // In a mock test we only record the answer — no marking, no second go.
    if (testMode) {
      setPicked(value)
      return
    }
    const right = isCorrect(value, question.answer)
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setResult(right ? 'right' : 'wrong')
    // Second miss: stop guessing and show her how it is done.
    if (!right && nextAttempts >= 2) setShowWorked(true)
  }

  const handleChoice = (choice: string) => {
    if (!testMode && result === 'right') return
    setPicked(choice)
    submit(choice)
  }

  const goNext = () => {
    if (testMode) {
      const given = question.inputMode === 'choice' ? (picked ?? '') : entry
      onNext(given !== '' && isCorrect(given, question.answer), false)
      return
    }
    onNext(result === 'right', usedHelp)
  }

  const answered = testMode ? (question.inputMode === 'choice' ? picked !== null : entry !== '') : result !== null

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-brand transition-all" style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <span className="text-sm text-slate-400 font-semibold tabular-nums">
          {index + 1}/{total}
        </span>
      </div>

      {/* Question */}
      <div className="card p-5">
        <p className="text-lg sm:text-xl font-semibold leading-relaxed whitespace-pre-line mb-4">{question.prompt}</p>
        {question.visual && (
          <div className="my-4">
            <Visual visual={question.visual} />
          </div>
        )}

        {/* Answer input */}
        {question.inputMode === 'choice' ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {question.choices?.map(c => {
              const isPicked = picked === c
              const reveal = result !== null && !testMode
              const correctOne = reveal && isCorrect(c, question.answer)
              return (
                <button
                  key={c}
                  onClick={() => handleChoice(c)}
                  disabled={result === 'right'}
                  className={[
                    'btn py-4 px-3 text-lg font-bold border-2',
                    correctOne
                      ? 'bg-good/20 border-good text-good'
                      : isPicked && result === 'wrong'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : isPicked
                          ? 'bg-brand/20 border-brand text-violet-200'
                          : 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/60'
                  ].join(' ')}
                >
                  {c}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              {question.unit === '$' && <span className="text-2xl font-bold text-slate-400">$</span>}
              <div
                className={[
                  'min-w-[7rem] text-center text-3xl font-bold tabular-nums px-4 py-3 rounded-xl border-2',
                  result === 'right'
                    ? 'border-good bg-good/10 text-good'
                    : result === 'wrong'
                      ? 'border-red-500 bg-red-500/10 text-red-300'
                      : 'border-slate-600 bg-slate-900/50'
                ].join(' ')}
              >
                {entry || <span className="text-slate-600">?</span>}
              </div>
              {question.unit && question.unit !== '$' && (
                <span className="text-xl font-semibold text-slate-400">{question.unit}</span>
              )}
            </div>
            <Keypad value={entry} onChange={setEntry} onSubmit={() => submit(entry)} disabled={result === 'right'} />
          </div>
        )}
      </div>

      {/* Feedback */}
      {!testMode && result === 'right' && (
        <div className="rounded-xl bg-good/15 border border-good/50 p-4 text-center">
          <p className="text-good font-bold text-lg">
            {attempts === 1 && !usedHelp ? '🌟 Nailed it, first go!' : '✅ Correct — well done!'}
          </p>
        </div>
      )}
      {!testMode && result === 'wrong' && attempts < 2 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/40 p-4">
          <p className="text-warn font-semibold">Not quite — have another go. Try a hint if you are stuck.</p>
        </div>
      )}
      {!testMode && result === 'wrong' && attempts >= 2 && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/40 p-4">
          <p className="text-red-300 font-semibold">
            The answer is <span className="font-bold">{question.answer}</span>. Have a read of the steps below — you will
            get the next one.
          </p>
        </div>
      )}

      {/* Help */}
      {!testMode && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHintsShown(h => Math.min(question.hints.length, h + 1))}
              disabled={hintsShown >= question.hints.length || result === 'right'}
              className="btn-ghost"
            >
              💡 {hintsShown === 0 ? 'Give me a hint' : 'Another hint'}
            </button>
            <button onClick={() => setShowWorked(true)} disabled={showWorked} className="btn-ghost">
              📝 Show me how
            </button>
            {skill && (
              <button onClick={() => setShowGuide(true)} className="btn-ghost">
                📚 How does this work?
              </button>
            )}
          </div>

          <HintList hints={question.hints} shown={hintsShown} />
          {showWorked && <WorkedSolution steps={question.worked} />}
        </>
      )}

      {/* Advance */}
      {answered && (
        <button onClick={goNext} className="btn-primary w-full text-lg py-4">
          {index + 1 === total ? 'Finish' : 'Next question →'}
        </button>
      )}

      {showGuide && skill && <GuideModal title={skill.title} guide={skill.guide} onClose={() => setShowGuide(false)} />}
    </div>
  )
}
