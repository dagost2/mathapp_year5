import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildMockTest, SKILL_BY_ID, STRANDS } from '../curriculum'
import { QuestionCard } from '../components/QuestionCard'
import { useStore, TestResult } from '../store/useStore'

/** The real Year 5 NAPLAN numeracy test allows 50 minutes. */
const TIME_LIMIT_SECONDS = 50 * 60

type Phase = 'intro' | 'running' | 'finished'

export default function TestPage() {
  const { recordTest, recordAnswer } = useStore()
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [secondsLeft, setSecondsLeft] = useState(TIME_LIMIT_SECONDS)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => buildMockTest(), [round])

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          setPhase('finished')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  // Save the result once, on the transition into 'finished'.
  useEffect(() => {
    if (phase !== 'finished') return
    const byStrand: Record<string, { correct: number; total: number }> = {}
    answers.forEach((ok, i) => {
      const strandId = SKILL_BY_ID.get(questions[i]?.skillId ?? '')?.strandId
      if (!strandId) return
      byStrand[strandId] ??= { correct: 0, total: 0 }
      byStrand[strandId].total += 1
      if (ok) byStrand[strandId].correct += 1
    })
    const result: TestResult = {
      date: Date.now(),
      score: answers.filter(Boolean).length,
      total: questions.length,
      byStrand
    }
    recordTest(result)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const start = () => {
    setRound(r => r + 1)
    setIndex(0)
    setAnswers([])
    setSecondsLeft(TIME_LIMIT_SECONDS)
    setPhase('running')
  }

  const handleNext = (correct: boolean) => {
    const q = questions[index]
    // Test answers still feed skill mastery, flagged as unaided.
    recordAnswer(q.skillId, correct, false)
    const next = [...answers, correct]
    setAnswers(next)
    if (index + 1 >= questions.length) setPhase('finished')
    else setIndex(i => i + 1)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  if (phase === 'intro') {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold">Mock NAPLAN test 📝</h1>
        <div className="card p-5 space-y-3">
          <p className="text-slate-300 leading-relaxed">
            This works like the real Year 5 numeracy test:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li>• 40 questions from every topic</li>
            <li>• 50 minutes on the clock</li>
            <li>• No hints and no second tries</li>
            <li>• You find out how you did at the end</li>
          </ul>
          <p className="text-sm text-slate-500">
            Tip: if a question is hard, pick your best answer and move on. You can always come back to that topic
            afterwards.
          </p>
        </div>
        <button onClick={start} className="btn-primary w-full py-4 text-lg">
          Start the test
        </button>
        <Link to="/" className="btn-ghost w-full py-3 block text-center">
          Not now
        </Link>
      </div>
    )
  }

  if (phase === 'finished') {
    const score = answers.filter(Boolean).length
    const pct = Math.round((score / questions.length) * 100)
    const byStrand: Record<string, { correct: number; total: number }> = {}
    answers.forEach((ok, i) => {
      const strandId = SKILL_BY_ID.get(questions[i]?.skillId ?? '')?.strandId
      if (!strandId) return
      byStrand[strandId] ??= { correct: 0, total: 0 }
      byStrand[strandId].total += 1
      if (ok) byStrand[strandId].correct += 1
    })
    const weakest = STRANDS.map(s => ({ s, d: byStrand[s.id] }))
      .filter(x => x.d && x.d.total > 0)
      .sort((a, b) => a.d!.correct / a.d!.total - b.d!.correct / b.d!.total)[0]

    return (
      <div className="space-y-5">
        <div className="card p-6 text-center">
          <div className="text-5xl mb-3">{pct >= 75 ? '🎉' : pct >= 50 ? '💪' : '🌱'}</div>
          <h1 className="text-3xl font-extrabold">
            {score} / {questions.length}
          </h1>
          <p className="text-slate-400 mt-1">{pct}% correct</p>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-3">How you went in each topic</h2>
          <div className="space-y-3">
            {STRANDS.map(s => {
              const d = byStrand[s.id]
              if (!d) return null
              const p = Math.round((d.correct / d.total) * 100)
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">
                      {s.emoji} {s.title}
                    </span>
                    <span className="tabular-nums text-slate-400">
                      {d.correct}/{d.total}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={p >= 75 ? 'h-full bg-good' : p >= 50 ? 'h-full bg-warn' : 'h-full bg-red-500'}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {weakest && (
            <p className="text-sm text-slate-400 mt-4">
              Worth practising next: <span className="text-brand font-semibold">{weakest.s.title}</span>
            </p>
          )}
        </div>

        <button onClick={start} className="btn-primary w-full py-4 text-lg">
          Take another test
        </button>
        <Link to="/" className="btn-ghost w-full py-3 block text-center">
          Back to topics
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold">Mock test</h1>
        <span className={`font-bold tabular-nums ${secondsLeft < 300 ? 'text-red-400' : 'text-slate-300'}`}>
          ⏱ {mm}:{ss}
        </span>
      </div>
      <QuestionCard
        key={questions[index].id}
        question={questions[index]}
        onNext={handleNext}
        testMode
        index={index}
        total={questions.length}
      />
    </div>
  )
}
