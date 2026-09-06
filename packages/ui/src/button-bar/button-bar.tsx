import { ActionSheet } from '../action-sheet'
import { BottomBar } from '../bottom-bar'
import { Button } from '../button'
import { useLocale } from '../locale'
import { Space } from '../space'
import { useToken } from '../theme'
import type { ButtonBarProps } from './interface'
import isArray from 'lodash/isArray'
import { memo, useState } from 'react'

export function ButtonBar({
  theme,
  alone = false,
  buttons,
  count = 4,
  moreText,
  blankSize = 'm',
  children,
  style,
  ...props
}: ButtonBarProps) {
  const locale = useLocale().ButtonBar
  const { components, token: themeToken } = useToken()
  const token = { ...components.ButtonBar, ...theme }
  const [sheetVisible, setSheetVisible] = useState(false)
  const realButtons = (buttons ?? []).filter((item) => !item.hidden)
  const isConfig = isArray(buttons)
  const showMore = realButtons.length > count
  const bottomButtons = showMore ? realButtons.slice(0, count - 1) : realButtons
  if (isConfig && realButtons.length === 0) return null
  const moreButtons = realButtons.slice(count - 1)
  return (
    <>
      <BottomBar
        {...props}
        style={[
          {
            paddingHorizontal:
              blankSize === 's'
                ? themeToken.sizeXS
                : blankSize === 'l'
                  ? themeToken.sizeLG
                  : themeToken.size,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          },
          alone && { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' },
          style,
        ]}
      >
        {isConfig ? (
          <Space
            justify="flex-end"
            align="center"
            direction="horizontal"
            gapHorizontal={token.buttonSpace}
          >
            {showMore ? (
              <Button
                type="link"
                text={moreText ?? locale.moreText}
                onPress={() => setSheetVisible(true)}
              />
            ) : null}
            {[...bottomButtons].reverse().map((button, index) => (
              <Button
                key={index}
                {...button}
                size={button.size ?? 'medium'}
                style={button.style ?? { minWidth: token.buttonMinWidth }}
              />
            ))}
          </Space>
        ) : (
          children
        )}
      </BottomBar>
      {showMore ? (
        <ActionSheet
          visible={sheetVisible}
          actions={moreButtons.map((button) => ({ name: button.text, callback: button.onPress }))}
          cancelText={locale.labelActionSheetCancelText}
          onCancel={() => setSheetVisible(false)}
          onSelect={(_, index) => {
            moreButtons[index].onPress?.()
            setSheetVisible(false)
          }}
          onPressOverlay={() => setSheetVisible(false)}
          onRequestClose={() => {
            setSheetVisible(false)
            return true
          }}
          onClosed={() => setSheetVisible(false)}
        />
      ) : null}
    </>
  )
}

export default memo(ButtonBar)
