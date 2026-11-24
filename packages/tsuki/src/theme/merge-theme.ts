import { getDefaultTheme } from './defaults'
import { mergeMotionConfig } from '../motion/config'
import type { ResolvedTheme, ThemeConfig } from './types'

export function mergeTheme(parent: ResolvedTheme, override?: ThemeConfig): ResolvedTheme {
  const base = override?.inherit === false ? getDefaultTheme(parent.scheme) : parent

  return {
    scheme: parent.scheme,
    motion: mergeMotionConfig(base.motion, override?.motion),
    semantic: { ...base.semantic, ...override?.semantic },
    components: {
      Button: { ...base.components.Button, ...override?.components?.Button },
      Card: { ...base.components.Card, ...override?.components?.Card },
      Cell: { ...base.components.Cell, ...override?.components?.Cell },
      Divider: { ...base.components.Divider, ...override?.components?.Divider },
      Dialog: { ...base.components.Dialog, ...override?.components?.Dialog },
      Popup: { ...base.components.Popup, ...override?.components?.Popup },
      Input: { ...base.components.Input, ...override?.components?.Input },
      Surface: { ...base.components.Surface, ...override?.components?.Surface },
    },
  }
}
