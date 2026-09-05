import {
  ensureSnackEmbedScript,
  SNACK_EMBED_SCRIPT_ID,
  SNACK_EMBED_SCRIPT_URL,
} from './loadSnackEmbed'

describe('ensureSnackEmbedScript', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  it('injects the embed script once', () => {
    ensureSnackEmbedScript()
    ensureSnackEmbedScript()

    const scripts = document.querySelectorAll(`#${SNACK_EMBED_SCRIPT_ID}`)
    expect(scripts).toHaveLength(1)
    expect(scripts[0]?.getAttribute('src')).toBe(SNACK_EMBED_SCRIPT_URL)
  })
})
