/** Input recognition delay, independent of animation duration and Reduced Motion. */
const CONTENT_PRESS_DELAY = 80

export class SwipeCellPressFeedback {
  readonly delay = CONTENT_PRESS_DELAY
  cancelled = false
  generation = 0
  private touching = false
  private listeners = new Set<() => void>()

  begin() {
    if (this.touching) return
    this.touching = true
    this.generation += 1
    this.cancelled = false
  }

  cancel() {
    if (this.cancelled) return
    this.cancelled = true
    this.listeners.forEach((listener) => listener())
  }

  end() {
    this.cancel()
    this.touching = false
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}
