import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, BookOpen, ChevronDown, Command, Compass, FileText, FolderOpen, Menu, Moon, Search, Sun, X } from 'lucide-react'

export function AppLayout({ professions, prompts, theme, onToggleTheme, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const searchInputRef = useRef(null)
  const isPromptPage = location.pathname.startsWith('/prompts/')

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
    <div className={`app-frame ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <Link to="/" className="brand-lockup" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark"><Command size={18} strokeWidth={2.4} /></span>
          <span className="brand-name">prompt<span>library</span></span>
          <span className="brand-version">BETA</span>
        </Link>
        <button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button>

        <div className="sidebar-scroll">
          <div className="sidebar-group">
            <p className="sidebar-label">Workspace</p>
            <NavLink to="/" end className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <BookOpen size={17} /><span>Overview</span>
            </NavLink>
            <NavLink to="/professions" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Compass size={17} /><span>All professions</span><span className="side-count">{professions.length}</span>
            </NavLink>
          </div>

          <div className="sidebar-group profession-nav-group">
            <div className="sidebar-label-row"><p className="sidebar-label">Your library</p><button className="sidebar-collapse icon-button" aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)}><ChevronDown size={14} /></button></div>
            <div className="profession-nav-list">
              {professions.map((profession) => (
                <NavLink key={profession.slug} to={`/professions/${profession.slug}`} className={({ isActive }) => `side-link profession-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)} title={profession.name}>
                  <span className="profession-dot" aria-hidden="true" />
                  <span className="profession-link-name">{profession.name}</span>
                  <span className="side-count">{profession.prompts.length}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="sidebar-note">
            <div className="sidebar-note-icon"><FolderOpen size={16} /></div>
            <strong>Built to grow</strong>
            <p>Add a Markdown file and it&apos;s in your library.</p>
            <Link to="/professions" onClick={() => setMobileOpen(false)}>Explore library <ArrowUpRight size={13} /></Link>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="library-total"><FileText size={15} /><span>{prompts.length} prompts in library</span></div>
          <div className="profile-row">
            <span className="profile-avatar">PL</span><span className="profile-meta"><strong>My workspace</strong><small>Personal library</small></span>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
          <SearchBox key={location.pathname} inputRef={searchInputRef} />
          <div className="topbar-actions">
            {isPromptPage && <span className="saved-status"><span /> Live preview active</span>}
            <button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={onToggleTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <span className="topbar-avatar">PL</span>
          </div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="app-footer"><span>Made for the work behind the words.</span><span><kbd>⌘</kbd> <kbd>K</kbd> Search your library</span></footer>
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
      <Search size={17} aria-hidden="true" />
      <label className="sr-only" htmlFor="global-search-input">Search prompts, tags, and professions</label>
      <input id="global-search-input" ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search prompts, tags, and professions..." />
      <button className="search-shortcut" type="submit">⌘ K</button>
    </form>
  )
}
