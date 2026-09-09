import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
import { IconSizeProvider } from '../icon/context'
import { getAvatarToken } from './token'
import type { AvatarProps, AvatarSize } from './interface'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Image, Text, View } from 'react-native'
import type { ImageSourcePropType, View as ViewComponent } from 'react-native'

function isRenderable(value: AvatarProps['children']): boolean {
  return value !== undefined && value !== null && value !== false
}

function normalizeSource(source: NonNullable<AvatarProps['src']>): ImageSourcePropType {
  return typeof source === 'string' ? { uri: source } : source
}

function resolveSize(size: AvatarSize | undefined, token: ReturnType<typeof getAvatarToken>) {
  if (typeof size === 'number')
    return Number.isFinite(size) && size > 0 ? size : token.containerSize
  if (size === 'small') return token.containerSizeSM
  if (size === 'large') return token.containerSizeLG
  return token.containerSize
}

function resolveFontSize(size: AvatarSize | undefined, token: ReturnType<typeof getAvatarToken>) {
  if (typeof size === 'number') return Math.max(1, size * 0.5)
  if (size === 'small') return token.textFontSizeSM
  if (size === 'large') return token.textFontSizeLG
  return token.textFontSize
}

function resolveIconSize(
  size: AvatarSize | undefined,
  resolvedSize: number,
  token: ReturnType<typeof getAvatarToken>,
) {
  if (size === 'small') return token.iconFontSizeSM
  if (size === 'large') return token.iconFontSizeLG
  if (size === 'medium' || size === undefined) return token.iconFontSize
  return Math.max(1, resolvedSize * 0.6)
}

export const Avatar = forwardRef<ViewComponent, AvatarProps>(function Avatar(
  {
    children,
    src,
    icon,
    alt,
    size = 'large',
    shape = 'square',
    borderRadius,
    gap = 4,
    onError,
    style,
    styles,
    ...viewProps
  },
  ref,
) {
  const token = useComponentToken('Avatar', getAvatarToken)
  const [imageError, setImageError] = useState(false)
  const resolvedSize = resolveSize(size, token)
  const fontSize = resolveFontSize(size, token)
  const iconSize = resolveIconSize(size, resolvedSize, token)
  const source = useMemo(() => (src === undefined ? undefined : normalizeSource(src)), [src])
  const semantic = resolveStyles(styles, {
    props: {
      ...viewProps,
      children,
      src,
      icon,
      alt,
      size,
      shape,
      borderRadius,
      gap,
      onError,
      style,
      styles,
    },
    state: { imageError },
  })

  useEffect(() => {
    setImageError(false)
  }, [src])

  const handleError: NonNullable<AvatarProps['onError']> = (event) => {
    setImageError(true)
    onError?.(event)
  }

  const hasImage = source !== undefined && !imageError
  const hasIcon = isRenderable(icon)
  const hasText = isRenderable(children)
  const rootRadius = borderRadius ?? (shape === 'circle' ? resolvedSize / 2 : token.borderRadius)

  return (
    <View
      ref={ref}
      {...viewProps}
      accessible={viewProps.accessible ?? true}
      accessibilityRole={viewProps.accessibilityRole ?? 'image'}
      accessibilityLabel={viewProps.accessibilityLabel ?? alt}
      style={[
        {
          width: resolvedSize,
          height: resolvedSize,
          borderRadius: rootRadius,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: token.backgroundColor,
        },
        semantic?.root,
        style,
      ]}
    >
      {hasImage ? (
        <Image
          source={source}
          resizeMode="cover"
          onError={handleError}
          style={[{ width: '100%', height: '100%' }, semantic?.image]}
          accessibilityLabel={alt}
        />
      ) : hasIcon ? (
        <View style={[{ alignItems: 'center', justifyContent: 'center' }, semantic?.icon]}>
          <IconSizeProvider size={iconSize}>{icon}</IconSizeProvider>
        </View>
      ) : hasText ? (
        typeof children === 'string' || typeof children === 'number' ? (
          <Text
            numberOfLines={1}
            style={[
              {
                maxWidth: Math.max(0, resolvedSize - gap * 2),
                color: token.textColor,
                fontFamily: token.fontFamily,
                fontSize,
                lineHeight: resolvedSize,
                textAlign: 'center',
              },
              semantic?.text,
            ]}
          >
            {children}
          </Text>
        ) : (
          <View style={[{ alignItems: 'center', justifyContent: 'center' }, semantic?.content]}>
            {children}
          </View>
        )
      ) : null}
    </View>
  )
})

Avatar.displayName = 'Avatar'
