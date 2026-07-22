import { Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import TestPage from './pages/TestPage'
import ProgressPage from './pages/ProgressPage'

const TABS = [
  { to: '/', label: 'Learn', icon: '🏠' },
  { to: '/test', label: 'Mock test', icon: '📝' },
  { to: '/progress', label: 'Progress', icon: '⭐' }
]

export default function App() {
  return (
    <div className="min-h-full flex flex-col max-w-2xl mx-auto">
      <main className="flex-1 px-4 pt-5 pb-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice/:skillId" element={<PracticePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-slate2/95 backdrop-blur border-t border-slate-700 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                [
                  'flex-1 py-3 text-center text-xs font-semibold transition',
                  isActive ? 'text-brand' : 'text-slate-400'
                ].join(' ')
              }
            >
              <div className="text-xl leading-none mb-1">{t.icon}</div>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
