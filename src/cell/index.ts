import { Cell } from './cell'
import { CellGroup } from './group'

export const CellWithGroup = Object.assign(Cell, { Group: CellGroup })
export { CellWithGroup as Cell }
export { CellGroup }
export { getCellToken } from './token'
export type {
  CellArrowDirection,
  CellGroupSemanticStyles,
  CellGroupProps,
  CellProps,
  CellSemanticStyles,
  CellSize,
  CellStyleInfo,
  CellStyleState,
  CellStyles,
} from './interface'
