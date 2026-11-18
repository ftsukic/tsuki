import { Fragment, isValidElement, type ReactNode } from 'react'
import { View } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { Icon } from '../icon'
import type { IconName } from '../icon'
import { Text } from '../text'
import type { CellToken } from '../theme'
import type { CellLayoutState } from './normalize'
import type { CellResolvedStyles } from './style'
import type { CellProps, CellSemanticStyles } from './types'

const ARROW_ICONS: Record<NonNullable<CellProps['arrowDirection']>, IconName> = {
  right: 'RightOutlined',
  left: 'LeftOutlined',
  up: 'UpOutlined',
  down: 'DownOutlined',
}

function renderText(value: ReactNode, style: StyleProp<TextStyle>, numberOfLines?: number) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Text numberOfLines={numberOfLines} style={style}>
        {value}
      </Text>
    )
  }
  if (Array.isArray(value)) {
    return value.map((child, index) => (
      <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
        {renderText(child, style, numberOfLines)}
      </Fragment>
    ))
  }
  if (isValidElement<{ children?: ReactNode }>(value) && value.type === Fragment) {
    return (
      <Fragment key={value.key}>{renderText(value.props.children, style, numberOfLines)}</Fragment>
    )
  }
  return value
}

interface CellLayoutProps {
  props: CellProps
  layout: CellLayoutState
  resolved: CellResolvedStyles
  semantic?: CellSemanticStyles
  token: CellToken
}

/** Private rendering boundary; never exported through the component barrel. */
export function CellLayout({ props, layout, resolved, semantic, token }: CellLayoutProps) {
  return (
    <View style={[resolved.container, semantic?.container]}>
      {layout.hasLeading ? (
        <View style={[resolved.leading, semantic?.leading]}>
          {renderText(props.leading, resolved.title)}
        </View>
      ) : null}
      <View style={resolved.main}>
        {layout.hasTitleArea ? (
          <View style={[resolved.titleContainer, semantic?.titleContainer]}>
            {layout.hasTitle || layout.hasTitleExtra || props.required ? (
              <View style={resolved.titleRow}>
                {props.required ? (
                  <Text style={[resolved.required, semantic?.required]}>*</Text>
                ) : null}
                {layout.hasTitle
                  ? renderText(props.title, [resolved.title, semantic?.title], props.titleLines)
                  : null}
                {layout.hasTitleExtra ? (
                  <View style={[resolved.titleExtraContainer, semantic?.titleExtraContainer]}>
                    {renderText(props.titleExtra, [resolved.titleExtra, semantic?.titleExtra])}
                  </View>
                ) : null}
              </View>
            ) : null}
            {layout.hasDescription
              ? renderText(props.description, [resolved.description, semantic?.description])
              : null}
          </View>
        ) : null}
        {layout.hasValueArea ? (
          <View style={[resolved.valueContainer, semantic?.valueContainer]}>
            {layout.hasValue
              ? renderText(props.value, [resolved.value, semantic?.value], props.valueLines)
              : null}
            {layout.hasValueExtra ? (
              <View style={[resolved.valueExtraContainer, semantic?.valueExtraContainer]}>
                {renderText(props.valueExtra, [resolved.valueExtra, semantic?.valueExtra])}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      {layout.hasTrailing ? (
        <View style={[resolved.trailingContainer, semantic?.trailingContainer]}>
          {renderText(props.trailing, [resolved.trailing, semantic?.trailing])}
        </View>
      ) : null}
      {props.showArrow ? (
        <View style={[resolved.arrow, semantic?.arrow]}>
          <Icon
            name={ARROW_ICONS[props.arrowDirection ?? 'right']}
            size={token.iconSize}
            color={token.iconColor}
          />
        </View>
      ) : null}
    </View>
  )
}
