import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BriefcaseBusiness, Code2, FolderKanban, Megaphone, Search } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PromptCard } from './PromptCard.jsx'

const professionMarks = {
  'software-engineering': Code2,
  marketing: Megaphone,
  'data-science': BarChart3,
  'product-management': BriefcaseBusiness,
  'project-management': FolderKanban,
}

export function ProfessionIndex({ professions, prompts }) {
  return (
    <div className="page-enter">
      <div className="breadcrumb"><Link to="/">Overview</Link><span className="breadcrumb-separator">/</span><span>Disciplines</span></div>
      <div className="page-heading-row">
        <div><div className="eyebrow eyebrow-accent">THE FIELD INDEX / 01—05</div><h1>Find your field.</h1><p className="page-intro">Prompts gathered around the kinds of decisions, craft, and collaboration that shape a working day.</p></div>
        <span className="heading-count"><strong>{String(professions.length).padStart(2, '0')}</strong> disciplines <span>·</span> {String(prompts.length).padStart(2, '0')} prompts</span>
      </div>
      <div className="profession-index-list">
        {professions.map((profession, index) => {
          const Icon = professionMarks[profession.slug] || BriefcaseBusiness
          return <Link className="profession-index-row" to={`/professions/${profession.slug}`} key={profession.slug}>
            <span className="profession-index-number">{String(index + 1).padStart(2, '0')}</span>
            <Icon className="profession-index-icon" size={21} strokeWidth={1.5} aria-hidden="true" />
            <span className="profession-index-copy"><strong>{profession.name}</strong><p>{profession.description}</p></span>
            <span className="profession-index-count"><strong>{String(profession.prompts.length).padStart(2, '0')}</strong> prompts</span>
            <ArrowUpRight size={17} aria-hidden="true" />
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
      <div className="breadcrumb"><Link to="/">Overview</Link><span className="breadcrumb-separator">/</span><Link to="/professions">Disciplines</Link><span className="breadcrumb-separator">/</span><span>{profession.name}</span></div>
      <section className="profession-hero">
        <div className="profession-hero-icon"><Icon size={22} strokeWidth={1.6} /></div>
        <div className="profession-hero-copy"><div className="eyebrow eyebrow-accent">FIELD COLLECTION / {String(professions.indexOf(profession) + 1).padStart(2, '0')}</div><h1>{profession.name}</h1><p>{profession.description}</p></div>
        <div className="profession-hero-count"><strong>{String(profession.prompts.length).padStart(2, '0')}</strong><span>prompts</span></div>
      </section>
      <div className="collection-tools">
        <div className="collection-search"><Search size={15} aria-hidden="true" /><label className="sr-only" htmlFor="profession-search">Search this collection</label><input id="profession-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search within this field..." /></div>
        <div className="tag-filters" role="group" aria-label="Filter by prompt tag"><button aria-pressed={!selectedTag} className={`filter-chip ${!selectedTag ? 'filter-chip-active' : ''}`} onClick={() => setSelectedTag('')}>All prompts <span>{profession.prompts.length}</span></button>{tags.map((tag) => <button key={tag} aria-pressed={selectedTag === tag} className={`filter-chip ${selectedTag === tag ? 'filter-chip-active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}>{tag}</button>)}</div>
      </div>
      <div className="collection-results-line"><span>{String(filteredPrompts.length).padStart(2, '0')} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}</span><span>Recently updated</span></div>
      {filteredPrompts.length ? <div className="prompt-card-grid">{filteredPrompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={18} /></span><h2>No prompts found</h2><p>Try another phrase or clear the field filter.</p><button className="button button-secondary" onClick={() => { setQuery(''); setSelectedTag('') }}>Clear filters</button></div>}
      <Link className="back-link" to="/professions"><ArrowLeft size={14} /> Back to the field index</Link>
    </div>
  )
}

export function NotFound() {
  return <div className="empty-state not-found-state"><span className="not-found-code">FIELD NOTE / 404</span><h1>That page isn&apos;t in this library.</h1><p>The link may be out of date, or the prompt has moved.</p><Link className="button button-primary" to="/">Return to the overview <ArrowRight size={14} /></Link></div>
}
