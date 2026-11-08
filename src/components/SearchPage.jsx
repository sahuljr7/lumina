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
  const tags = useMemo(() => [...new Set(prompts.flatMap((prompt) => prompt.tags))].sort(), [prompts])
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
      <div className="breadcrumb"><Link to="/">Overview</Link><span>/</span><span>Search</span></div>
      <div className="search-heading"><div className="eyebrow">SEARCH THE LIBRARY</div><h1>{recentOnly ? 'Recently updated' : featuredOnly ? 'Featured prompts' : query ? <>Results for <em>&ldquo;{query}&rdquo;</em></> : 'Find a better starting point.'}</h1><p className="page-intro">Search across prompt titles, professions, tags, and the prompt content itself.</p></div>
      <div className="search-page-box"><Search size={19} /><label className="sr-only" htmlFor="search-page-input">Search all prompts</label><input id="search-page-input" value={query} onChange={(event) => update('q', event.target.value)} placeholder="Try “launch plan” or “research”" /><span>{results.length} results</span></div>
      <div className="search-filter-row"><div className="filter-label"><SlidersHorizontal size={15} /> Refine results</div>
        <label className="select-wrap"><span className="sr-only">Filter by profession</span><select value={professionFilter} onChange={(event) => update('profession', event.target.value)}><option value="">All professions</option>{professions.map((profession) => <option key={profession.slug} value={profession.slug}>{profession.name}</option>)}</select></label>
        <label className="select-wrap"><span className="sr-only">Filter by tag</span><select value={tagFilter} onChange={(event) => update('tag', event.target.value)}><option value="">All tags</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label>
        <button className={`filter-chip recent-filter ${recentOnly ? 'filter-chip-active' : ''}`} onClick={() => update('recent', recentOnly ? '' : 'true')}><Sparkles size={13} /> Recently updated</button>
        <button className={`filter-chip recent-filter ${featuredOnly ? 'filter-chip-active' : ''}`} onClick={() => update('featured', featuredOnly ? '' : 'true')}><Sparkles size={13} /> Featured</button>
        {(professionFilter || tagFilter || recentOnly || featuredOnly) && <button className="clear-filters" onClick={clearFilters}>Clear all</button>}
      </div>
      <div className="collection-results-line"><span>{results.length} {results.length === 1 ? 'result' : 'results'}</span><span>Across {professions.length} professions</span></div>
      {results.length ? <div className="prompt-card-grid">{results.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} showProfession />)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={20} /></span><h2>No matches, yet</h2><p>Try a broader search or remove a filter to see more of the library.</p><button className="button button-secondary" onClick={clearFilters}>Clear filters <ArrowRight size={14} /></button></div>}
    </div>
  )
}
