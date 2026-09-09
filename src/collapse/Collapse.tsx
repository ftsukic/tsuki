import { Children, forwardRef, isValidElement, useCallback, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { View } from 'react-native'
import type { View as ViewComponent } from 'react-native'
import { useComponentToken } from '../theme'
import { CollapseContext } from './context'
import { CollapseItem } from './CollapseItem'
import { getCollapseDividerStyle, getCollapseRootStyle } from './style'
import { getCollapseToken } from './token'
import type { CollapseItemProps, CollapseName, CollapseProps, CollapseValue } from './types'

function normalizeActiveNames(value: CollapseValue | undefined, accordion: boolean): CollapseValue {
  if (accordion) {
    if (Array.isArray(value)) return value[0] ?? ''
    return value ?? ''
  }

  if (Array.isArray(value)) return value
  return value === undefined || value === '' ? [] : [value]
}

function isCollapseItemElement(value: unknown): value is ReactElement<CollapseItemProps> {
  return isValidElement(value) && value.type === CollapseItem
}

function sameName(left: CollapseName, right: CollapseName) {
  return Object.is(left, right)
}

const CollapseComponent = forwardRef<ViewComponent, CollapseProps>(function Collapse(
  {
    children,
    value,
    defaultValue,
    accordion = false,
    border = true,
    onChange,
    style,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Collapse', getCollapseToken)
  const [uncontrolledValue, setUncontrolledValue] = useState<CollapseValue>(() =>
    normalizeActiveNames(defaultValue, accordion),
  )
  const isControlled = value !== undefined
  const activeValue = normalizeActiveNames(isControlled ? value : uncontrolledValue, accordion)
  const items = useMemo(() => Children.toArray(children).filter(isCollapseItemElement), [children])

  const isActive = useCallback(
    (name: CollapseName) => {
      if (accordion) return !Array.isArray(activeValue) && sameName(activeValue, name)
      return (
        Array.isArray(activeValue) && activeValue.some((activeName) => sameName(activeName, name))
      )
    },
    [accordion, activeValue],
  )

  const toggle = useCallback(
    (name: CollapseName) => {
      let nextValue: CollapseValue

      if (accordion) {
        nextValue = !Array.isArray(activeValue) && sameName(activeValue, name) ? '' : name
      } else {
        const currentNames = Array.isArray(activeValue) ? activeValue : []
        const exists = currentNames.some((activeName) => sameName(activeName, name))
        nextValue = exists
          ? currentNames.filter((activeName) => !sameName(activeName, name))
          : [...currentNames, name]
      }

      if (!isControlled) setUncontrolledValue(nextValue)
      onChange?.(nextValue)
    },
    [accordion, activeValue, isControlled, onChange],
  )

  const contextValue = useMemo(() => ({ border, isActive, toggle }), [border, isActive, toggle])

  return (
    <CollapseContext.Provider value={contextValue}>
      <View ref={ref} {...viewProps} style={[getCollapseRootStyle(token, border), style]}>
        {items.map((item, index) => (
          <View key={item.key ?? index} style={{ position: 'relative' }}>
            {item}
            {border && index > 0 ? (
              <View pointerEvents="none" style={getCollapseDividerStyle(token)} />
            ) : null}
          </View>
        ))}
      </View>
    </CollapseContext.Provider>
  )
})

CollapseComponent.displayName = 'Collapse'

export const Collapse = CollapseComponent
