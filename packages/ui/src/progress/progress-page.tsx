import { Button } from '../button'
import { usePersistFn } from '../hooks'
import { useLocale } from '../locale'
import { Result } from '../result'
import { Space } from '../space'
import { useToken } from '../theme'
import type { ProgressPageProps } from './interface'
import { Progress } from './progress'
import { isValidElement, memo, useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export function ProgressPage({
  children,
  theme,
  loading: loadingProp = false,
  defaultPercentage = 10,
  backgroundColor,
  fail,
  failMessage,
  failIcon,
  onPressReload,
  refreshText,
  failExtra,
  extraLoading,
  overlayZIndex = 1000,
  syncRenderChildren = false,
}: ProgressPageProps) {
  const locale = useLocale().ProgressPage
  const { components } = useToken()
  const token = { ...components.Progress, ...theme }
  const [state, setState] = useState({
    loading: loadingProp,
    percentage: defaultPercentage,
    duration: 0,
    animated: false,
  })
  const onAnimationEnd = useCallback((value: number) => {
    if (value === 100) setTimeout(() => setState((current) => ({ ...current, loading: false })), 0)
  }, [])
  const onReload = usePersistFn(() => onPressReload?.())
  useEffect(() => {
    if (!state.loading && loadingProp)
      setState((current) => ({
        ...current,
        loading: true,
        percentage: defaultPercentage,
        duration: 0,
        animated: false,
      }))
  }, [defaultPercentage, loadingProp, state.loading])
  useEffect(() => {
    const timer = setTimeout(
      () =>
        setState((current) => ({
          ...current,
          percentage: loadingProp ? 90 : 100,
          duration: loadingProp ? 1500 : 100,
          animated: true,
        })),
      0,
    )
    return () => clearTimeout(timer)
  }, [loadingProp])
  const placeholder = state.loading ? (
    <View style={{ flex: 1, backgroundColor: backgroundColor ?? token.pageBackgroundColor }}>
      <Progress
        percentage={state.percentage}
        showPivot={false}
        animated={state.animated}
        animationDuration={state.duration}
        onAnimationEnd={onAnimationEnd}
        square
      />
      {extraLoading}
    </View>
  ) : null
  const error =
    !state.loading && fail ? (
      <Result
        status="warning"
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: backgroundColor ?? token.pageBackgroundColor,
        }}
        renderIcon={failIcon ? () => failIcon : undefined}
        subtitle={
          <Space head gap="l" align="center">
            {isValidElement(failMessage) ? (
              failMessage
            ) : (
              <Text
                style={{
                  color: token.pageTextColor,
                  fontSize: token.pageTextFontSize,
                  lineHeight: token.pageTextLineHeight,
                }}
              >
                {failMessage ?? locale.failMessage}
              </Text>
            )}
            {onPressReload ? (
              <Button
                style={{ width: token.pageButtonWidth }}
                text={refreshText ?? locale.labelRefreshText}
                onPress={onReload}
              />
            ) : null}
            {failExtra}
          </Space>
        }
      />
    ) : null
  if (syncRenderChildren)
    return (
      <>
        {children}
        {state.loading || fail ? (
          <View style={[StyleSheet.absoluteFillObject, { zIndex: overlayZIndex }]}>
            {placeholder}
            {error}
          </View>
        ) : null}
      </>
    )
  return (
    <>
      {!loadingProp && !state.loading && !fail ? children : null}
      {placeholder}
      {error}
    </>
  )
}

export default memo(ProgressPage)
