import Animated from 'react-native-reanimated'
import { useFeedbackMotion } from '../motion/useFeedbackMotion'
import { memo } from 'react'
import { View } from 'react-native'
import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { getSkeletonStyles } from './style'
import { getSkeletonToken } from './token'
import type { SkeletonProps } from './types'

function normalizeRowCount(row: number | undefined): number {
  return Number.isFinite(row) ? Math.max(0, Math.floor(row as number)) : 0
}

function resolveRowWidth(
  rowWidth: SkeletonProps['rowWidth'],
  index: number,
  fallback: SkeletonProps['titleWidth'],
) {
  if (!Array.isArray(rowWidth)) return rowWidth ?? fallback
  return rowWidth[index] ?? fallback
}

function SkeletonComponent({
  animate = true,
  avatar = false,
  avatarShape = 'round',
  avatarSize,
  children,
  loading = true,
  row = 0,
  rowWidth,
  round = false,
  style,
  styles,
  title = false,
  titleWidth,
  ...viewProps
}: SkeletonProps) {
  const token = useComponentToken('Skeleton', getSkeletonToken)
  const animatedStyle = useFeedbackMotion(
    'pulse',
    token.animationDuration,
    loading && animate,
    token.animationMinOpacity,
  )
  const rowCount = normalizeRowCount(row)
  const resolvedProps: SkeletonProps = {
    ...viewProps,
    animate,
    avatar,
    avatarShape,
    avatarSize,
    children,
    loading,
    row,
    rowWidth,
    round,
    style,
    styles,
    title,
    titleWidth,
  }
  const state = { animate, avatar, loading, round, title }
  const resolved = getSkeletonStyles(token, resolvedProps, state)
  const semantic = resolveStyles(styles, { props: resolvedProps, state })

  return (
    <View
      {...viewProps}
      accessible={viewProps.accessible ?? loading}
      accessibilityRole={viewProps.accessibilityRole ?? (loading ? 'progressbar' : undefined)}
      accessibilityState={
        loading ? { busy: true, ...viewProps.accessibilityState } : viewProps.accessibilityState
      }
      style={[resolved.root, semantic?.root, style]}
    >
      {loading ? (
        <Animated.View style={[resolved.placeholder, animatedStyle]}>
          <View style={[avatar ? { flexDirection: 'row', alignItems: 'flex-start' } : null]}>
            {avatar ? (
              <View style={semantic?.header}>
                <View style={[resolved.avatar, semantic?.avatar]} />
              </View>
            ) : null}
            <View style={[resolved.content, semantic?.section]}>
              {title ? <View style={[resolved.title, semantic?.title]} /> : null}
              {rowCount > 0 ? (
                <View
                  style={[
                    resolved.rows,
                    title ? { marginTop: token.titleRowGap } : null,
                    semantic?.paragraph,
                  ]}
                >
                  {Array.from({ length: rowCount }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        resolved.row,
                        { width: resolveRowWidth(rowWidth, index, token.rowWidth) },
                        index > 0 ? { marginTop: token.rowGap } : null,
                        semantic?.row,
                      ]}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        </Animated.View>
      ) : (
        children
      )}
    </View>
  )
}

export const Skeleton = memo(SkeletonComponent)
Skeleton.displayName = 'Skeleton'
