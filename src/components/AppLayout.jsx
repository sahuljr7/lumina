import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpenText, ChevronDown, Command, FileText, Menu, Moon, Search, Sun, X } from 'lucide-react'

export function AppLayout({ professions, prompts, theme, onToggleTheme, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const searchInputRef = useRef(null)
  const isPromptPage = location.pathname.startsWith('/prompts/')

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
    <div className={`app-frame ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside id="primary-navigation" className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <Link to="/" className="brand-lockup" onClick={() => setMobileOpen(false)} aria-label="Prompt Library home">
          <span className="brand-mark"><BookOpenText size={18} strokeWidth={1.7} /></span>
          <span className="brand-name">prompt<span>library</span></span>
          <span className="brand-version">FIELD GUIDE / 01</span>
        </Link>

        <button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        <div className="sidebar-scroll">
          <nav aria-label="Primary navigation">
            <div className="sidebar-group">
              <p className="sidebar-label">Start here <span>01</span></p>
              <div className="sidebar-nav">
                <NavLink to="/" end className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  <BookOpenText size={16} /><span>Overview</span><span className="side-count">01</span>
                </NavLink>
                <NavLink to="/professions" className={({ isActive }) => `side-link ${isActive && location.pathname === '/professions' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  <Command size={16} /><span>All disciplines</span><span className="side-count">{String(professions.length).padStart(2, '0')}</span>
                </NavLink>
              </div>
            </div>

            <div className="sidebar-group profession-nav-group">
              <div className="sidebar-label-row"><p className="sidebar-label">The index <span>02</span></p><button className="sidebar-collapse icon-button" aria-label="Toggle compact navigation" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}><ChevronDown size={13} /></button></div>
              <div className="profession-nav-list">
                {professions.map((profession, index) => (
                  <NavLink key={profession.slug} to={`/professions/${profession.slug}`} className={({ isActive }) => `side-link profession-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)} title={profession.name}>
                    <span className="profession-link-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="profession-link-name">{profession.name}</span>
                    <span className="side-count">{String(profession.prompts.length).padStart(2, '0')}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          <div className="sidebar-note">
            <span className="sidebar-note-index">NOTE / 001</span>
            <strong>A living library.</strong>
            <p>Add a Markdown file to a discipline folder and it joins the index.</p>
            <Link to="/professions" onClick={() => setMobileOpen(false)}>Browse the index <ArrowRight size={13} /></Link>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="library-total"><FileText size={14} /><span>{String(prompts.length).padStart(2, '0')} templates / {String(professions.length).padStart(2, '0')} fields</span></div>
          <div className="profile-row"><span className="profile-avatar">PL</span><span className="profile-meta"><strong>Personal archive</strong><small>LOCAL MARKDOWN CATALOG</small></span></div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu icon-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-controls="primary-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}><Menu size={19} /></button>
            <SearchBox key={location.pathname} inputRef={searchInputRef} />
            <span className="topbar-edition">A field guide to better work</span>
          </div>
          <div className="topbar-actions">
            {isPromptPage && <span className="saved-status"><span /> Preview updates live</span>}
            <button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={onToggleTheme}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <span className="topbar-avatar" aria-label="Personal archive">PL</span>
          </div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="app-footer"><span>Made for the work behind the words.</span><span><kbd>⌘</kbd><kbd>K</kbd> Search the index</span></footer>
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
      <input id="global-search-input" ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search the library..." />
      <button className="search-shortcut" type="submit" aria-label="Search">⌘ K</button>
    </form>
  )
}
