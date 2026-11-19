import { ArrowRight, ArrowUpRight, BarChart3, BriefcaseBusiness, Code2, FolderKanban, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PromptCard, formatDate } from './PromptCard.jsx'

const professionIcons = {
  'software-engineering': Code2,
  marketing: Megaphone,
  'data-science': BarChart3,
  'product-management': BriefcaseBusiness,
  'project-management': FolderKanban,
}

export function Dashboard({ prompts, professions }) {
  const featured = prompts.filter((prompt) => prompt.featured).slice(0, 2)
  const recent = prompts.slice(0, 3)
  const exemplar = featured[0] || prompts[0]
  const recentlyAdded = prompts.filter((prompt) => prompt.updatedAt && Date.now() - new Date(prompt.updatedAt).getTime() < 30 * 86400000).length

  return (
    <div className="dashboard-page">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <h1 id="home-title">A library for the work behind the work.</h1>
          <p className="hero-description">Thoughtful prompts are working tools, not magic words. Find a starting point, bring your context, and get to a sharper first draft.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/professions">Browse prompts <ArrowRight size={15} /></Link>
            <Link className="button button-secondary" to="/custom-prompt-builder">Build a custom prompt</Link>
          </div>
        </div>

        {exemplar && (
          <aside className="start-card" aria-label="Featured prompt">
            <span className="start-card-label">Start here</span>
            <h2>{exemplar.title}</h2>
            <p>{exemplar.description}</p>
            <div className="start-card-meta">{exemplar.profession} · {exemplar.tags.slice(0, 2).join(', ')}</div>
            <Link className="text-link" to={`/prompts/${exemplar.professionSlug}/${exemplar.slug}`}>Open prompt <ArrowUpRight size={14} /></Link>
          </aside>
        )}
      </section>

      <div className="stats" aria-label="Library statistics">
        <div className="stat"><strong>{professions.length}</strong><span>Disciplines</span></div>
        <div className="stat"><strong>{prompts.length}</strong><span>Prompts</span></div>
        <div className="stat"><strong>{recentlyAdded}</strong><span>Added this month</span></div>
      </div>

      <section className="section" aria-labelledby="disciplines-heading">
        <div className="section-header">
          <h2 id="disciplines-heading">Disciplines</h2>
          <Link className="text-link" to="/professions">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="list">
          {professions.map((profession) => {
            const Icon = professionIcons[profession.slug] || BriefcaseBusiness
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
      </section>

      {featured.length > 0 && (
        <section className="section" aria-labelledby="featured-heading">
          <div className="section-header">
            <h2 id="featured-heading">Featured</h2>
            <Link className="text-link" to="/search?featured=true">All featured <ArrowRight size={14} /></Link>
          </div>
          <div className="prompt-grid">{featured.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} showProfession />)}</div>
        </section>
      )}

      <section className="section" aria-labelledby="recent-heading">
        <div className="section-header">
          <h2 id="recent-heading">Recently added</h2>
          <Link className="text-link" to="/search?recent=true">See all <ArrowRight size={14} /></Link>
        </div>
        <div className="recent-list">
          {recent.map((prompt) => <RecentRow key={prompt.id} prompt={prompt} />)}
        </div>
      </section>

      <p className="page-note">
        Add a Markdown file to a discipline folder to grow the library.
        <Link className="text-link" to="/professions">Learn how <ArrowRight size={13} /></Link>
      </p>
    </div>
  )
}

function RecentRow({ prompt }) {
  return (
    <Link className="recent-row" to={`/prompts/${prompt.professionSlug}/${prompt.slug}`}>
      <span className="recent-copy">
        <strong>{prompt.title}</strong>
        <span>{prompt.profession} · {prompt.tags.slice(0, 2).join(', ')}</span>
      </span>
      <span className="recent-date">{formatDate(prompt.updatedAt)}</span>
      <ArrowUpRight className="list-arrow" size={15} aria-hidden="true" />
    </Link>
  )
}
