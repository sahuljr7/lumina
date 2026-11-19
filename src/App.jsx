import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { getCatalog } from './data/catalog.js'
import { AppLayout } from './components/AppLayout.jsx'
import { Dashboard } from './components/Dashboard.jsx'
import { ProfessionIndex, ProfessionPage, NotFound } from './components/ProfessionPages.jsx'
import { SearchPage } from './components/SearchPage.jsx'
import { CustomPromptBuilder } from './components/CustomPromptBuilder.jsx'
const PromptWorkspace = lazy(() => import('./components/PromptWorkspace.jsx').then((module) => ({ default: module.PromptWorkspace })))

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem('prompt-library-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  } catch {
    // Use the system theme when browser storage is unavailable.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const catalog = useMemo(() => getCatalog(), [])
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) themeColor.content = theme === 'dark' ? '#0f1210' : '#fafaf8'
  }, [theme])

  useEffect(() => {
    const hasSavedTheme = () => {
      try {
        const savedTheme = localStorage.getItem('prompt-library-theme')
        return savedTheme === 'light' || savedTheme === 'dark'
      } catch {
        return false
      }
    }
    if (hasSavedTheme()) return undefined

    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = (event) => {
      if (!hasSavedTheme()) setTheme(event.matches ? 'dark' : 'light')
    }
    preference.addEventListener('change', syncSystemTheme)
    return () => preference.removeEventListener('change', syncSystemTheme)
  }, [])

  const changeTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
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
        <Route path="/custom-prompt-builder" element={<CustomPromptBuilder />} />
        <Route path="/professions" element={<ProfessionIndex {...catalog} />} />
        <Route path="/professions/:professionSlug" element={<ProfessionPage {...catalog} />} />
        <Route path="/prompts/:professionSlug/:promptSlug" element={<Suspense fallback={<div className="empty-state"><p>Opening the working document…</p></div>}><PromptWorkspace {...catalog} /></Suspense>} />
        <Route path="/search" element={<SearchPage {...catalog} />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppLayout>
  )
}
