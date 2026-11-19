import { componentCatalog } from './catalog'
import type { FixtureVersion } from './catalog'

export const fixtureVersionLabel: Record<FixtureVersion, string> = {
  v1: 'Legacy v1',
  v2: 'v2',
}

// Catalog order is set by the manifest. Preserve it even when searching.
export const componentCategories = [...new Set(componentCatalog.map((item) => item.category))].map(
  (title) => {
    const data = componentCatalog.filter((item) => item.category === title)
    return { title, data, version: data[0].version }
  },
)
