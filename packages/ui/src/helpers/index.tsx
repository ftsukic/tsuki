/* eslint-disable @typescript-eslint/no-explicit-any */
import isNil from 'lodash/isNil'
import isUndefined from 'lodash/isUndefined'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import { isValidElement } from 'react'
import {
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type TouchableWithoutFeedbackProps,
  type ViewProps,
} from 'react-native'

export { default as easing } from './easing'

export function getArrowIconName(direction: 'left' | 'up' | 'right' | 'down' | undefined) {
  if (direction === 'left') return 'LeftOutlined' as const
  if (direction === 'up') return 'UpOutlined' as const
  if (direction === 'down') return 'DownOutlined' as const
  return 'RightOutlined' as const
}

export type DateColumnMode = 'Y' | 'M' | 'D' | 'h' | 'm' | 's'

export function formatDate(mode: string, date: Date) {
  const modes = mode.split('-')
  const has = (key: DateColumnMode) => modes.includes(key)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  const datePart = [
    has('Y') ? date.getFullYear() : null,
    has('M') ? pad(date.getMonth() + 1) : null,
    has('D') ? pad(date.getDate()) : null,
  ]
    .filter((value) => value !== null)
    .join('-')
  const timePart = [
    has('h') ? pad(date.getHours()) : null,
    has('m') ? pad(date.getMinutes()) : null,
    has('s') ? pad(date.getSeconds()) : null,
  ]
    .filter((value) => value !== null)
    .join(':')
  return [datePart, timePart].filter(Boolean).join(' ')
}

export function formatThousandths(value: string, sign = ',') {
  const parts = value.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sign)
  return parts.join('.')
}

export function formatNumber(value: string, allowDot = true, allowMinus = true) {
  if (!allowDot) value = value.split('.')[0]
  else value = value.replace(/\.(?=.*\.)/g, '')
  if (!allowMinus) value = value.replace(/-/g, '')
  else if (value.indexOf('-') > 0) value = value.replace(/-/g, '')
  return value.replace(allowDot ? /[^-0-9.]/g : /[^-0-9]/g, '')
}

export function formatDecimal(value: string, decimals: number) {
  const normalized = formatNumber(value)
  if (decimals < 0) return normalized
  const [integer, decimal = ''] = normalized.replace(/^-/, '').split('.')
  const sign = normalized.startsWith('-') ? '-' : ''
  return `${sign}${integer}${decimals === 0 || !decimal ? '' : `.${decimal.slice(0, decimals)}`}`
}

export const getDefaultValue = <T,>(value: T, defaultValue: T): T =>
  !isUndefined(value) ? value : defaultValue

export function renderTextLikeJSX(
  node: React.ReactNode,
  style: StyleProp<TextStyle>,
  restProps?: Omit<TextProps, 'style'>,
) {
  if (isNil(node)) return null
  return isValidElement(node) ? (
    node
  ) : (
    <Text {...restProps} style={style}>
      {node}
    </Text>
  )
}

export const touchablePropsFields: (keyof TouchableWithoutFeedbackProps)[] = [
  'delayLongPress',
  'delayPressIn',
  'delayPressOut',
  'disabled',
  'hitSlop',
  'onBlur',
  'onFocus',
  'onLongPress',
  'onPress',
  'onPressIn',
  'onPressOut',
  'pressRetentionOffset',
]

export function isTouchableNode(props: TouchableWithoutFeedbackProps) {
  return Object.keys(props).some(
    (key) =>
      touchablePropsFields.includes(key as keyof TouchableWithoutFeedbackProps) &&
      !isNil(props[key as keyof TouchableWithoutFeedbackProps]),
  )
}

export function pickTouchablePropsField(props: Partial<ViewProps & TouchableWithoutFeedbackProps>) {
  return pick(props, touchablePropsFields)
}

export function omitTouchablePropsField(props: ViewProps) {
  return omit(props, touchablePropsFields)
}

export function attachPropertiesToComponent<C, P extends Record<string, any>>(
  component: C,
  properties: P,
): C & P {
  const target = component as C & P
  Object.assign(target, properties)
  return target
}

export type Interceptor = (
  ...args: any[]
) => Promise<boolean> | boolean | undefined | Promise<void> | void

export function callInterceptor(
  interceptor: Interceptor | undefined,
  { args = [], done, canceled }: { args?: unknown[]; done: () => void; canceled?: () => void },
) {
  if (!interceptor) return done()
  const result = interceptor(...args)
  if (result && typeof (result as Promise<unknown>).then === 'function') {
    void (result as Promise<boolean | undefined>)
      .then((value) => (value === undefined || value ? done() : canceled?.()))
      .catch(() => undefined)
  } else if (result === undefined || result) done()
  else canceled?.()
}

export const isObject = (value: unknown): value is Record<any, any> =>
  value !== null && typeof value === 'object'
export const isPromise = <T = unknown,>(value: unknown): value is Promise<T> =>
  isObject(value) && typeof value.then === 'function' && typeof value.catch === 'function'

let zIndex = 2000
export const getNextZIndex = () => ++zIndex

export type FixHitSlopProps<T> = Omit<T, 'hitSlop'> & Pick<ViewProps, 'hitSlop'>
export type ExcludeUndefined<T> = Exclude<T, undefined>
export type ExcludeUndefinedNull<T> = Exclude<T, undefined | null>
