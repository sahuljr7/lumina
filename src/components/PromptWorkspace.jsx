import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Check, Clipboard, ClipboardCheck, Code2, Copy, RotateCcw, Sparkles, WandSparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatDate } from './PromptCard.jsx'
import { findPlaceholders, formatPlaceholderLabel, isMultilinePlaceholder, markdownToPlainText, replacePlaceholders } from '../utils/prompts.js'

function rehypePlaceholderMarks() {
  return (tree) => {
    const visit = (node, insideCode = false) => {
      if (!node.children) return
      const isCode = insideCode || (node.type === 'element' && ['pre', 'code'].includes(node.tagName))
      const nextChildren = []
      for (const child of node.children) {
        if (child.type === 'text' && !isCode) {
          const parts = child.value.split(/(\{\{\s*[A-Z0-9_]+\s*\}\})/g)
          for (const part of parts) {
            if (/^\{\{\s*[A-Z0-9_]+\s*\}\}$/.test(part)) {
              nextChildren.push({ type: 'element', tagName: 'span', properties: { className: ['placeholder-empty'] }, children: [{ type: 'text', value: part }] })
            } else if (part) nextChildren.push({ type: 'text', value: part })
          }
        } else {
          visit(child, isCode)
          nextChildren.push(child)
        }
      }
      node.children = nextChildren
    }
    visit(tree)
  }
}

export function PromptWorkspace({ prompts }) {
  const { professionSlug, promptSlug } = useParams()
  const prompt = prompts.find((item) => item.professionSlug === professionSlug && item.slug === promptSlug)
  const [values, setValues] = useState({})
  const [rawMode, setRawMode] = useState(false)
  const [toast, setToast] = useState('')
  const placeholders = useMemo(() => prompt ? findPlaceholders(prompt.content) : [], [prompt])
  const customizedMarkdown = useMemo(() => prompt ? replacePlaceholders(prompt.content, values) : '', [prompt, values])
  const missing = placeholders.filter((key) => !values[key]?.trim())

  useEffect(() => {
    setValues({})
    setRawMode(false)
  }, [prompt?.id])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  if (!prompt) return <div className="empty-state not-found-state"><span className="not-found-code">FIELD NOTE / 404</span><h1>Prompt not found</h1><p>This prompt may have been moved or removed.</p><Link className="button button-primary" to="/">Return to the overview</Link></div>

  const copy = async (kind) => {
    const text = kind === 'original' ? prompt.content : kind === 'plain' ? markdownToPlainText(customizedMarkdown) : customizedMarkdown
    try {
      await navigator.clipboard.writeText(text)
      setToast(missing.length && kind !== 'original' ? `Copied with ${missing.length} placeholder${missing.length === 1 ? '' : 's'} to fill.` : 'Copied to clipboard.')
    } catch {
      setToast('Clipboard access is unavailable in this browser.')
    }
  }

  return (
    <div className="workspace-page page-enter">
      <div className="workspace-crumb"><Link to={`/professions/${prompt.professionSlug}`}><ArrowLeft size={13} /> {prompt.profession}</Link><span>/</span><span>{prompt.title}</span></div>
      <div className="workspace-titlebar">
        <div className="workspace-title-copy"><div className="eyebrow eyebrow-accent">PROMPT WORKBENCH <span className="title-eyebrow-dot">/</span> {prompt.profession.toUpperCase()}</div><h1>{prompt.title}</h1><p>{prompt.description}</p></div>
        <div className="workspace-actions" aria-label="Copy prompt options">
          <button className="button button-secondary action-button" onClick={() => copy('original')}><Copy size={14} /><span>Original</span></button>
          <button className="button button-secondary action-button" onClick={() => copy('plain')}><Clipboard size={14} /><span>Plain text</span></button>
          <button className="button button-primary action-button" onClick={() => copy('custom')}><ClipboardCheck size={14} /><span>Copy customized</span></button>
        </div>
      </div>

      <div className="workbench-layout">
        <aside className="customize-panel" aria-labelledby="customize-heading">
          <div className="panel-heading"><span className="panel-title-icon"><WandSparkles size={16} /></span><div><h2 id="customize-heading">Make it yours</h2><p>Bring your context to the page.</p></div></div>
          <div className="prompt-meta-strip"><span className="meta-label">LAST REVISED</span><span>{formatDate(prompt.updatedAt)}</span></div>
          <div className="field-heading-row"><div><h3>Fill the open fields</h3><p>{String(placeholders.length).padStart(2, '0')} inputs detected</p></div><button className="reset-button" onClick={() => setValues({})} title="Reset all fields"><RotateCcw size={12} /> Reset</button></div>
          {missing.length > 0 && <div className="missing-notice"><span className="notice-dot" /><span><strong>{missing.length} field{missing.length === 1 ? '' : 's'} left open</strong><small>Unfilled tokens stay marked in the document.</small></span></div>}
          <div className="placeholder-fields">
            {placeholders.map((name, index) => {
              const multiline = isMultilinePlaceholder(name)
              const hasValue = Boolean(values[name]?.trim())
              const id = `placeholder-${name.toLowerCase()}`
              return <div className={`placeholder-field ${!hasValue ? 'field-empty' : ''}`} key={name}>
                <label htmlFor={id}><span className="field-number">{String(index + 1).padStart(2, '0')}</span>{formatPlaceholderLabel(name)} {!hasValue && <span className="required-dot" aria-label="Required">*</span>}</label>
                {multiline ? <textarea id={id} rows={name.includes('CODE') || name.includes('DATA') ? 5 : 3} value={values[name] || ''} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} placeholder={`Add ${formatPlaceholderLabel(name).toLowerCase()}...`} aria-invalid={!hasValue} aria-required="true" /> : <input id={id} value={values[name] || ''} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} placeholder={`Enter ${formatPlaceholderLabel(name).toLowerCase()}...`} aria-invalid={!hasValue} aria-required="true" />}
              </div>
            })}
          </div>
          <div className="customize-footnote"><Sparkles size={12} /><span>The source template remains untouched.</span></div>
        </aside>

        <section className="preview-panel" aria-label="Prompt preview">
          <div className="preview-toolbar"><div className="preview-label"><span className="preview-live-dot" /><span>LIVE DOCUMENT</span></div><div className="preview-tabs" role="tablist" aria-label="Document format"><button role="tab" aria-selected={!rawMode} className={!rawMode ? 'preview-tab-active' : ''} onClick={() => setRawMode(false)}><Sparkles size={12} /> Formatted</button><button role="tab" aria-selected={rawMode} className={rawMode ? 'preview-tab-active' : ''} onClick={() => setRawMode(true)}><Code2 size={12} /> Markdown</button></div></div>
          <div className="preview-document">
            <div className="document-topline"><span>YOUR WORKING COPY</span><span className="document-mark">P<span>.</span>L</span></div>
            {rawMode ? <pre className="raw-markdown"><code>{customizedMarkdown}</code></pre> : <article className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypePlaceholderMarks]}>{customizedMarkdown}</ReactMarkdown></article>}
          </div>
          <div className="preview-footer"><span><Check size={12} /> Changes appear as you type</span><span>{prompt.content.trim().split(/\s+/).length} words / source</span></div>
        </section>
      </div>
      {toast && <div className="toast-message" role="status"><ClipboardCheck size={15} /> {toast}</div>}
    </div>
  )
}
