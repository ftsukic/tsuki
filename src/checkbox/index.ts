import { Checkbox } from './checkbox'
import { CheckboxGroup } from './checkbox-group'

export const CheckboxWithGroup = Object.assign(Checkbox, { Group: CheckboxGroup })
export { CheckboxWithGroup as Checkbox }
export { CheckboxGroup }
export { getCheckboxToken } from './token'
export { useCheckboxGroup, useCheckboxState } from './state'
export type {
  CheckboxGroupProps,
  CheckboxDirection,
  CheckboxLabelPosition,
  CheckboxOption,
  CheckboxProps,
  CheckboxSemanticStyles,
  CheckboxShape,
  CheckboxStyleInfo,
  CheckboxStyleState,
  CheckboxStyles,
  CheckboxValue,
  CheckboxVariant,
} from './types'
