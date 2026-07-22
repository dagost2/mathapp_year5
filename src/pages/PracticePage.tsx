import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { SKILL_BY_ID, buildPracticeSet } from '../curriculum'
import { QuestionCard } from '../components/QuestionCard'
import { GuideModal } from '../components/Help'
import { useStore } from '../store/useStore'

const SET_SIZE = 10

export default function PracticePage() {
  const { skillId = '' } = useParams()
  const navigate = useNavigate()
  const { progress, recordAnswer } = useStore()
  const skill = SKILL_BY_ID.get(skillId)
  const startLevel = progress[skillId]?.level ?? 1

  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [clean, setClean] = useState(0)
  const [showGuide, setShowGuide] = useState(false)
  const [done, setDone] = useState(false)

  // `round` in the deps deliberately regenerates a whole new set on "Practise again".
  const questions = useMemo(
    () => (skill ? buildPracticeSet(skill.id, SET_SIZE, startLevel) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skill?.id, round]
  )

  if (!skill) {
    return (
      <div className="card p-6 text-center">
        <p className="mb-4">That topic could not be found.</p>
        <Link to="/" className="btn-primary inline-block">
          Back to topics
        </Link>
      </div>
    )
  }

  const handleNext = (correct: boolean, usedHelp: boolean) => {
    recordAnswer(skill.id, correct, usedHelp)
    if (correct) setScore(s => s + 1)
    if (correct && !usedHelp) setClean(c => c + 1)
    if (index + 1 >= questions.length) setDone(true)
    else setIndex(i => i + 1)
  }

  const restart = () => {
    setRound(r => r + 1)
    setIndex(0)
    setScore(0)
    setClean(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="space-y-5">
        <div className="card p-6 text-center">
          <div className="text-5xl mb-3">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '🌱'}</div>
          <h1 className="text-2xl font-extrabold mb-1">
            {score} out of {questions.length}
          </h1>
          <p className="text-slate-400 mb-4">
            {pct >= 80
              ? 'Brilliant work — you have really got this.'
              : pct >= 50
                ? 'Good effort! A bit more practice and this will click.'
                : 'This one is tricky. Read the guide, then try again — you will improve.'}
          </p>
          {clean > 0 && <p className="text-sm text-good font-semibold">🌟 {clean} answered with no help at all</p>}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button onClick={restart} className="btn-primary w-full py-4 text-lg">
            Practise again
          </button>
          <button onClick={() => setShowGuide(true)} className="btn-ghost w-full py-3">
            📚 Read the guide for {skill.title.toLowerCase()}
          </button>
          <button onClick={() => navigate('/')} className="btn-ghost w-full py-3">
            Choose another topic
          </button>
        </div>

        {showGuide && <GuideModal title={skill.title} guide={skill.guide} onClose={() => setShowGuide(false)} />}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="btn-ghost px-3 py-2" aria-label="Back">
          ←
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg truncate">{skill.title}</h1>
          <p className="text-xs text-slate-500 truncate">Level {startLevel} · {skill.blurb}</p>
        </div>
      </div>

      <QuestionCard
        key={questions[index].id}
        question={questions[index]}
        onNext={handleNext}
        index={index}
        total={questions.length}
      />
    </div>
  )
}
