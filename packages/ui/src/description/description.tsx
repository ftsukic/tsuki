import { getDefaultValue, renderTextLikeJSX } from '../helpers'
import { useToken } from '../theme'
import { useDescription } from './context'
import type { DescriptionProps } from './interface'
import isNil from 'lodash/isNil'
import { isValidElement, memo } from 'react'
import { View } from 'react-native'

export function Description({
  theme,
  colon,
  contentStyle,
  contentTextStyle,
  labelStyle,
  labelTextStyle,
  labelWidth,
  layout,
  size,
  numberOfLines,
  justify,
  align,
  label,
  text,
  hidden = false,
  bold = false,
  color,
  addonBefore,
  addonAfter,
  renderLabel,
  render,
  children,
  style,
  ...props
}: DescriptionProps) {
  const { components } = useToken()
  const token = { ...components.Description, ...theme }
  const context = useDescription()
  const resolved = {
    colon: getDefaultValue(colon, context.colon ?? true),
    contentStyle: getDefaultValue(contentStyle, context.contentStyle),
    contentTextStyle: getDefaultValue(contentTextStyle, context.contentTextStyle),
    labelStyle: getDefaultValue(labelStyle, context.labelStyle),
    labelTextStyle: getDefaultValue(labelTextStyle, context.labelTextStyle),
    labelWidth: getDefaultValue(labelWidth, context.labelWidth),
    layout: getDefaultValue(layout, context.layout ?? 'horizontal'),
    size: getDefaultValue(size, context.size ?? 'm'),
    numberOfLines: getDefaultValue(numberOfLines, context.numberOfLines),
    justify: getDefaultValue(justify, context.justify),
    align: getDefaultValue(align, context.align),
    empty: getDefaultValue(context.empty, '--'),
    showEmpty: getDefaultValue(context.showEmpty, false),
  }
  if (hidden) return null
  const sizeStyle =
    resolved.size === 'l'
      ? { fontSize: token.fontSizeLG, lineHeight: token.lineHeightLG }
      : resolved.size === 's'
        ? { fontSize: token.fontSizeSM, lineHeight: token.lineHeightSM }
        : { fontSize: token.fontSize, lineHeight: token.lineHeight }
  const renderText = (node: React.ReactNode) =>
    renderTextLikeJSX(
      node,
      [
        {
          color: color ?? token.textColor,
          ...sizeStyle,
          flexShrink: 1,
          fontWeight: bold ? 'bold' : undefined,
        },
        resolved.contentTextStyle,
      ],
      { numberOfLines: resolved.numberOfLines },
    )
  const content = isValidElement(children) ? children : renderText(!isNil(text) ? text : children)
  const renderedContent =
    (isNil(content) || text === '' || children === '') && resolved.showEmpty
      ? renderText(resolved.empty)
      : content
  const labelNode = renderLabel
    ? renderLabel(resolved.colon ? '：' : '')
    : label
      ? renderTextLikeJSX(`${label}${resolved.colon ? '：' : ''}`, [
          { color: token.labelColor, ...sizeStyle },
          resolved.labelTextStyle,
        ])
      : null
  const body = render ? (
    render(renderedContent, addonBefore, addonAfter)
  ) : (
    <>
      {addonBefore}
      {renderedContent}
      {addonAfter}
    </>
  )
  return (
    <View
      {...props}
      style={[
        {
          flexDirection: resolved.layout === 'horizontal' ? 'row' : 'column',
          justifyContent: resolved.justify,
          alignItems: resolved.align,
        },
        style,
      ]}
    >
      <View
        style={[
          resolved.labelWidth !== undefined && { width: resolved.labelWidth },
          resolved.labelStyle,
        ]}
      >
        {labelNode}
      </View>
      <View
        style={[
          { overflow: 'hidden', flex: 1, flexDirection: 'row', alignItems: 'center' },
          resolved.contentStyle,
        ]}
      >
        {body}
      </View>
    </View>
  )
}

export default memo(Description)
