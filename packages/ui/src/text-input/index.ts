import { NumberInput } from '../number-input/number-input'
import { PasswordInput } from '../password-input/password-input'
import { TextInput as BaseTextInput } from './text-input'

export const TextInput = Object.assign(BaseTextInput, {
  Number: NumberInput,
  Password: PasswordInput,
})

export type { TextInputInstance, TextInputProps } from './interface'
