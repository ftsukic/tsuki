import { Children } from 'react'
import { Text, View } from 'react-native'
import { Divider } from '../divider'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { CellGroupItem } from './context'
import type { CellGroupPosition } from './context'
import type { CellGroupProps } from './interface'
import { getCellToken } from './token'

function isVisible(value: CellGroupProps['title']): boolean {
  return value !== null && value !== undefined && value !== false
}

function getPosition(index: number, count: number): CellGroupPosition {
  if (count === 1 || index === count - 1) return 'last'
  if (index === 0) return 'first'
  return 'middle'
}

export function CellGroup({
  children,
  testID,
  title,
  extra,
  inset = false,
  border = true,
  style,
  styles,
}: CellGroupProps) {
  const token = useComponentToken('Cell', getCellToken)
  const semantic = resolveStyles(styles, {
    props: { children, testID, title, extra, inset, border, style, styles },
    state: {},
  })
  const childItems = Children.toArray(children)
  const hasHeader = isVisible(title) || isVisible(extra)
  const titlePaddingHorizontal = inset
    ? token.groupInsetTitlePaddingHorizontal
    : token.groupTitlePaddingHorizontal
  const titlePaddingVertical = inset
    ? token.groupInsetTitlePaddingVertical
    : token.groupTitlePaddingVertical
  const renderChildren = () =>
    childItems.map((child, index) => (
      <CellGroupItem key={index} position={getPosition(index, childItems.length)}>
        {child}
      </CellGroupItem>
    ))

  return (
    <View testID={testID} style={[semantic?.root, style]}>
      {hasHeader ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: titlePaddingHorizontal,
            paddingVertical: titlePaddingVertical,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            {typeof title === 'string' || typeof title === 'number' ? (
              <Text
                style={[
                  {
                    color: token.groupTitleColor,
                    fontFamily: token.fontFamily,
                    fontSize: token.groupTitleFontSize,
                    lineHeight: token.groupTitleLineHeight,
                  },
                  semantic?.title,
                ]}
              >
                {title}
              </Text>
            ) : (
              title
            )}
          </View>
          {typeof extra === 'string' || typeof extra === 'number' ? (
            <Text
              style={[
                {
                  color: token.extraColor,
                  fontFamily: token.fontFamily,
                  fontSize: token.extraFontSize,
                  lineHeight: token.extraLineHeight,
                  flexShrink: 1,
                },
                semantic?.extra,
              ]}
            >
              {extra}
            </Text>
          ) : (
            extra
          )}
        </View>
      ) : null}

      <View
        style={[
          {
            position: 'relative',
            backgroundColor: token.groupBackgroundColor,
            marginHorizontal: inset ? token.groupInsetMarginHorizontal : 0,
            borderRadius: inset ? token.insetRadius : 0,
            overflow: inset ? 'hidden' : 'visible',
          },
          semantic?.body,
        ]}
      >
        {border && !inset ? (
          <>
            <Divider
              color={token.groupBorderColor}
              style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
              thickness={token.groupBorderWidth}
            />
            {renderChildren()}
            <Divider
              color={token.groupBorderColor}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
              thickness={token.groupBorderWidth}
            />
          </>
        ) : (
          renderChildren()
        )}
      </View>
    </View>
  )
}
