import { renderTextLikeJSX } from '../helpers'
import { Icon } from '../icon'
import { useToken } from '../theme'
import type { StepsItemProps, StepsProps } from './interface'
import { memo, useRef } from 'react'
import { Dimensions, ScrollView, View } from 'react-native'

const MAX_STEPS = 3

function Step({
  index,
  title,
  icon,
  status,
  current,
  count,
  token,
}: StepsItemProps & {
  current: number
  count: number
  token: ReturnType<typeof useToken>['components']['Steps']
}) {
  const finished = status ? status === 'finish' : current >= index
  const width = Dimensions.get('window').width / MAX_STEPS
  const iconNode =
    icon ??
    (finished ? (
      <View
        style={{
          width: token.activeDotSize,
          height: token.activeDotSize,
          borderRadius: token.dotSize,
          backgroundColor: token.activeDotBackgroundColor,
          justifyContent: 'center',
        }}
      >
        <Icon name="CheckOutlined" color={token.backgroundColor} size={token.iconSuccessSize} />
      </View>
    ) : (
      <View
        style={{
          width: token.dotSize,
          height: token.dotSize,
          borderRadius: token.dotSize,
          backgroundColor: token.dotColor,
        }}
      />
    ))
  return (
    <View style={{ width, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {index > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: token.activeDotSize / 2,
            left: 0,
            right: '50%',
            height: token.lineWidth,
            backgroundColor:
              current < index ? token.lineNormalColor : token.activeDotBackgroundColor,
          }}
        />
      ) : null}
      {index < count - 1 ? (
        <View
          style={{
            position: 'absolute',
            top: token.activeDotSize / 2,
            left: '50%',
            right: 0,
            height: token.lineWidth,
            backgroundColor:
              current <= index ? token.lineNormalColor : token.activeDotBackgroundColor,
          }}
        />
      ) : null}
      <View
        style={{
          height: token.activeDotSize,
          justifyContent: 'center',
          backgroundColor: token.backgroundColor,
          paddingHorizontal: token.iconPaddingHorizontal,
          position: 'relative',
          zIndex: 10,
          marginBottom: token.iconMarginBottom,
        }}
      >
        {iconNode}
      </View>
      {renderTextLikeJSX(title, {
        fontSize: token.titleSize,
        color: finished ? token.titleColor : token.dotColor,
        marginHorizontal: token.titleMarginHorizontal,
      })}
    </View>
  )
}

export function Steps({ current, data, style, theme }: StepsProps) {
  const { components } = useToken()
  const token = { ...components.Steps, ...theme }
  const scrollRef = useRef<ScrollView>(null)
  if (!data?.length) return null
  const inner = (
    <View
      style={[
        {
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'center',
          position: 'relative',
        },
        style,
      ]}
    >
      {data.map((item, index) => (
        <Step
          key={index}
          {...item}
          index={index}
          current={current}
          count={data.length}
          token={token}
        />
      ))}
    </View>
  )
  return (
    <View
      style={{
        backgroundColor: token.backgroundColor,
        paddingVertical: token.paddingVertical,
        paddingHorizontal: token.paddingHorizontal,
      }}
    >
      {data.length > MAX_STEPS ? (
        <ScrollView horizontal ref={scrollRef}>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </View>
  )
}

export default memo(Steps)
