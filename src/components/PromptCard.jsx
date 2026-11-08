import { ArrowUpRight, Clock3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function formatDate(value) {
  if (!value) return 'Recently updated'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Recently updated'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function PromptCard({ prompt, showProfession = false, compact = false }) {
  return (
    <article className={`prompt-card ${compact ? 'prompt-card-compact' : ''}`}>
      <div className="prompt-card-topline">
        <span className="prompt-type"><span className="type-dot" /> FIELD NOTE / {prompt.id.slice(0, 2).toUpperCase()}</span>
        {prompt.featured && <span className="featured-label"><Sparkles size={11} /> Curated</span>}
      </div>
      <Link className="prompt-card-title" to={`/prompts/${prompt.professionSlug}/${prompt.slug}`}>{prompt.title}<ArrowUpRight size={16} aria-hidden="true" /></Link>
      {showProfession && <Link className="prompt-profession-link" to={`/professions/${prompt.professionSlug}`}>{prompt.profession}</Link>}
      <p className="prompt-card-description">{prompt.description}</p>
      <div className="tag-row">{prompt.tags.slice(0, compact ? 2 : 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
      <div className="prompt-card-footer"><span><Clock3 size={12} aria-hidden="true" /> {formatDate(prompt.updatedAt)}</span><Link aria-label={`Open ${prompt.title}`} to={`/prompts/${prompt.professionSlug}/${prompt.slug}`}>Read prompt <ArrowUpRight size={12} aria-hidden="true" /></Link></div>
    </article>
  )
}
