import { useControllableValue } from '../hooks'
import { useToken } from '../theme'
import type { NavTabProps } from './interface'
import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'

export function NavTab<T>({ options, theme, value, defaultValue, onChange }: NavTabProps<T>) {
  const { components } = useToken()
  const token = { ...components.NavTab, ...theme }
  const [selected, setSelected] = useControllableValue<T>({ value, defaultValue, onChange })

  return (
    <View style={{ flexDirection: 'row' }}>
      <View
        style={{
          backgroundColor: token.backgroundColor,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: token.paddingVertical,
          paddingHorizontal: token.paddingHorizontal,
          borderRadius: token.borderRadius,
          height: token.height,
        }}
      >
        {options?.map((item) => {
          const active = item.value === selected
          return (
            <View
              key={String(item.value)}
              style={{
                borderRadius: token.borderRadius,
                minWidth: token.itemMinWidth,
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: active ? token.activeBackgroundColor : 'transparent',
              }}
            >
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setSelected(item.value)}
                style={({ pressed }) => ({
                  opacity: pressed ? token.activeOpacity : 1,
                  paddingVertical: token.itemPaddingVertical,
                  paddingHorizontal: token.itemPaddingHorizontal,
                })}
              >
                <Text
                  suppressHighlighting
                  style={{
                    fontSize: token.fontSize,
                    lineHeight: token.lineHeight,
                    color: active ? token.activeTextColor : token.textColor,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default memo(NavTab) as typeof NavTab
