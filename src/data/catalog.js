import { promptCatalog } from 'virtual:prompt-catalog'

export function getCatalog() {
  const professionMap = new Map()
  for (const prompt of promptCatalog.prompts) {
    if (!professionMap.has(prompt.professionSlug)) {
      professionMap.set(prompt.professionSlug, {
        slug: prompt.professionSlug,
        name: prompt.profession,
        description: prompt.professionDescription,
        prompts: [],
      })
    }
    professionMap.get(prompt.professionSlug).prompts.push(prompt)
  }

  const professions = [...professionMap.values()].sort((a, b) => a.name.localeCompare(b.name))
  return { prompts: promptCatalog.prompts, professions, errors: promptCatalog.errors }
}
