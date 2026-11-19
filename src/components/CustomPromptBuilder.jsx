import { useMemo, useState } from 'react'
import { Braces, Check, Clipboard, ClipboardCheck, Eraser, Sparkles } from 'lucide-react'
import {
  findCustomPromptPlaceholders,
  formatCustomPlaceholderLabel,
  getCustomPromptPreviewParts,
  isMultilineCustomPlaceholder,
  replaceCustomPromptPlaceholders,
} from '../utils/customPrompt.js'

const SAMPLE_TEMPLATE = `Act as a {role}.
Create a {content_type} about {topic}.
Target audience: {audience}.
Tone: {tone}.`

export function CustomPromptBuilder() {
  const [template, setTemplate] = useState(SAMPLE_TEMPLATE)
  const [values, setValues] = useState({})
  const [copyStatus, setCopyStatus] = useState('')
  const placeholders = useMemo(() => findCustomPromptPlaceholders(template), [template])
  const previewParts = useMemo(() => getCustomPromptPreviewParts(template, values), [template, values])
  const completedPrompt = useMemo(() => replaceCustomPromptPlaceholders(template, values), [template, values])
  const missingCount = placeholders.filter(({ key }) => !values[key]?.trim()).length
  const filledCount = placeholders.length - missingCount
  const hasTemplate = Boolean(template.trim())
  const canCopyCompleted = hasTemplate && missingCount === 0

  const clearWorkspace = () => {
    setTemplate('')
    setValues({})
    setCopyStatus('')
  }

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus(successMessage)
    } catch {
      setCopyStatus('Clipboard access is unavailable. Select and copy the text from the preview instead.')
    }
  }

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setCopyStatus('')
  }

  return (
    <div className="builder-page">
      <header className="page-header">
        <div className="page-header-copy">
          <h1>Custom prompt builder</h1>
          <p className="page-intro">Write a template, fill its fields, then copy the finished prompt.</p>
        </div>
        <span className="builder-note"><Sparkles size={13} aria-hidden="true" /> Session only. Nothing is saved.</span>
      </header>

      <div className="builder-grid">
        <div className="builder-main">
          <section className="panel-card" aria-labelledby="custom-prompt-editor-title">
            <div className="panel-title-row">
              <div>
                <h2 id="custom-prompt-editor-title">Write your template</h2>
                <p>Use braces to mark any value you want to fill in.</p>
              </div>
              <button className="builder-clear" type="button" onClick={clearWorkspace} disabled={!hasTemplate}>
                <Eraser size={13} aria-hidden="true" /> Clear
              </button>
            </div>
            <label className="sr-only" htmlFor="custom-prompt-template">Prompt template</label>
            <textarea
              className="builder-editor"
              id="custom-prompt-template"
              rows={9}
              value={template}
              onChange={(event) => {
                setTemplate(event.target.value)
                setCopyStatus('')
              }}
              placeholder="Write or paste your prompt here. Add a field like {topic} wherever you want a value."
              spellCheck="true"
            />
            <div className="builder-meta">
              <span><Braces size={12} aria-hidden="true" /> {placeholders.length} unique {placeholders.length === 1 ? 'field' : 'fields'} detected</span>
              <span>Repeating a field reuses its value.</span>
            </div>
          </section>

          <section className="panel-card" aria-labelledby="custom-prompt-fields-title">
            <div className="panel-title-row">
              <div>
                <h2 id="custom-prompt-fields-title">Fill the fields</h2>
                <p>{placeholders.length ? `${filledCount} of ${placeholders.length} filled` : 'Fields appear when you add placeholders.'}</p>
              </div>
            </div>
            {placeholders.length ? (
              <div className="builder-fields">
                {placeholders.map((placeholder) => (
                  <PlaceholderField
                    key={placeholder.key}
                    placeholder={placeholder}
                    value={values[placeholder.key] || ''}
                    onChange={(value) => updateValue(placeholder.key, value)}
                  />
                ))}
              </div>
            ) : (
              <div className="builder-empty">
                <Braces size={15} aria-hidden="true" />
                <p>Add a field such as <code>{'{topic}'}</code> to create an input here.</p>
              </div>
            )}
          </section>
        </div>

        <section className="panel-card builder-preview-card" aria-labelledby="custom-prompt-preview-title">
          <div className="panel-title-row">
            <div>
              <h2 id="custom-prompt-preview-title">Preview</h2>
              <p>Unfilled fields stay highlighted until you add a value.</p>
            </div>
            <span className={`builder-status ${canCopyCompleted ? 'is-ready' : ''}`}>
              {canCopyCompleted ? <><Check size={12} aria-hidden="true" /> Ready</> : hasTemplate ? `${missingCount} open` : 'Empty'}
            </span>
          </div>

          <div className="builder-preview-text" aria-label="Live prompt preview">
            {hasTemplate ? previewParts.map((part, index) => part.type === 'missing'
              ? <mark className="builder-token-empty" key={`${part.value}-${index}`}>{part.value}</mark>
              : <span key={`text-${index}`}>{part.value}</span>)
              : <span className="builder-preview-placeholder">Your prompt preview will appear here.</span>}
          </div>

          {hasTemplate && missingCount > 0 && placeholders.length > 0 && (
            <p className="builder-note-line"><Braces size={13} aria-hidden="true" /> Fill the remaining fields to copy a completed prompt.</p>
          )}

          <div className="builder-actions" aria-label="Copy options">
            <button className="button button-secondary" type="button" onClick={() => copyText(template, 'Template copied with its placeholders.')} disabled={!hasTemplate}>
              <Clipboard size={14} aria-hidden="true" /> Copy template
            </button>
            <button className="button button-primary" type="button" onClick={() => copyText(completedPrompt, 'Completed prompt copied.')} disabled={!canCopyCompleted}>
              <ClipboardCheck size={14} aria-hidden="true" /> Copy completed prompt
            </button>
          </div>
          <p className="builder-status-line" role="status" aria-live="polite">
            {copyStatus || (hasTemplate ? missingCount ? 'Complete every field to enable the completed copy.' : 'Both versions are ready to copy.' : 'Write a prompt to enable copy options.')}
          </p>
        </section>
      </div>
    </div>
  )
}

function PlaceholderField({ placeholder, value, onChange }) {
  const id = `custom-prompt-value-${placeholder.key}`
  const multiline = isMultilineCustomPlaceholder(placeholder.name)
  const label = formatCustomPlaceholderLabel(placeholder.name)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} rows={3} value={value} onChange={(event) => onChange(event.target.value)} placeholder={`Add ${label.toLowerCase()}…`} />
      ) : (
        <input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={`Enter ${label.toLowerCase()}…`} />
      )}
    </div>
  )
}
