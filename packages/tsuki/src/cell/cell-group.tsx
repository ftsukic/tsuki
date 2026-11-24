import { createElement, forwardRef, isValidElement } from 'react'
import type { ComponentRef, ReactNode, RefAttributes } from 'react'
import { View } from 'react-native'
import type { ViewProps } from 'react-native'
import { Divider } from '../divider'
import { cn } from '../style/cn'
import { semanticClassName } from '../style/semantic'
import { Surface } from '../surface'
import { CellRoot, TSUKI_CELL_MARKER } from './cell'
import { CellGroupContext } from './context'
import { flattenGroup, hasContent, renderCellText } from './normalize'
import type { CellGroupProps } from './types'

const REACT_MEMO_TYPE = Symbol.for('react.memo')

function isCellType(type: unknown): boolean {
  if (!type || (typeof type !== 'object' && typeof type !== 'function')) return false
  if (type === CellRoot) return true
  if (TSUKI_CELL_MARKER in type && (type as Record<symbol, unknown>)[TSUKI_CELL_MARKER] === true) {
    return true
  }
  const memoRecord = type as { $$typeof?: unknown; type?: unknown }
  if (memoRecord.$$typeof === REACT_MEMO_TYPE && memoRecord.type) {
    return isCellType(memoRecord.type)
  }
  return false
}

function isCellElement(child: ReactNode): boolean {
  return isValidElement(child) && isCellType(child.type)
}

export const CellGroup = forwardRef<ComponentRef<typeof View>, CellGroupProps>(function CellGroup(
  {
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
  },
  ref,
) {
  const items = flattenGroup(children)
  const cells = items.filter(({ child }) => isCellElement(child))
  const first = cells[0]
  const last = cells.at(-1)
  const hasTitle = hasContent(title)
  const hasExtra = hasContent(extra)
  const heading = (slot: 'title' | 'extra') => ({
    className: semanticClassName(
      classNames,
      slot,
      'text-tsuki-muted text-tsuki-cell-font-size leading-tsuki-cell-line-height',
    ),
    style: styles?.[slot],
  })

  const body = (
    <Surface
      overflow={inset ? 'hidden' : 'visible'}
      bordered={inset && border}
      className={cn(
        'p-0',
        inset ? 'rounded-tsuki-cell-group-radius' : 'rounded-none',
        classNames?.body,
      )}
      style={styles?.body}
    >
      {items.map((item) => {
        const { child, key } = item
        if (!isCellElement(child)) {
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
            className="absolute top-0 left-0 right-0 h-tsuki-cell-divider-width"
          />
          <Divider
            accessible={false}
            role="none"
            className="absolute bottom-0 left-0 right-0 h-tsuki-cell-divider-width"
          />
        </>
      )}
    </Surface>
  )

  return createElement(
    View,
    {
      ...viewProps,
      ref,
      className: semanticClassName(classNames, 'root', undefined, className),
      style: [styles?.root, style],
    } as ViewProps & RefAttributes<ComponentRef<typeof View>>,
    hasTitle || hasExtra
      ? createElement(
          View,
          {
            className: semanticClassName(
              classNames,
              'header',
              'flex-row items-center px-tsuki-cell-group-title-padding-horizontal py-tsuki-cell-group-title-padding-vertical gap-tsuki-cell-gap',
            ),
            style: styles?.header,
          } as ViewProps,
          createElement(
            View,
            { className: 'flex-1 min-w-0' } as ViewProps,
            hasTitle ? renderCellText(title, heading('title')) : null,
          ),
          hasExtra
            ? createElement(
                View,
                {
                  className: semanticClassName(
                    classNames,
                    'extraContainer',
                    'shrink-0 max-w-[50%]',
                  ),
                  style: styles?.extraContainer,
                } as ViewProps,
                renderCellText(extra, heading('extra')),
              )
            : null,
        )
      : null,
    inset
      ? createElement(
          View,
          { className: 'mx-tsuki-cell-group-inset-margin-horizontal' } as ViewProps,
          body,
        )
      : body,
  )
})

CellGroup.displayName = 'CellGroup'
