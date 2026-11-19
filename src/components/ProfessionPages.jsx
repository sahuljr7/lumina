import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, BarChart3, BriefcaseBusiness, Code2, FolderKanban, Megaphone, Search, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PromptCard } from './PromptCard.jsx'

const professionMarks = {
  general: Sparkles,
  'software-engineering': Code2,
  marketing: Megaphone,
  'data-science': BarChart3,
  'product-management': BriefcaseBusiness,
  'project-management': FolderKanban,
}

export function ProfessionIndex({ professions, prompts }) {
  return (
    <div className="profession-index-page">
      <header className="page-header">
        <div className="page-header-copy">
          <h1>Disciplines</h1>
          <p className="page-intro">Prompts gathered around the kinds of decisions, craft, and collaboration that shape a working day.</p>
        </div>
        <span className="page-meta">{professions.length} disciplines · {prompts.length} prompts</span>
      </header>

      <div className="list">
        {professions.map((profession) => {
          const Icon = professionMarks[profession.slug] || BriefcaseBusiness
          return (
            <Link className="list-row" to={`/professions/${profession.slug}`} key={profession.slug}>
              <span className="list-icon"><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span>
              <span className="list-copy"><strong>{profession.name}</strong><span>{profession.description}</span></span>
              <span className="list-meta">{profession.prompts.length} {profession.prompts.length === 1 ? 'prompt' : 'prompts'}</span>
              <ArrowUpRight className="list-arrow" size={16} aria-hidden="true" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function ProfessionPage({ professions }) {
  const { professionSlug } = useParams()
  const profession = professions.find((item) => item.slug === professionSlug)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const tags = useMemo(() => [...new Set((profession?.prompts || []).flatMap((prompt) => prompt.tags))].sort(), [profession])
  const filteredPrompts = useMemo(() => (profession?.prompts || []).filter((prompt) => {
    const text = `${prompt.title} ${prompt.description} ${prompt.tags.join(' ')} ${prompt.content}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (!selectedTag || prompt.tags.includes(selectedTag))
  }), [profession, query, selectedTag])

  if (!profession) return <NotFound />

  const Icon = professionMarks[profession.slug] || BriefcaseBusiness
  return (
    <div className="profession-page">
      <Link className="back-link" to="/professions"><ArrowLeft size={14} aria-hidden="true" /> All disciplines</Link>

      <header className="page-header">
        <div className="page-header-copy with-icon">
          <span className="page-icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
          <div>
            <h1>{profession.name}</h1>
            <p className="page-intro">{profession.description}</p>
          </div>
        </div>
        <span className="page-meta">{profession.prompts.length} {profession.prompts.length === 1 ? 'prompt' : 'prompts'}</span>
      </header>

      <div className="collection-tools">
        <div className="search-field">
          <Search size={15} aria-hidden="true" />
          <label className="sr-only" htmlFor="profession-search">Search this collection</label>
          <input id="profession-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this discipline…" />
        </div>
        <div className="chip-row" role="group" aria-label="Filter by prompt tag">
          <button aria-pressed={!selectedTag} className={`chip ${!selectedTag ? 'chip-active' : ''}`} onClick={() => setSelectedTag('')}>All prompts</button>
          {tags.map((tag) => (
            <button key={tag} aria-pressed={selectedTag === tag} className={`chip ${selectedTag === tag ? 'chip-active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}>{tag}</button>
          ))}
        </div>
      </div>

      <p className="results-line">{filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}</p>

      {filteredPrompts.length
        ? <div className="prompt-grid">{filteredPrompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}</div>
        : <div className="empty-state">
            <span className="empty-icon"><Search size={18} /></span>
            <h2>No prompts found</h2>
            <p>Try another phrase or clear the field filter.</p>
            <button className="button button-secondary" onClick={() => { setQuery(''); setSelectedTag('') }}>Clear filters</button>
          </div>}
    </div>
  )
}

export function NotFound() {
  return (
    <div className="empty-state not-found-state">
      <h1>Page not found</h1>
      <p>The link may be out of date, or the prompt has moved.</p>
      <Link className="button button-primary" to="/">Back to overview</Link>
    </div>
  )
}
