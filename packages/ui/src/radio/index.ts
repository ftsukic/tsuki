import { Radio } from './radio'
import { RadioGroup } from './group'
import { RadioButton } from './button'

export const RadioWithGroup = Object.assign(Radio, { Group: RadioGroup, Button: RadioButton })
export { RadioWithGroup as Radio }
export { RadioGroup }
export { getRadioToken } from './token'
export type {
  RadioDirection,
  RadioButtonSize,
  RadioButtonStyle,
  RadioGroupProps,
  RadioLabelPosition,
  RadioOption,
  RadioOptionType,
  RadioProps,
  RadioSemanticStyles,
  RadioShape,
  RadioStyleInfo,
  RadioStyleState,
  RadioStyles,
  RadioValue,
} from './interface'
