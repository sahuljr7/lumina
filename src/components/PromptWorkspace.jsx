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

  if (!prompt) return <div className="empty-state not-found-state"><span className="not-found-code">404</span><h1>Prompt not found</h1><p>This prompt may have been moved or removed.</p><Link className="button button-primary" to="/">Return to overview</Link></div>

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
      <div className="workspace-crumb"><Link to={`/professions/${prompt.professionSlug}`}><ArrowLeft size={14} /> {prompt.profession}</Link><span>/</span><span>{prompt.title}</span></div>
      <div className="workspace-titlebar"><div className="workspace-title-copy"><div className="eyebrow">PROMPT WORKSPACE <span className="title-eyebrow-dot">·</span> {prompt.profession.toUpperCase()}</div><h1>{prompt.title}</h1><p>{prompt.description}</p></div><div className="workspace-actions">
        <button className="button button-secondary action-button" onClick={() => copy('original')}><Copy size={15} /><span>Copy original</span></button>
        <button className="button button-secondary action-button" onClick={() => copy('plain')}><Clipboard size={15} /><span>Copy plain text</span></button>
        <button className="button button-primary action-button" onClick={() => copy('custom')}><ClipboardCheck size={15} /><span>Copy customized</span></button>
      </div></div>

      <div className="workspace-layout">
        <aside className="customize-panel">
          <div className="panel-heading"><div className="panel-title-icon"><WandSparkles size={16} /></div><div><h2>Make it yours</h2><p>Fill in the details to customize.</p></div></div>
          <div className="prompt-meta-strip"><span className="meta-label">LAST UPDATED</span><span>{formatDate(prompt.updatedAt)}</span></div>
          <div className="customize-divider" />
          <div className="field-heading-row"><div><h3>Prompt inputs</h3><p>{placeholders.length} fields detected</p></div><button className="reset-button" onClick={() => setValues({})} title="Reset all fields"><RotateCcw size={13} /> Reset</button></div>
          {missing.length > 0 && <div className="missing-notice"><span className="notice-dot" /><span><strong>{missing.length} field{missing.length === 1 ? '' : 's'} left to fill</strong><small>Unfilled tokens stay highlighted in the preview.</small></span></div>}
          <div className="placeholder-fields">
            {placeholders.map((name) => {
              const multiline = isMultilinePlaceholder(name)
              const hasValue = Boolean(values[name]?.trim())
              const id = `placeholder-${name.toLowerCase()}`
              return <div className={`placeholder-field ${!hasValue ? 'field-empty' : ''}`} key={name}>
                <label htmlFor={id}>{formatPlaceholderLabel(name)} {!hasValue && <span className="required-dot" aria-label="Required">*</span>}</label>
                {multiline ? <textarea id={id} rows={name.includes('CODE') || name.includes('DATA') ? 5 : 3} value={values[name] || ''} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} placeholder={`Add ${formatPlaceholderLabel(name).toLowerCase()}...`} aria-invalid={!hasValue} /> : <input id={id} value={values[name] || ''} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} placeholder={`Enter ${formatPlaceholderLabel(name).toLowerCase()}...`} aria-invalid={!hasValue} />}
              </div>
            })}
          </div>
          <div className="customize-footnote"><Sparkles size={13} /><span>Your original template stays untouched.</span></div>
        </aside>

        <section className="preview-panel" aria-label="Prompt preview">
          <div className="preview-toolbar"><div className="preview-label"><span className="preview-live-dot" /><span>LIVE PREVIEW</span></div><div className="preview-tabs" role="group" aria-label="Preview format"><button className={!rawMode ? 'preview-tab-active' : ''} onClick={() => setRawMode(false)}><Sparkles size={13} /> Formatted</button><button className={rawMode ? 'preview-tab-active' : ''} onClick={() => setRawMode(true)}><Code2 size={13} /> Markdown</button></div></div>
          <div className="preview-document">
            <div className="document-topline"><span>YOUR PROMPT</span><span className="document-mark">PL<span>.</span></span></div>
            {rawMode ? <pre className="raw-markdown"><code>{customizedMarkdown}</code></pre> : <article className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypePlaceholderMarks]}>{customizedMarkdown}</ReactMarkdown></article>}
          </div>
          <div className="preview-footer"><span><Check size={13} /> Changes preview instantly</span><span>{prompt.content.trim().split(/\s+/).length} words in template</span></div>
        </section>
      </div>
      {toast && <div className="toast-message" role="status"><ClipboardCheck size={16} /> {toast}</div>}
    </div>
  )
}
