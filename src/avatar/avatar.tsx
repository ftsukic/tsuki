import { resolveStyles } from '../style'
import { useComponentToken } from '../theme'
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
  if (typeof size === 'number') return Math.max(1, Math.min(size * 0.44, token.textFontSizeLG))
  if (size === 'small') return token.textFontSizeSM
  if (size === 'large') return token.textFontSizeLG
  return token.textFontSize
}

export const Avatar = forwardRef<ViewComponent, AvatarProps>(function Avatar(
  {
    children,
    src,
    icon,
    alt,
    size,
    shape = 'circle',
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
          {icon}
        </View>
      ) : hasText ? (
        typeof children === 'string' || typeof children === 'number' ? (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={[
              {
                maxWidth: Math.max(0, resolvedSize - gap * 2),
                color: token.textColor,
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
