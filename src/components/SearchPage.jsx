import { useMemo } from 'react'
import { Clock3, Search, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
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
    <div className="search-page">
      <header className="page-header">
        <div className="page-header-copy">
          <h1>{recentOnly ? 'Recently added' : featuredOnly ? 'Featured prompts' : query ? <>Results for &ldquo;{query}&rdquo;</> : 'Search the library'}</h1>
          <p className="page-intro">Search the prompt text itself, or narrow the library by discipline and tag.</p>
        </div>
      </header>

      <div className="search-field search-field-main">
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor="search-page-input">Search all prompts</label>
        <input id="search-page-input" value={query} onChange={(event) => update('q', event.target.value)} placeholder="Try “launch plan” or “research”" />
        <span className="search-count">{results.length} found</span>
      </div>

      <div className="filters">
        <label className="select-field">
          <span className="sr-only">Filter by discipline</span>
          <select value={professionFilter} onChange={(event) => update('profession', event.target.value)}>
            <option value="">All disciplines</option>
            {professions.map((profession) => <option key={profession.slug} value={profession.slug}>{profession.name}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Filter by tag</span>
          <select value={tagFilter} onChange={(event) => update('tag', event.target.value)}>
            <option value="">All tags</option>
            {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </label>
        <button aria-pressed={recentOnly} className={`chip ${recentOnly ? 'chip-active' : ''}`} onClick={() => update('recent', recentOnly ? '' : 'true')}>
          <Clock3 size={13} aria-hidden="true" /> Recent
        </button>
        <button aria-pressed={featuredOnly} className={`chip ${featuredOnly ? 'chip-active' : ''}`} onClick={() => update('featured', featuredOnly ? '' : 'true')}>
          <Sparkles size={13} aria-hidden="true" /> Featured
        </button>
        {(professionFilter || tagFilter || recentOnly || featuredOnly) && <button className="clear-filters" onClick={clearFilters}>Clear filters</button>}
      </div>

      {results.length
        ? <div className="prompt-grid">{results.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} showProfession />)}</div>
        : <div className="empty-state">
            <span className="empty-icon"><Search size={18} /></span>
            <h2>No matching prompts</h2>
            <p>Try a broader search or remove a filter to see more of the library.</p>
            <button className="button button-secondary" onClick={clearFilters}>Clear filters</button>
          </div>}
    </div>
  )
}
