import type { AliasToken, ProgressToken } from '../theme'

export function getProgressToken(token: AliasToken): ProgressToken {
  return {
    progress_height: 4,
    progress_track_color: token.colorFillSecondary,
    progress_color: token.colorPrimary,
    progress_circle_size: token.controlHeight,
    progress_circle_stroke_width: 4,
    progress_pivot_font_size: token.fontSizeSM,
    progress_pivot_color: token.colorPrimary,
    progress_animation_duration: 300,
  }
}
