import { ArrowRight, ArrowUpRight, Layers3, Plus, Sparkles, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PromptCard } from './PromptCard.jsx'

const iconByProfession = {
  'software-engineering': '⌘',
  marketing: '↗',
  'data-science': '◌',
  'product-management': '◫',
  'project-management': '▦',
}

export function Dashboard({ prompts, professions }) {
  const featured = prompts.filter((prompt) => prompt.featured).slice(0, 2)
  const recent = prompts.slice(0, 3)
  const recentlyAdded = prompts.filter((prompt) => prompt.updatedAt && Date.now() - new Date(prompt.updatedAt).getTime() < 30 * 86400000).length

  return (
    <div className="dashboard-page page-enter">
      <div className="welcome-panel">
        <div className="welcome-orbit welcome-orbit-one" /><div className="welcome-orbit welcome-orbit-two" />
        <div className="welcome-content">
          <div className="eyebrow eyebrow-on-dark"><span className="eyebrow-dot" /> THE PROMPT WORKSPACE</div>
          <h1>Your workspace for<br /><em>better AI prompts.</em></h1>
          <p>Discover, customize, and organize high-quality prompts for every profession.</p>
          <Link className="button button-light" to="/professions">Explore the library <ArrowRight size={15} /></Link>
        </div>
        <div className="welcome-decoration" aria-hidden="true">
          <div className="floating-note note-one"><span className="note-icon purple-note"><WandSparkles size={16} /></span><span><strong>Make it yours</strong><small>Customize any prompt</small></span></div>
          <div className="floating-note note-two"><span className="note-icon lime-note"><Sparkles size={16} /></span><span><strong>Ready to use</strong><small>Copy in one click</small></span></div>
          <div className="welcome-monogram">P<span>.</span></div>
        </div>
      </div>

      <section className="stats-row" aria-label="Library statistics">
        <Stat label="Professions" value={professions.length} detail="Curated workspaces" icon={<Layers3 size={17} />} />
        <Stat label="Prompt templates" value={prompts.length} detail="Ready to customize" icon={<WandSparkles size={17} />} />
        <Stat label="Recently added" value={recentlyAdded} detail="Updated this month" icon={<Sparkles size={17} />} />
      </section>

      <section className="section-block profession-section">
        <div className="section-heading"><div><div className="eyebrow">BROWSE BY FIELD</div><h2>Find your corner of the library</h2></div><Link className="text-link" to="/professions">All professions <ArrowRight size={15} /></Link></div>
        <div className="profession-grid">
          {professions.map((profession, index) => (
            <Link className={`profession-card profession-color-${index % 5}`} to={`/professions/${profession.slug}`} key={profession.slug}>
              <span className="profession-card-icon">{iconByProfession[profession.slug] || '✳'}</span>
              <span className="profession-count">{profession.prompts.length} prompts</span>
              <strong>{profession.name}</strong>
              <p>{profession.description}</p>
              <span className="profession-card-arrow"><ArrowUpRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && <section className="section-block featured-section">
        <div className="section-heading"><div><div className="eyebrow">A GOOD PLACE TO START</div><h2>Featured prompts</h2></div><Link className="text-link" to="/search?featured=true">View all <ArrowRight size={15} /></Link></div>
        <div className="prompt-card-grid">{featured.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} showProfession />)}</div>
      </section>}

      <section className="section-block recent-section">
        <div className="section-heading"><div><div className="eyebrow">FRESH FROM THE LIBRARY</div><h2>Recently updated</h2></div><Link className="text-link" to="/search?recent=true">See what&apos;s new <ArrowRight size={15} /></Link></div>
        <div className="recent-list">
          {recent.map((prompt, index) => <RecentRow key={prompt.id} prompt={prompt} index={index} />)}
        </div>
      </section>

      <div className="add-prompt-hint"><div className="add-prompt-icon"><Plus size={18} /></div><div><strong>Your next great prompt starts here.</strong><p>Drop a <code>.md</code> file into a profession folder to add it to the library.</p></div><Link to="/professions">Learn how <ArrowRight size={14} /></Link></div>
    </div>
  )
}

function Stat({ label, value, detail, icon }) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><div className="stat-copy"><span>{label}</span><strong>{value.toLocaleString()}</strong><small>{detail}</small></div></div>
}

function RecentRow({ prompt, index }) {
  const initials = prompt.profession.split(/[ &]/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('')
  return <Link className="recent-row" to={`/prompts/${prompt.professionSlug}/${prompt.slug}`}>
    <span className={`recent-avatar recent-avatar-${index % 4}`}>{initials}</span>
    <span className="recent-row-copy"><strong>{prompt.title}</strong><small>{prompt.profession} <span>·</span> {prompt.tags.slice(0, 2).join(', ')}</small></span>
    <span className="recent-row-date">{prompt.updatedAt}</span><ArrowUpRight className="recent-row-arrow" size={16} />
  </Link>
}
