export type OverlayTransitionChannel = 'mask' | 'content'

export interface OverlayTransitionCompletion {
  complete(channel: OverlayTransitionChannel): void
  cancel(): void
}

export function createTransitionCompletion(
  channels: readonly OverlayTransitionChannel[],
  onComplete: () => void,
): OverlayTransitionCompletion {
  const pending = new Set(channels)
  let active = true

  return {
    complete(channel) {
      if (!active || !pending.delete(channel) || pending.size > 0) return
      active = false
      onComplete()
    },
    cancel() {
      active = false
      pending.clear()
    },
  }
}
