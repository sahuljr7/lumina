import { useMemo } from 'react'
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PromptCard } from './PromptCard.jsx'
import { getAllTags, searchPrompts } from '../utils/prompts.js'

export function SearchPage({ prompts, professions }) {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const professionFilter = params.get('profession') || ''
  const tagFilter = params.get('tag') || ''
  const recentOnly = params.get('recent') === 'true'
  const featuredOnly = params.get('featured') === 'true'
  const tags = useMemo(() => getAllTags(prompts), [prompts])
  const results = useMemo(() => searchPrompts(prompts, query, professionFilter, tagFilter, recentOnly).filter((prompt) => !featuredOnly || prompt.featured), [prompts, query, professionFilter, tagFilter, recentOnly, featuredOnly])
  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }
  const clearFilters = () => setParams(query ? { q: query } : {})

  return (
    <div className="page-enter">
      <div className="breadcrumb"><Link to="/">Overview</Link><span className="breadcrumb-separator">/</span><span>Search the index</span></div>
      <div className="search-heading"><div className="eyebrow eyebrow-accent">LOOK CLOSER / FIND A STARTING POINT</div><h1>{recentOnly ? 'Fresh from the stack.' : featuredOnly ? 'Editor’s shelf.' : query ? <>Results for <em>&ldquo;{query}&rdquo;</em></> : 'What are you working on?'}</h1><p className="page-intro">Search the prompt text itself, or narrow the index by discipline and tags.</p></div>
      <div className="search-page-box"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="search-page-input">Search all prompts</label><input id="search-page-input" value={query} onChange={(event) => update('q', event.target.value)} placeholder="Try “launch plan” or “research”" /><span>{String(results.length).padStart(2, '0')} FOUND</span></div>
      <div className="search-filter-row">
        <div className="filter-label"><SlidersHorizontal size={14} /> Refine the index</div>
        <label className="select-wrap"><span className="sr-only">Filter by discipline</span><select value={professionFilter} onChange={(event) => update('profession', event.target.value)}><option value="">All disciplines</option>{professions.map((profession) => <option key={profession.slug} value={profession.slug}>{profession.name}</option>)}</select></label>
        <label className="select-wrap"><span className="sr-only">Filter by tag</span><select value={tagFilter} onChange={(event) => update('tag', event.target.value)}><option value="">All tags</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label>
        <button aria-pressed={recentOnly} className={`filter-chip recent-filter ${recentOnly ? 'filter-chip-active' : ''}`} onClick={() => update('recent', recentOnly ? '' : 'true')}><Sparkles size={12} /> Recent</button>
        <button aria-pressed={featuredOnly} className={`filter-chip recent-filter ${featuredOnly ? 'filter-chip-active' : ''}`} onClick={() => update('featured', featuredOnly ? '' : 'true')}><Sparkles size={12} /> Curated</button>
        {(professionFilter || tagFilter || recentOnly || featuredOnly) && <button className="clear-filters" onClick={clearFilters}>Clear filters</button>}
      </div>
      <div className="collection-results-line"><span>{String(results.length).padStart(2, '0')} {results.length === 1 ? 'result' : 'results'}</span><span>Across {professions.length} disciplines</span></div>
      {results.length ? <div className="prompt-card-grid search-results">{results.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} showProfession />)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={18} /></span><h2>No matches in the index</h2><p>Try a broader search or remove a filter to see more of the library.</p><button className="button button-secondary" onClick={clearFilters}>Clear filters <ArrowRight size={13} /></button></div>}
    </div>
  )
}
