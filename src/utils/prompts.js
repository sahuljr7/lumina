export function findPlaceholders(markdown) {
  return [...new Set([...markdown.matchAll(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g)].map((match) => match[1]))]
}

export function replacePlaceholders(markdown, values) {
  return markdown.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (token, key) => {
    const value = values[key]
    return typeof value === 'string' && value.trim() ? value : token
  })
}

export function formatPlaceholderLabel(name) {
  return name
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function isMultilinePlaceholder(name) {
  return /(CODE|CONTEXT|BRIEF|DATA|EXAMPLE|NOTES|DESCRIPTION|TRANSCRIPT|REQUIREMENTS|DETAILS|FEEDBACK|METRICS|SCHEMA|SAMPLE|CONSTRAINTS|OBJECTIVE)/i.test(name)
}

export function markdownToPlainText(markdown) {
  return markdown
    .replace(/```[^\n]*\n([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
    .replace(/\|/g, ' · ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/---+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function searchPrompts(prompts, query, professionSlug = '', tag = '', recentlyUpdated = false) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 30

  return prompts.filter((prompt) => {
    if (professionSlug && prompt.professionSlug !== professionSlug) return false
    if (tag && !prompt.tags.includes(tag)) return false
    if (recentlyUpdated && (!prompt.updatedAt || new Date(prompt.updatedAt).getTime() < cutoff)) return false
    const searchable = [prompt.title, prompt.description, prompt.profession, ...prompt.tags, prompt.content]
      .join(' ')
      .toLowerCase()
    return terms.every((term) => searchable.includes(term))
  })
}

export function getAllTags(prompts) {
  return [...new Set(prompts.flatMap((prompt) => prompt.tags))].sort((a, b) => a.localeCompare(b))
}
