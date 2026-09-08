import { Children, isValidElement, useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { ButtonGroupContext } from './context'
import type { ButtonGroupPosition } from './context'
import type { ButtonGroupProps } from './interface'
import { getButtonToken } from './token'
import { useComponentToken } from '../theme'

export function getButtonGroupConnectedStyle(
  position: ButtonGroupPosition | undefined,
  borderWidth: number,
  block = false,
): ViewStyle | undefined {
  if (position === undefined) return undefined

  const marginLeft = borderWidth > 0 ? -borderWidth : 0
  const blockStyle = block ? { flex: 1, minWidth: 0 } : {}

  if (position === 'only') return block ? blockStyle : undefined

  if (position === 'first') {
    return {
      ...blockStyle,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    }
  }

  if (position === 'middle') {
    return {
      ...blockStyle,
      borderRadius: 0,
      marginLeft,
    }
  }

  return {
    ...blockStyle,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft,
  }
}

function getButtonGroupPosition(index: number, count: number): ButtonGroupPosition {
  if (count === 1) return 'only'
  if (index === 0) return 'first'
  if (index === count - 1) return 'last'
  return 'middle'
}

export function ButtonGroup({
  children,
  size,
  shape = 'default',
  block = false,
  style,
  ...viewProps
}: ButtonGroupProps) {
  const buttonToken = useComponentToken('Button', getButtonToken)
  const childArray = Children.toArray(children)
  const groupContext = useMemo(() => ({ size, shape, block }), [block, shape, size])
  const borderRadius = shape === 'round' ? buttonToken.borderRadiusRound : buttonToken.borderRadius

  return (
    <ButtonGroupContext.Provider value={groupContext}>
      <View
        {...viewProps}
        style={[
          {
            borderRadius,
            flexDirection: 'row',
            alignSelf: block ? 'stretch' : 'auto',
          },
          style,
        ]}
      >
        {childArray.map((child, index) => {
          const position = getButtonGroupPosition(index, childArray.length)
          const childContext = { size, shape, block, position }
          const key = isValidElement(child) && child.key !== null ? child.key : index

          return (
            <ButtonGroupContext.Provider key={key} value={childContext}>
              {child}
            </ButtonGroupContext.Provider>
          )
        })}
      </View>
    </ButtonGroupContext.Provider>
  )
}
