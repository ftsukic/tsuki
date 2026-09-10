import { memo, useEffect, useRef } from 'react'
import { Animated, Easing, Platform, View } from 'react-native'
import { resolveStyles } from '../style'
import { useComponentToken, useToken } from '../theme'
import { getSkeletonStyles } from './style'
import { getSkeletonToken } from './token'
import type { SkeletonProps } from './interface'

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
  const { token: themeToken } = useToken()
  const token = useComponentToken('Skeleton', getSkeletonToken)
  const opacity = useRef(new Animated.Value(1)).current
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

  useEffect(() => {
    const shouldAnimate = loading && animate && themeToken.motion && token.animationDuration > 0

    opacity.stopAnimation()
    opacity.setValue(1)
    if (!shouldAnimate) return

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: token.animationMinOpacity,
          duration: token.animationDuration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: token.animationDuration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    )
    animation.start()

    return () => {
      animation.stop()
      opacity.stopAnimation()
      opacity.setValue(1)
    }
  }, [
    animate,
    loading,
    opacity,
    themeToken.motion,
    token.animationDuration,
    token.animationMinOpacity,
  ])

  return (
    <View
      {...viewProps}
      accessible={viewProps.accessible ?? loading}
      accessibilityRole={viewProps.accessibilityRole ?? (loading ? 'progressbar' : undefined)}
      accessibilityState={
        loading ? { ...viewProps.accessibilityState, busy: true } : viewProps.accessibilityState
      }
      style={[resolved.root, semantic?.root, style]}
    >
      {loading ? (
        <Animated.View style={[resolved.placeholder, semantic?.placeholder, { opacity }]}>
          <View style={[avatar ? { flexDirection: 'row', alignItems: 'flex-start' } : null]}>
            {avatar ? <View style={[resolved.avatar, semantic?.avatar]} /> : null}
            <View style={[resolved.content, semantic?.content]}>
              {title ? <View style={[resolved.title, semantic?.title]} /> : null}
              {rowCount > 0 ? (
                <View
                  style={[
                    resolved.rows,
                    semantic?.rows,
                    title ? { marginTop: token.titleRowGap } : null,
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
