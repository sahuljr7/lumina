const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z][A-Za-z0-9 _-]{0,49})\s*\}\}|\{\s*([A-Za-z][A-Za-z0-9 _-]{0,49})\s*\}/g

function createPlaceholderPattern() {
  return new RegExp(PLACEHOLDER_PATTERN.source, 'g')
}

function getPlaceholderName(match) {
  return (match[1] || match[2]).trim()
}

export function normalizeCustomPlaceholder(name) {
  return name.trim().toLowerCase().replace(/[\s_-]+/g, '_').replace(/^_+|_+$/g, '')
}

export function formatCustomPlaceholderLabel(name) {
  return name
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function findCustomPromptPlaceholders(template) {
  const placeholders = new Map()
  for (const match of template.matchAll(createPlaceholderPattern())) {
    const name = getPlaceholderName(match)
    const key = normalizeCustomPlaceholder(name)
    if (!placeholders.has(key)) placeholders.set(key, { key, name })
  }
  return [...placeholders.values()]
}

export function replaceCustomPromptPlaceholders(template, values) {
  return template.replace(createPlaceholderPattern(), (token, firstName, secondName) => {
    const key = normalizeCustomPlaceholder(firstName || secondName)
    const value = values[key]
    return typeof value === 'string' && value.trim() ? value : token
  })
}

export function getCustomPromptPreviewParts(template, values) {
  const parts = []
  let cursor = 0

  for (const match of template.matchAll(createPlaceholderPattern())) {
    const start = match.index
    const token = match[0]
    const name = getPlaceholderName(match)
    const value = values[normalizeCustomPlaceholder(name)]

    if (start > cursor) parts.push({ type: 'text', value: template.slice(cursor, start) })
    parts.push(typeof value === 'string' && value.trim()
      ? { type: 'value', value }
      : { type: 'missing', value: token })
    cursor = start + token.length
  }

  if (cursor < template.length) parts.push({ type: 'text', value: template.slice(cursor) })
  return parts
}

export function isMultilineCustomPlaceholder(name) {
  return /(^|_)(context|brief|notes?|description|example|requirements|details?|transcript|feedback|metrics|schema|sample|constraints|objective|data|body)(_|$)/i.test(normalizeCustomPlaceholder(name))
}
