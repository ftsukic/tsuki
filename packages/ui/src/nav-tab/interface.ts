import type { NavTabToken } from '../theme'

export interface NavTabOption<T> {
  value: T
  label: string
}

export interface NavTabProps<T> {
  theme?: Partial<NavTabToken>
  value?: T
  defaultValue?: T
  options?: NavTabOption<T>[]
  onChange?: (value: T) => void
}
