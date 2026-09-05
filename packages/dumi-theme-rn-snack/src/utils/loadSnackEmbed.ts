export const SNACK_EMBED_SCRIPT_ID = 'expo-snack-embed-script'
export const SNACK_EMBED_SCRIPT_URL = 'https://snack.expo.dev/embed.js'

export function ensureSnackEmbedScript(): void {
  if (typeof document === 'undefined' || document.getElementById(SNACK_EMBED_SCRIPT_ID)) {
    return
  }

  const script = document.createElement('script')
  script.id = SNACK_EMBED_SCRIPT_ID
  script.src = SNACK_EMBED_SCRIPT_URL
  script.async = true
  document.head.appendChild(script)
}
