import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Clipboard, ClipboardCheck, Code2, Copy, RotateCcw, Sparkles } from 'lucide-react'
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

  if (!prompt) return (
    <div className="empty-state not-found-state">
      <h1>Prompt not found</h1>
      <p>This prompt may have been moved or removed.</p>
      <Link className="button button-primary" to="/">Back to overview</Link>
    </div>
  )

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
    <div className="workspace-page">
      <div className="workspace-crumb">
        <Link to={`/professions/${prompt.professionSlug}`}><ArrowLeft size={13} aria-hidden="true" /> {prompt.profession}</Link>
        <span>/</span>
        <span>{prompt.title}</span>
      </div>

      <header className="workspace-header">
        <div>
          <h1>{prompt.title}</h1>
          <p>{prompt.description}</p>
        </div>
        <div className="workspace-actions" aria-label="Copy prompt options">
          <button className="button button-secondary" onClick={() => copy('original')}><Copy size={14} aria-hidden="true" /><span>Original</span></button>
          <button className="button button-secondary" onClick={() => copy('plain')}><Clipboard size={14} aria-hidden="true" /><span>Plain text</span></button>
          <button className="button button-primary" onClick={() => copy('custom')}><ClipboardCheck size={14} aria-hidden="true" /><span>Copy customized</span></button>
        </div>
      </header>

      <div className="workbench">
        <aside className="panel" aria-labelledby="customize-heading">
          <div className="panel-header">
            <h2 id="customize-heading">Make it yours</h2>
            <p>Fill in the fields to tailor this prompt.</p>
          </div>

          <div className="panel-meta">
            <span>Updated {formatDate(prompt.updatedAt)}</span>
            <button className="reset-button" onClick={() => setValues({})} title="Reset all fields"><RotateCcw size={12} aria-hidden="true" /> Reset</button>
          </div>

          {missing.length > 0 && (
            <p className="field-note">{missing.length} {missing.length === 1 ? 'field' : 'fields'} left open — unfilled tokens stay highlighted.</p>
          )}

          <div className="fields">
            {placeholders.map((name) => {
              const multiline = isMultilinePlaceholder(name)
              const hasValue = Boolean(values[name]?.trim())
              const id = `placeholder-${name.toLowerCase()}`
              return (
                <div className="field" key={name}>
                  <label htmlFor={id}>{formatPlaceholderLabel(name)}</label>
                  {multiline
                    ? <textarea id={id} rows={name.includes('CODE') || name.includes('DATA') ? 5 : 3} value={values[name] || ''} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} placeholder={`Add ${formatPlaceholderLabel(name).toLowerCase()}…`} aria-invalid={!hasValue} aria-required="true" />
                    : <input id={id} value={values[name] || ''} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} placeholder={`Enter ${formatPlaceholderLabel(name).toLowerCase()}…`} aria-invalid={!hasValue} aria-required="true" />}
                </div>
              )
            })}
          </div>
        </aside>

        <section className="preview" aria-label="Prompt preview">
          <div className="preview-toolbar">
            <div className="preview-tabs" role="tablist" aria-label="Document format">
              <button role="tab" aria-selected={!rawMode} className={!rawMode ? 'preview-tab-active' : ''} onClick={() => setRawMode(false)}><Sparkles size={12} aria-hidden="true" /> Formatted</button>
              <button role="tab" aria-selected={rawMode} className={rawMode ? 'preview-tab-active' : ''} onClick={() => setRawMode(true)}><Code2 size={12} aria-hidden="true" /> Markdown</button>
            </div>
            <span className="preview-live">Live preview</span>
          </div>

          <div className="preview-body">
            {rawMode
              ? <pre className="raw-markdown"><code>{customizedMarkdown}</code></pre>
              : <article className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypePlaceholderMarks]}>{customizedMarkdown}</ReactMarkdown></article>}
          </div>

          <div className="preview-footer">
            <span>Changes appear as you type</span>
            <span>{prompt.content.trim().split(/\s+/).length} words / source</span>
          </div>
        </section>
      </div>

      {toast && <div className="toast-message" role="status"><ClipboardCheck size={15} aria-hidden="true" /> {toast}</div>}
    </div>
  )
}
