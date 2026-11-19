import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BookOpenText, ChevronsLeft, LayoutGrid, Menu, Moon, PenLine, Search, Sun, X } from 'lucide-react'

const navClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`

export function AppLayout({ professions, prompts, theme, onToggleTheme, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const searchInputRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const focusSearch = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  return (
    <div className={`app-frame ${collapsed ? 'is-collapsed' : ''}`}>
      {mobileOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside id="primary-navigation" className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="brand" onClick={() => setMobileOpen(false)} aria-label="Prompt Library home">
            <span className="brand-mark"><BookOpenText size={17} /></span>
            <span className="brand-name">Prompt Library</span>
          </Link>
          <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <NavLink to="/" end className={navClass} onClick={() => setMobileOpen(false)}>
            <BookOpenText size={17} /><span>Overview</span>
          </NavLink>
          <NavLink
            to="/professions"
            className={({ isActive }) => `nav-link ${isActive && location.pathname === '/professions' ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <LayoutGrid size={17} /><span>Disciplines</span><span className="nav-count">{professions.length}</span>
          </NavLink>
          <NavLink to="/custom-prompt-builder" className={navClass} onClick={() => setMobileOpen(false)}>
            <PenLine size={17} /><span>Custom builder</span>
          </NavLink>
        </nav>

        <div className="sidebar-section">
          <p className="sidebar-label">Disciplines</p>
          <div className="sidebar-list">
            {professions.map((profession) => (
              <NavLink
                key={profession.slug}
                to={`/professions/${profession.slug}`}
                className={navClass}
                onClick={() => setMobileOpen(false)}
                title={profession.name}
              >
                <span>{profession.name}</span>
                <span className="nav-count">{profession.prompts.length}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="collapse-button" aria-label="Toggle compact navigation" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
            <ChevronsLeft size={15} /><span>{collapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-controls="primary-navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={18} />
          </button>
          <SearchBox key={location.pathname} inputRef={searchInputRef} />
          <div className="topbar-actions">
            <button
              className="icon-button"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onClick={onToggleTheme}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="app-footer">
          <span>{prompts.length} prompts across {professions.length} disciplines</span>
          <span><kbd>⌘</kbd><kbd>K</kbd> to search</span>
        </footer>
      </div>
    </div>
  )
}

function SearchBox({ inputRef }) {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const submit = (event) => {
    event.preventDefault()
    navigate(`/search?q=${encodeURIComponent(value.trim())}`)
  }

  const submitOnEnter = (event) => {
    if (event.key !== 'Enter') return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    submit(event)
  }

  return (
    <form className="global-search" role="search" onSubmit={submit} onKeyDown={submitOnEnter}>
      <Search size={16} aria-hidden="true" />
      <label className="sr-only" htmlFor="global-search-input">Search prompts, tags, and disciplines</label>
      <input id="global-search-input" ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search prompts…" />
      <button className="search-hint" type="submit" aria-label="Search">⌘K</button>
    </form>
  )
}
