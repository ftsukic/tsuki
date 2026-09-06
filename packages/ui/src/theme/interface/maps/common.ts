import type { StyleMapToken } from './style'

export interface CommonMapToken extends StyleMapToken {
  /** RN stores antd's CSS-second durations as numeric seconds in MapToken. */
  motionDurationFast: number
  motionDurationMid: number
  motionDurationSlow: number
}
