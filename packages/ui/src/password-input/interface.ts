import type { TextInputProps } from '../text-input/interface'

export interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry' | 'suffix'> {
  showPasswordText?: string
  hidePasswordText?: string
}
