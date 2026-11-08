import { ArrowRight, ArrowUpRight, BarChart3, BriefcaseBusiness, Code2, FolderKanban, Megaphone, Plus, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PromptCard } from './PromptCard.jsx'

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
    <div className="dashboard-page page-enter">
      <section className="hero-editorial" aria-labelledby="home-title">
        <div className="hero-copy">
          <div className="hero-overline"><span className="hero-overline-rule" /> FIELD GUIDE <span>VOL. 01 / 2026</span></div>
          <h1 id="home-title" className="hero-title">A library for<br />the work behind<br /><em>the work.</em></h1>
          <p className="hero-description">Thoughtful prompts are working tools, not magic words. Find a starting point, bring your context, and get to a sharper first draft.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/professions">Browse the index <ArrowRight size={15} /></Link>
            <span className="hero-index-note"><Sparkles size={13} /> Curated for real work</span>
          </div>
        </div>

        {exemplar && <article className="feature-sheet">
          <div className="feature-sheet-topline"><span>FROM THE STACK / 001</span><span className="feature-sheet-index">NO. 01</span></div>
          <div className="feature-sheet-art" aria-hidden="true"><span className="feature-glyph">P.</span><span className="feature-art-copy">A useful prompt<br />makes room for<br />your point of view.</span></div>
          <span className="feature-sheet-label">A place to begin / {exemplar.profession}</span>
          <h2>{exemplar.title}</h2>
          <p>{exemplar.description}</p>
          <div className="feature-sheet-bottom"><div className="feature-sheet-tags">{exemplar.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><Link className="feature-sheet-link" to={`/prompts/${exemplar.professionSlug}/${exemplar.slug}`}>Open prompt <ArrowUpRight size={13} /></Link></div>
        </article>}
      </section>

      <div className="library-ledger" aria-label="Library statistics">
        <LedgerItem value={String(professions.length).padStart(2, '0')} label="Disciplines" />
        <LedgerItem value={String(prompts.length).padStart(2, '0')} label="Working templates" />
        <LedgerItem value={String(recentlyAdded).padStart(2, '0')} label="Added this month" />
      </div>

      <section className="section-block" aria-labelledby="disciplines-heading">
        <div className="section-heading"><div className="section-heading-main"><span className="section-number">01</span><div><div className="eyebrow eyebrow-accent">OPEN THE INDEX</div><h2 id="disciplines-heading">Start with a discipline</h2><p>Different work asks for different questions.</p></div></div><Link className="text-link" to="/professions">All disciplines <ArrowRight size={14} /></Link></div>
        <div className="profession-directory">
          {professions.map((profession, index) => {
            const Icon = professionIcons[profession.slug] || BriefcaseBusiness
            return <Link className="profession-directory-row" to={`/professions/${profession.slug}`} key={profession.slug}>
              <span className="directory-number">{String(index + 1).padStart(2, '0')}</span>
              <Icon className="directory-icon" size={20} strokeWidth={1.55} aria-hidden="true" />
              <span className="directory-copy"><strong>{profession.name}</strong><p>{profession.description}</p></span>
              <span className="directory-count"><strong>{String(profession.prompts.length).padStart(2, '0')}</strong> prompts</span>
              <ArrowUpRight className="directory-arrow" size={17} aria-hidden="true" />
            </Link>
          })}
        </div>
      </section>

      {featured.length > 0 && <section className="section-block" aria-labelledby="featured-heading">
        <div className="section-heading"><div className="section-heading-main"><span className="section-number">02</span><div><div className="eyebrow eyebrow-accent">EDITOR&apos;S SHELF</div><h2 id="featured-heading">A good place to begin</h2></div></div><Link className="text-link" to="/search?featured=true">All featured prompts <ArrowRight size={14} /></Link></div>
        <div className="prompt-card-grid">{featured.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} showProfession />)}</div>
      </section>}

      <section className="recent-section section-block" aria-labelledby="recent-heading">
        <div className="section-heading"><div className="section-heading-main"><span className="section-number">03</span><div><div className="eyebrow eyebrow-accent">JUST ADDED</div><h2 id="recent-heading">Fresh from the stack</h2></div></div><Link className="text-link" to="/search?recent=true">See what&apos;s new <ArrowRight size={14} /></Link></div>
        <div className="recent-list">{recent.map((prompt, index) => <RecentRow key={prompt.id} prompt={prompt} index={index} />)}</div>
      </section>

      <aside className="add-prompt-hint"><span className="add-prompt-icon"><Plus size={17} /></span><div><strong>Keep the library in motion.</strong><p>Add a <code>.md</code> file to a discipline folder to make it part of the index.</p></div><Link to="/professions">How it works <ArrowRight size={13} /></Link></aside>
    </div>
  )
}

function LedgerItem({ value, label }) {
  return <div className="ledger-item"><strong>{value}</strong><span>{label}</span></div>
}

function RecentRow({ prompt, index }) {
  const initials = prompt.profession.split(/[ &]/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('')
  return <Link className="recent-row" to={`/prompts/${prompt.professionSlug}/${prompt.slug}`}>
    <span className="recent-avatar">{String(index + 1).padStart(2, '0')}</span>
    <span className="recent-row-copy"><strong>{prompt.title}</strong><small>{initials} / {prompt.profession} / {prompt.tags.slice(0, 2).join(', ')}</small></span>
    <span className="recent-row-date">{prompt.updatedAt}</span><ArrowUpRight className="recent-row-arrow" size={15} />
  </Link>
}
