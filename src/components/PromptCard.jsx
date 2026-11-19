import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function formatDate(value) {
  if (!value) return 'Recently updated'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Recently updated'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function PromptCard({ prompt, showProfession = false, compact = false }) {
  const promptPath = `/prompts/${prompt.professionSlug}/${prompt.slug}`

  return (
    <article className="prompt-card">
      <div className="prompt-card-head">
        <Link className="prompt-card-title" to={promptPath}>{prompt.title}</Link>
        {prompt.featured && <span className="badge">Featured</span>}
      </div>
      {showProfession && <Link className="prompt-profession" to={`/professions/${prompt.professionSlug}`}>{prompt.profession}</Link>}
      <p className="prompt-card-description">{prompt.description}</p>
      <div className="tag-row">{prompt.tags.slice(0, compact ? 2 : 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
      <div className="prompt-card-footer">
        <span>{formatDate(prompt.updatedAt)}</span>
        <Link aria-label={`Open ${prompt.title}`} to={promptPath}>Read prompt <ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
    </article>
  )
}
