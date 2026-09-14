import { Radio } from './radio'
import { RadioGroup } from './radio-group'

export const RadioWithGroup = Object.assign(Radio, { Group: RadioGroup })
export { RadioWithGroup as Radio }
export { RadioGroup }
export { getRadioToken } from './token'
export type {
  RadioDirection,
  RadioGroupProps,
  RadioLabelPosition,
  RadioOption,
  RadioProps,
  RadioSemanticStyles,
  RadioShape,
  RadioStyleInfo,
  RadioStyleState,
  RadioStyles,
  RadioValue,
  RadioVariant,
} from './types'
