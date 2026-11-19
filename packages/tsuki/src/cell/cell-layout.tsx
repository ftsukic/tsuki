import { View } from 'react-native'
import type { TextStyle, ViewStyle } from 'react-native'
import { cn } from '../style/cn'
import { Icon } from '../icon'
import { useTsukiTheme } from '../theme/theme'
import { hasContent, renderCellText } from './normalize'
import { cellSlot } from './style'
import type { CellProps, CellStyles } from './types'

type ViewSlot = Exclude<
  keyof CellStyles,
  'title' | 'titleExtra' | 'description' | 'value' | 'valueExtra' | 'trailing' | 'required'
>
type TextSlot = Exclude<keyof CellStyles, ViewSlot>

const alignments = {
  left: ['flex-start', 'justify-start', 'text-left'],
  center: ['center', 'justify-center', 'text-center'],
  right: ['flex-end', 'justify-end', 'text-right'],
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
  const fontSize = size === 'large' ? tokens.largeFontSize : tokens.fontSize
  const [justifyContent, justifyClass, textAlignClass] = alignments[valueAlign]
  const alignment = center ? 'center' : 'flex-start'
  const alignmentClass = center ? 'items-center' : 'items-start'
  const itemStyle: ViewStyle = { flexShrink: 0, maxWidth: '40%' }

  function view(
    slot: ViewSlot,
    base: ViewStyle,
    classes: string,
    dynamic: Parameters<typeof cellSlot>[2] = {},
  ) {
    return cellSlot<ViewStyle>(base, classes, dynamic, classNames?.[slot], styles?.[slot])
  }

  function text(slot: TextSlot, color: string, numberOfLines?: number) {
    return {
      numberOfLines,
      ...cellSlot<TextStyle>(
        { flexShrink: 1, ...(slot === 'value' && { textAlign: valueAlign }) },
        cn('shrink', slot === 'value' && textAlignClass),
        {
          color,
          fontSize: slot === 'description' ? tokens.descriptionFontSize : fontSize,
          lineHeight: slot === 'description' ? tokens.descriptionLineHeight : tokens.lineHeight,
        },
        classNames?.[slot],
        styles?.[slot],
      ),
    }
  }

  return (
    <View
      {...view(
        'container',
        { flexDirection: 'row', alignItems: alignment },
        cn('flex-row', alignmentClass),
        {
          gap: tokens.gap,
          minHeight: size === 'large' ? tokens.largeMinHeight : tokens.minHeight,
          paddingHorizontal: tokens.paddingHorizontal,
          paddingVertical: size === 'large' ? tokens.largePaddingVertical : tokens.paddingVertical,
        },
      )}
    >
      {hasContent(leading) && (
        <View {...view('leading', itemStyle, 'shrink-0 max-w-[40%]')}>
          {renderCellText(leading, {
            style: { color: semantic.colorForeground, fontSize, lineHeight: tokens.lineHeight },
          })}
        </View>
      )}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'stretch' : alignment,
          gap: vertical ? tokens.verticalGap : tokens.gap,
        }}
      >
        {(showTitle || hasDescription) && (
          <View
            {...view(
              'titleContainer',
              { minWidth: 0, flex: vertical ? undefined : 1 },
              cn('min-w-0', !vertical && 'flex-1'),
            )}
          >
            {showTitle && (
              <View
                {...view(
                  'titleRow',
                  { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
                  'flex-row items-center min-w-0',
                )}
              >
                {required &&
                  renderCellText('*', {
                    ...text('required', semantic.colorDanger),
                    accessible: false,
                  })}
                {hasTitle &&
                  renderCellText(title, text('title', semantic.colorForeground, titleLines))}
                {hasExtra && (
                  <View
                    {...view(
                      'titleExtraContainer',
                      { flexShrink: 0, maxWidth: '50%' },
                      'shrink-0 max-w-[50%]',
                      {
                        marginLeft: hasTitle ? tokens.titleExtraGap : 0,
                      },
                    )}
                  >
                    {renderCellText(titleExtra, text('titleExtra', semantic.colorForeground))}
                  </View>
                )}
              </View>
            )}
            {hasDescription &&
              renderCellText(description, text('description', semantic.colorMuted))}
          </View>
        )}
        {showValue && (
          <View
            {...view(
              'valueContainer',
              {
                minWidth: 0,
                flex: vertical ? undefined : 1,
                flexDirection: 'row',
                justifyContent,
                alignItems: alignment,
              },
              cn('min-w-0 flex-row', !vertical && 'flex-1', justifyClass, alignmentClass),
            )}
          >
            {hasValue && renderCellText(value, text('value', semantic.colorMuted, valueLines))}
            {hasValueExtra && (
              <View
                {...view(
                  'valueExtraContainer',
                  { flexShrink: 0, maxWidth: '50%' },
                  'shrink-0 max-w-[50%]',
                  {
                    marginLeft: hasValue ? tokens.valueExtraGap : 0,
                  },
                )}
              >
                {renderCellText(valueExtra, text('valueExtra', semantic.colorMuted))}
              </View>
            )}
          </View>
        )}
      </View>
      {hasContent(trailing) && (
        <View {...view('trailingContainer', itemStyle, 'shrink-0 max-w-[40%]')}>
          {renderCellText(trailing, text('trailing', semantic.colorMuted))}
        </View>
      )}
      {showArrow && (
        <View {...view('arrow', { flexShrink: 0 }, 'shrink-0')} pointerEvents="none">
          <Icon
            name={arrowDirection === 'left' ? 'LeftOutlined' : 'RightOutlined'}
            rotation={arrowRotation[arrowDirection]}
            size={tokens.iconSize}
            color={semantic.colorMuted}
          />
        </View>
      )}
    </View>
  )
}
