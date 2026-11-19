import { CellRoot } from './cell'
import { CellGroup } from './cell-group'

export const Cell = Object.assign(CellRoot, { Group: CellGroup })
export { CellGroup }
export type {
  CellArrowDirection,
  CellClassNames,
  CellGroupClassNames,
  CellGroupProps,
  CellGroupStyles,
  CellProps,
  CellSize,
  CellStyles,
} from './types'
