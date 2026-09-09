export interface SwipeCellHandle {
  id: string
  close: () => void
}

/** Coordinates the single expanded SwipeCell within one Provider tree. */
export class SwipeCellManager {
  private activeCell: SwipeCellHandle | null = null

  claim(cell: SwipeCellHandle) {
    const previous = this.activeCell
    if (previous?.id === cell.id) {
      this.activeCell = cell
      return
    }

    this.activeCell = cell
    previous?.close()
  }

  release(id: string) {
    if (this.activeCell?.id === id) {
      this.activeCell = null
    }
  }

  closeOthers(id: string) {
    const active = this.activeCell
    if (active && active.id !== id) {
      active.close()
    }
  }

  closeActive() {
    this.activeCell?.close()
  }
}
