import { Children, Fragment, isValidElement, type ReactNode } from 'react'
import { View } from 'react-native'
import { Divider } from '../divider'
import { resolveStyles } from '../style'
import { Text } from '../text'
import { useComponentToken } from '../theme'
import { CellGroupItem } from './context'
import type { CellGroupPosition } from './context'
import type { CellGroupProps } from './types'
import { getCellToken } from './token'

function isVisible(value: CellGroupProps['title']): boolean {
  return value !== null && value !== undefined && value !== false
}

function getPosition(index: number, count: number): CellGroupPosition {
  if (count === 1 || index === count - 1) return 'last'
  if (index === 0) return 'first'
  return 'middle'
}

function flattenCellGroupChildren(
  children: ReactNode,
  parentKey = '',
): { child: ReactNode; key: string }[] {
  return Children.toArray(children).flatMap((child, index) => {
    const key = `${parentKey}/${isValidElement(child) ? child.key : index}`
    if (isValidElement(child) && child.type === Fragment) {
      return flattenCellGroupChildren((child.props as { children?: ReactNode }).children, key)
    }
    return [{ child, key }]
  })
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
  const childItems = flattenCellGroupChildren(children)
  const hasHeader = isVisible(title) || isVisible(extra)
  const titlePaddingHorizontal = inset
    ? token.groupInsetTitlePaddingHorizontal
    : token.groupTitlePaddingHorizontal
  const titlePaddingVertical = inset
    ? token.groupInsetTitlePaddingVertical
    : token.groupTitlePaddingVertical
  const renderChildren = () =>
    childItems.map(({ child, key }, index) => (
      <CellGroupItem key={key} position={getPosition(index, childItems.length)}>
        {child}
      </CellGroupItem>
    ))

  return (
    <View testID={testID} style={[semantic?.root, style]}>
      {hasHeader ? (
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: titlePaddingHorizontal,
              paddingVertical: titlePaddingVertical,
            },
            semantic?.header,
          ]}
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
          {isVisible(extra) ? (
            <View style={[{ flexShrink: 0, marginLeft: token.iconGap }, semantic?.extraContainer]}>
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
        {renderChildren()}
        {border && !inset ? (
          <>
            <Divider
              accessible={false}
              color={token.groupBorderColor}
              role="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
              thickness={token.groupBorderWidth}
            />
            <Divider
              accessible={false}
              color={token.groupBorderColor}
              role="none"
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
              thickness={token.groupBorderWidth}
            />
          </>
        ) : null}
      </View>
    </View>
  )
}
