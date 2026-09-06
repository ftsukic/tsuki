import { Cell as BaseCell } from './cell'
import { CellGroup } from './cell-group'
import { SwipeCellView } from './swipe-cell'

export const Cell = Object.assign(BaseCell, { Group: CellGroup, Swipe: SwipeCellView })
export { CellGroup }
export type {
  CellGroupProps,
  CellProps,
  SwipeCellAction,
  SwipeCellProps,
  SwipeCellRef,
} from './interface'
