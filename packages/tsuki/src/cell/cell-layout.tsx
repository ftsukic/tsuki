import { createElement } from 'react'
import { View } from 'react-native'
import type { ViewProps } from 'react-native'
import { Icon } from '../icon'
import { cn } from '../style/cn'
import { semanticClassName } from '../style/semantic'
import { useTsukiTheme } from '../theme/theme'
import { hasContent, renderCellText } from './normalize'
import type { CellProps, CellStyles } from './types'

type ViewSlot = Exclude<
  keyof CellStyles,
  'title' | 'titleExtra' | 'description' | 'value' | 'valueExtra' | 'trailing' | 'required'
>
type TextSlot = Exclude<keyof CellStyles, ViewSlot>

const alignments = {
  left: ['justify-start', 'text-left'],
  center: ['justify-center', 'text-center'],
  right: ['justify-end', 'text-right'],
} as const
const arrowRotation = { up: -90, down: 90, left: undefined, right: undefined }

export function CellLayout({
  leading,
  title,
  titleExtra,
  description,
  value,
  valueExtra,
  trailing,
  vertical = false,
  center = false,
  valueAlign = vertical ? 'left' : 'right',
  required,
  arrowDirection = 'right',
  showArrow,
  size,
  titleLines,
  valueLines,
  classNames,
  styles,
}: Pick<
  CellProps,
  | 'leading'
  | 'title'
  | 'titleExtra'
  | 'description'
  | 'value'
  | 'valueExtra'
  | 'trailing'
  | 'vertical'
  | 'center'
  | 'valueAlign'
  | 'required'
  | 'arrowDirection'
  | 'showArrow'
  | 'size'
  | 'titleLines'
  | 'valueLines'
  | 'classNames'
  | 'styles'
>) {
  const {
    semantic,
    components: { Cell: tokens },
  } = useTsukiTheme()
  const hasTitle = hasContent(title)
  const hasExtra = hasContent(titleExtra)
  const hasDescription = hasContent(description)
  const hasValue = hasContent(value)
  const hasValueExtra = hasContent(valueExtra)
  const showTitle = hasTitle || hasExtra || required
  const showValue = hasValue || hasValueExtra
  const isLarge = size === 'large'
  const fontSizeClass = isLarge ? 'text-tsuki-cell-large-font-size' : 'text-tsuki-cell-font-size'
  const [justifyClass, textAlignClass] = alignments[valueAlign]
  const alignmentClass = center ? 'items-center' : 'items-start'

  function slotViewProps(slot: ViewSlot, baseClasses: string, extra?: ViewProps): ViewProps {
    return {
      ...extra,
      className: semanticClassName(classNames, slot, baseClasses),
      style: styles?.[slot],
    } as ViewProps
  }

  function slotTextProps(slot: TextSlot, colorClass: string, numberOfLines?: number) {
    const isDescription = slot === 'description'
    return {
      numberOfLines,
      className: semanticClassName(classNames, slot, [
        'shrink',
        colorClass,
        isDescription ? 'text-tsuki-cell-description-font-size' : fontSizeClass,
        isDescription
          ? 'leading-tsuki-cell-description-line-height'
          : 'leading-tsuki-cell-line-height',
        slot === 'value' ? textAlignClass : undefined,
      ]),
      style: styles?.[slot],
    }
  }

  return createElement(
    View,
    slotViewProps(
      'container',
      cn(
        'flex-row gap-tsuki-cell-gap px-tsuki-cell-padding-horizontal',
        alignmentClass,
        isLarge
          ? 'min-h-tsuki-cell-large-min-height py-tsuki-cell-large-padding-vertical'
          : 'min-h-tsuki-cell-min-height py-tsuki-cell-padding-vertical',
      ),
    ),
    hasContent(leading)
      ? createElement(
          View,
          slotViewProps('leading', 'shrink-0 max-w-[40%]'),
          renderCellText(leading, {
            className: cn('text-tsuki-foreground leading-tsuki-cell-line-height', fontSizeClass),
          }),
        )
      : null,
    createElement(
      View,
      {
        className: cn(
          'flex-1 min-w-0',
          vertical
            ? 'flex-col items-stretch gap-tsuki-cell-vertical-gap'
            : cn('flex-row gap-tsuki-cell-gap', alignmentClass),
        ),
      } as ViewProps,
      showTitle || hasDescription
        ? createElement(
            View,
            slotViewProps('titleContainer', cn('min-w-0', !vertical && 'flex-1')),
            showTitle
              ? createElement(
                  View,
                  slotViewProps('titleRow', 'flex-row items-center min-w-0'),
                  required
                    ? renderCellText('*', {
                        ...slotTextProps('required', 'text-tsuki-danger'),
                        accessible: false,
                      })
                    : null,
                  hasTitle
                    ? renderCellText(
                        title,
                        slotTextProps('title', 'text-tsuki-foreground', titleLines),
                      )
                    : null,
                  hasExtra
                    ? createElement(
                        View,
                        slotViewProps(
                          'titleExtraContainer',
                          cn('shrink-0 max-w-[50%]', hasTitle && 'ml-tsuki-cell-title-extra-gap'),
                        ),
                        renderCellText(
                          titleExtra,
                          slotTextProps('titleExtra', 'text-tsuki-foreground'),
                        ),
                      )
                    : null,
                )
              : null,
            hasDescription
              ? renderCellText(description, slotTextProps('description', 'text-tsuki-muted'))
              : null,
          )
        : null,
      showValue
        ? createElement(
            View,
            slotViewProps(
              'valueContainer',
              cn('min-w-0 flex-row', !vertical && 'flex-1', justifyClass, alignmentClass),
            ),
            hasValue
              ? renderCellText(value, slotTextProps('value', 'text-tsuki-muted', valueLines))
              : null,
            hasValueExtra
              ? createElement(
                  View,
                  slotViewProps(
                    'valueExtraContainer',
                    cn('shrink-0 max-w-[50%]', hasValue && 'ml-tsuki-cell-value-extra-gap'),
                  ),
                  renderCellText(valueExtra, slotTextProps('valueExtra', 'text-tsuki-muted')),
                )
              : null,
          )
        : null,
    ),
    hasContent(trailing)
      ? createElement(
          View,
          slotViewProps('trailingContainer', 'shrink-0 max-w-[40%]'),
          renderCellText(trailing, slotTextProps('trailing', 'text-tsuki-muted')),
        )
      : null,
    showArrow
      ? createElement(
          View,
          slotViewProps('arrow', 'shrink-0', { pointerEvents: 'none' }),
          <Icon
            name={arrowDirection === 'left' ? 'LeftOutlined' : 'RightOutlined'}
            rotation={arrowRotation[arrowDirection]}
            size={tokens.iconSize}
            color={semantic.colorMuted}
          />,
        )
      : null,
  )
}
