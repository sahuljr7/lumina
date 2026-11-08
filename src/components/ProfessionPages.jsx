import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, Code2, FolderKanban, Search, SlidersHorizontal } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PromptCard } from './PromptCard.jsx'

const professionMarks = {
  'software-engineering': Code2,
  marketing: ArrowUpRight,
  'data-science': SlidersHorizontal,
  'product-management': BriefcaseBusiness,
  'project-management': FolderKanban,
}

export function ProfessionIndex({ professions, prompts }) {
  return (
    <div className="page-enter">
      <div className="breadcrumb"><Link to="/">Overview</Link><span>/</span><span>Professions</span></div>
      <div className="page-heading-row"><div><div className="eyebrow">THE LIBRARY</div><h1>All professions</h1><p className="page-intro">A growing collection of focused prompts for the work you do every day.</p></div><span className="heading-count">{professions.length} fields <span>·</span> {prompts.length} prompts</span></div>
      <div className="profession-grid profession-grid-large">
        {professions.map((profession, index) => {
          const Icon = professionMarks[profession.slug] || BriefcaseBusiness
          return <Link className={`profession-card profession-color-${index % 5}`} to={`/professions/${profession.slug}`} key={profession.slug}>
            <span className="profession-card-icon"><Icon size={20} strokeWidth={1.8} /></span><span className="profession-count">{profession.prompts.length} prompts</span><strong>{profession.name}</strong><p>{profession.description}</p><span className="profession-card-arrow"><ArrowUpRight size={16} /></span>
          </Link>
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
    <div className="page-enter">
      <div className="breadcrumb"><Link to="/">Overview</Link><span>/</span><Link to="/professions">Professions</Link><span>/</span><span>{profession.name}</span></div>
      <section className="profession-hero">
        <div className="profession-hero-icon"><Icon size={23} /></div>
        <div className="profession-hero-copy"><div className="eyebrow">PROFESSION COLLECTION</div><h1>{profession.name}</h1><p>{profession.description}</p></div>
        <div className="profession-hero-count"><strong>{profession.prompts.length}</strong><span>prompts</span></div>
      </section>
      <div className="collection-tools">
        <div className="collection-search"><Search size={16} /><label className="sr-only" htmlFor="profession-search">Search this collection</label><input id="profession-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a prompt in this collection..." /></div>
        <div className="tag-filters"><button className={`filter-chip ${!selectedTag ? 'filter-chip-active' : ''}`} onClick={() => setSelectedTag('')}>All prompts <span>{profession.prompts.length}</span></button>{tags.map((tag) => <button key={tag} className={`filter-chip ${selectedTag === tag ? 'filter-chip-active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}>{tag}</button>)}</div>
      </div>
      <div className="collection-results-line"><span>{filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}</span><span>Sorted by recently updated</span></div>
      {filteredPrompts.length ? <div className="prompt-card-grid">{filteredPrompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={20} /></span><h2>No prompts found</h2><p>Try a different keyword or clear the tag filter.</p><button className="button button-secondary" onClick={() => { setQuery(''); setSelectedTag('') }}>Clear filters</button></div>}
      <Link className="back-link" to="/professions"><ArrowLeft size={15} /> Back to all professions</Link>
    </div>
  )
}

export function NotFound() {
  return <div className="empty-state not-found-state"><span className="not-found-code">404</span><h1>That page isn&apos;t in this library.</h1><p>The link may be out of date, or the prompt has moved.</p><Link className="button button-primary" to="/">Return to overview <ArrowRight size={15} /></Link></div>
}
