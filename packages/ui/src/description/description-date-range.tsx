import { formatDate, renderTextLikeJSX } from '../helpers'
import { useLocale } from '../locale'
import { useToken } from '../theme'
import { useDescription } from './context'
import Description from './description'
import type { DescriptionDateRangeProps } from './interface'
import isNil from 'lodash/isNil'
import { memo } from 'react'
import { View } from 'react-native'

export function DescriptionDateRange({
  text,
  mode = 'Y-m',
  split,
  ...props
}: DescriptionDateRangeProps) {
  const locale = useLocale().DescriptionDateRange
  const { components } = useToken()
  const context = useDescription()
  const start = !isNil(text?.[0]) ? formatDate(mode, text[0]) : null
  const end = !isNil(text?.[1]) ? formatDate(mode, text[1]) : null
  if (isNil(start) && isNil(end)) return <Description {...props} />
  const size = props.size ?? context.size ?? 'm'
  const sizeStyle =
    size === 'l'
      ? {
          fontSize: components.Description.fontSizeLG,
          lineHeight: components.Description.lineHeightLG,
        }
      : size === 's'
        ? {
            fontSize: components.Description.fontSizeSM,
            lineHeight: components.Description.lineHeightSM,
          }
        : {
            fontSize: components.Description.fontSize,
            lineHeight: components.Description.lineHeight,
          }
  const textStyle = [
    {
      color: props.color ?? components.Description.textColor,
      ...sizeStyle,
      fontWeight: props.bold ? ('bold' as const) : undefined,
    },
    props.contentTextStyle,
  ]
  return (
    <Description {...props}>
      <View>
        {renderTextLikeJSX(`${start} ${split ?? locale.split}`, textStyle)}
        {renderTextLikeJSX(end, textStyle)}
      </View>
    </Description>
  )
}
export default memo(DescriptionDateRange)
