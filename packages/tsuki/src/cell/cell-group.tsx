import { isValidElement } from 'react'
import { View } from 'react-native'
import type { TextStyle, ViewStyle } from 'react-native'
import { Divider } from '../divider'
import { cn } from '../style/cn'
import { Surface } from '../surface'
import { useTsukiTheme } from '../theme/theme'
import { CellRoot } from './cell'
import { CellGroupContext } from './context'
import { flattenGroup, hasContent, renderCellText } from './normalize'
import { cellSlot } from './style'
import type { CellGroupProps } from './types'

export function CellGroup({
  children,
  title,
  extra,
  inset = false,
  border = true,
  className,
  classNames,
  style,
  styles,
  ...viewProps
}: CellGroupProps) {
  const {
    semantic,
    components: { Cell: tokens },
  } = useTsukiTheme()
  const items = flattenGroup(children)
  const cells = items.filter(({ child }) => isValidElement(child) && child.type === CellRoot)
  const first = cells[0]
  const last = cells.at(-1)
  const hasTitle = hasContent(title)
  const hasExtra = hasContent(extra)
  const heading = (slot: 'title' | 'extra') =>
    cellSlot<TextStyle>(
      {},
      '',
      { color: semantic.colorMuted, fontSize: tokens.fontSize, lineHeight: tokens.lineHeight },
      classNames?.[slot],
      styles?.[slot],
    )

  const body = (
    <Surface
      padding={0}
      radius={inset ? tokens.groupRadius : 0}
      overflow={inset ? 'hidden' : 'visible'}
      bordered={inset && border}
      borderWidth={tokens.dividerWidth}
      className={classNames?.body}
      style={styles?.body}
    >
      {items.map((item) => {
        const { child, key } = item
        if (!isValidElement(child) || child.type !== CellRoot) {
          return (
            <CellGroupContext.Provider key={key} value={null}>
              {renderCellText(child, heading('title'))}
            </CellGroupContext.Provider>
          )
        }
        return (
          <CellGroupContext.Provider
            key={key}
            value={item === last ? 'last' : item === first ? 'first' : 'middle'}
          >
            {child}
          </CellGroupContext.Provider>
        )
      })}
      {border && !inset && (
        <>
          <Divider
            accessible={false}
            role="none"
            thickness={tokens.dividerWidth}
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
          />
          <Divider
            accessible={false}
            role="none"
            thickness={tokens.dividerWidth}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
          />
        </>
      )}
    </Surface>
  )

  return (
    <View
      {...viewProps}
      {...cellSlot<ViewStyle>({}, '', {}, cn(classNames?.root, className), [styles?.root, style])}
    >
      {(hasTitle || hasExtra) && (
        <View
          {...cellSlot<ViewStyle>(
            { flexDirection: 'row', alignItems: 'center' },
            'flex-row items-center',
            {
              paddingHorizontal: tokens.groupTitlePaddingHorizontal,
              paddingVertical: tokens.groupTitlePaddingVertical,
              gap: tokens.gap,
            },
            classNames?.header,
            styles?.header,
          )}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            {hasTitle && renderCellText(title, heading('title'))}
          </View>
          {hasExtra && (
            <View
              {...cellSlot<ViewStyle>(
                { flexShrink: 0, maxWidth: '50%' },
                'shrink-0 max-w-[50%]',
                {},
                classNames?.extraContainer,
                styles?.extraContainer,
              )}
            >
              {renderCellText(extra, heading('extra'))}
            </View>
          )}
        </View>
      )}
      {inset ? (
        <View style={{ marginHorizontal: tokens.groupInsetMarginHorizontal }}>{body}</View>
      ) : (
        body
      )}
    </View>
  )
}
