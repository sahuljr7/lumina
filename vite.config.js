import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const promptRoot = path.join(projectRoot, 'src/data/professions')
const virtualModuleId = 'virtual:prompt-catalog'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

function humanize(value) {
  return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(fullPath)
    return entry.isFile() && entry.name.toLowerCase().endsWith('.md') ? [fullPath] : []
  }).sort()
}

function loadPromptCatalog() {
  const prompts = []
  const errors = []

  for (const filePath of markdownFiles(promptRoot)) {
    const relativePath = path.relative(promptRoot, filePath).split(path.sep).join('/')
    const segments = relativePath.split('/')
    const professionSlug = segments.at(-2) || 'general'
    const slug = path.basename(filePath, path.extname(filePath))

    try {
      const source = readFileSync(filePath, 'utf8')
      const parsed = matter(source)
      const metadata = parsed.data || {}
      const profession = String(metadata.profession || humanize(professionSlug))
      const tags = Array.isArray(metadata.tags) ? metadata.tags.map(String) : []

      prompts.push({
        id: String(metadata.id || slug),
        slug,
        title: String(metadata.title || humanize(slug)),
        description: String(metadata.description || 'A reusable prompt template for your workflow.'),
        profession,
        professionSlug: String(metadata.professionSlug || professionSlug),
        professionDescription: String(metadata.professionDescription || `A focused collection of reusable prompts for ${profession.toLowerCase()}.`),
        tags,
        updatedAt: String(metadata.updatedAt || ''),
        featured: metadata.featured === true,
        content: parsed.content.trim(),
      })
    } catch (error) {
      errors.push({ path: `/src/data/professions/${relativePath}`, message: error instanceof Error ? error.message : 'Invalid Markdown metadata' })
    }
  }

  prompts.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
  return { prompts, errors }
}

function promptCatalogPlugin() {
  return {
    name: 'prompt-catalog',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId) return `export const promptCatalog = ${JSON.stringify(loadPromptCatalog())}`
    },
    configureServer(server) {
      server.watcher.add(promptRoot)
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(promptRoot) && path.extname(file).toLowerCase() === '.md') {
        server.ws.send({ type: 'full-reload' })
        return []
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), promptCatalogPlugin()],
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
  preview: { host: '0.0.0.0' },
})
