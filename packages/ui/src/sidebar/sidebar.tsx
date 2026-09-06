import { Badge } from '../badge'
import { Empty } from '../empty'
import { useControllableValue } from '../hooks'
import { Loading } from '../loading'
import { useLocale } from '../locale'
import { useToken } from '../theme'
import type { SidebarProps } from './interface'
import isNil from 'lodash/isNil'
import { memo } from 'react'
import { ScrollView, Text, TouchableHighlight, View } from 'react-native'

export function Sidebar({
  theme,
  width = 88,
  loading = false,
  options,
  empty,
  style,
  activeValue,
  defaultActiveValue,
  onChange,
  ...props
}: SidebarProps) {
  const { components } = useToken()
  const token = { ...components.Sidebar, ...theme }
  const locale = useLocale().Sidebar
  const [value, setValue] = useControllableValue<SidebarProps['activeValue']>(
    activeValue === undefined
      ? { defaultValue: defaultActiveValue, onChange }
      : { value: activeValue, onChange },
  )
  const activeIndex = options.findIndex((option) => option.value === value)
  const isEmpty = loading || options.length === 0
  return (
    <View
      {...props}
      style={[
        { flex: 1, width, backgroundColor: isEmpty ? undefined : token.itemBackgroundColor },
        style,
      ]}
    >
      <ScrollView
        bounces={false}
        contentContainerStyle={
          isEmpty ? { justifyContent: 'center', alignItems: 'center', flex: 1 } : undefined
        }
      >
        {loading ? <Loading vertical>{locale.labelLoading}</Loading> : null}
        {!loading && options.length === 0 ? (empty ?? <Empty text={locale.labelNoData} />) : null}
        {!loading && options.length > 0 ? (
          <View style={{ backgroundColor: token.backgroundColor }}>
            {options.map((option, index) => {
              const active = option.value === value
              return (
                <TouchableHighlight
                  key={String(option.value)}
                  underlayColor={token.underlayColor}
                  disabled={option.disabled}
                  onPress={() => setValue(option.value)}
                  style={{
                    overflow: 'hidden',
                    flexDirection: 'row',
                    backgroundColor: active ? token.backgroundColor : token.itemBackgroundColor,
                    borderBottomRightRadius: index + 1 === activeIndex ? token.borderRadius : 0,
                    borderTopRightRadius: index - 1 === activeIndex ? token.borderRadius : 0,
                  }}
                >
                  <>
                    <View
                      style={{
                        position: 'absolute',
                        left: -token.barWidth,
                        top: '50%',
                        marginTop: -token.barHeight / 2,
                        width: token.barWidth * 2,
                        height: token.barHeight,
                        borderRadius: token.barWidth,
                        backgroundColor: active ? token.barBackgroundColor : 'transparent',
                      }}
                    />
                    <View
                      style={{
                        paddingHorizontal: token.paddingHorizontal,
                        paddingVertical: token.paddingVertical,
                      }}
                    >
                      {!isNil(option.badge) ? (
                        <Badge {...option.badge}>
                          <Text
                            style={{
                              color: option.disabled
                                ? token.disabledTextColor
                                : active
                                  ? token.activeTextColor
                                  : token.inactiveTextColor,
                              fontSize: token.textFontSize,
                              lineHeight: token.textLineHeight,
                            }}
                          >
                            {option.label}
                          </Text>
                        </Badge>
                      ) : (
                        <Text
                          style={{
                            color: option.disabled
                              ? token.disabledTextColor
                              : active
                                ? token.activeTextColor
                                : token.inactiveTextColor,
                            fontSize: token.textFontSize,
                            lineHeight: token.textLineHeight,
                          }}
                        >
                          {option.label}
                        </Text>
                      )}
                    </View>
                  </>
                </TouchableHighlight>
              )
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}

export default memo(Sidebar)
