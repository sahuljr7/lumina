import { lazy, Suspense, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { getCatalog } from './data/catalog.js'
import { AppLayout } from './components/AppLayout.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { ProfessionIndex, ProfessionPage, NotFound } from './components/ProfessionPages.jsx'
import { SearchPage } from './components/SearchPage.jsx'
const PromptWorkspace = lazy(() => import('./components/PromptWorkspace.jsx').then((module) => ({ default: module.PromptWorkspace })))

export default function App() {
  const catalog = useMemo(() => getCatalog(), [])
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('prompt-library-theme') || 'light'
    } catch {
      return 'light'
    }
  })

  const changeTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    try {
      localStorage.setItem('prompt-library-theme', nextTheme)
    } catch {
      // Keep the current session usable when storage is unavailable.
    }
  }

  return (
    <AppLayout {...catalog} theme={theme} onToggleTheme={changeTheme}>
      <Routes>
        <Route path="/" element={<Dashboard {...catalog} />} />
        <Route path="/professions" element={<ProfessionIndex {...catalog} />} />
        <Route path="/professions/:professionSlug" element={<ProfessionPage {...catalog} />} />
        <Route path="/prompts/:professionSlug/:promptSlug" element={<Suspense fallback={<div className="empty-state"><p>Loading prompt workspace…</p></div>}><PromptWorkspace {...catalog} /></Suspense>} />
        <Route path="/search" element={<SearchPage {...catalog} />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppLayout>
  )
}
