import { Children } from 'react'
import type { ReactNode } from 'react'
import { resolveStyles } from '../style'
import { getEmptyStyles } from './style'
import { Image, Platform, View } from 'react-native'
import type { DimensionValue } from 'react-native'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { EmptyImage } from './empty-image'
import { getEmptyToken } from './token'
import type { EmptyProps } from './types'

function isRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false && value !== ''
}

function resolveImageSize(size: number | string | undefined, fallback: number): number | string {
  if (typeof size === 'number') {
    return Number.isFinite(size) && size > 0 ? size : fallback
  }

  if (typeof size === 'string' && size.trim().length > 0) {
    const normalizedSize = size.trim()
    const numericSize = Number(normalizedSize)

    if (Number.isFinite(numericSize) && numericSize > 0) return numericSize
    if (Platform.OS === 'web' || /^\d+(?:\.\d+)?%$/u.test(normalizedSize)) return normalizedSize
  }

  return fallback
}

function renderContent(content: ReactNode): ReactNode {
  return Children.map(content, (child) =>
    typeof child === 'string' || typeof child === 'number' || typeof child === 'bigint' ? (
      <Text>{child}</Text>
    ) : (
      child
    ),
  )
}

export function Empty(props: EmptyProps) {
  const {
    children,
    description,
    image,
    imageSize,
    imageAccessibilityLabel,
    style,
    styles,
    ...viewProps
  } = props
  const { token: themeToken } = useToken()
  const token = useComponentToken('Empty', getEmptyToken)
  const resolvedImageSize = resolveImageSize(imageSize, token.empty_image_size)
  const hasImage = image === undefined || isRenderable(image)
  const hasDescription = isRenderable(description)
  const hasAction = isRenderable(children)
  const semantic = resolveStyles(styles, {
    props,
    state: { hasImage, hasDescription, hasAction },
  })
  const defaultStyles = getEmptyStyles(themeToken, token, resolvedImageSize as DimensionValue)
  const imageLabel = imageAccessibilityLabel?.trim() || undefined
  const ownsImage = image === undefined || typeof image === 'string'
  const imageContent =
    image === undefined ? (
      <EmptyImage />
    ) : typeof image === 'string' ? (
      <Image
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        resizeMode="contain"
        source={{ uri: image }}
        style={{ height: '100%', width: '100%' }}
      />
    ) : (
      renderContent(image)
    )
  const descriptionContent =
    typeof description === 'string' ||
    typeof description === 'number' ||
    typeof description === 'bigint' ? (
      <Text type="secondary" style={[defaultStyles.description, semantic?.description]}>
        {description}
      </Text>
    ) : (
      renderContent(description)
    )

  return (
    <View {...viewProps} style={[defaultStyles.root, semantic?.root, style]}>
      {hasImage ? (
        <View
          accessible={ownsImage ? imageLabel !== undefined : undefined}
          accessibilityRole={ownsImage && imageLabel ? 'image' : undefined}
          accessibilityLabel={ownsImage ? imageLabel : undefined}
          accessibilityElementsHidden={ownsImage ? !imageLabel : undefined}
          importantForAccessibility={
            ownsImage ? (imageLabel ? 'yes' : 'no-hide-descendants') : undefined
          }
          style={[defaultStyles.image, semantic?.image]}
        >
          {imageContent}
        </View>
      ) : null}
      {hasDescription ? (
        <View style={[defaultStyles.descriptionContainer, semantic?.descriptionContainer]}>
          {descriptionContent}
        </View>
      ) : null}
      {hasAction ? (
        <View style={[defaultStyles.footer, semantic?.footer]}>{renderContent(children)}</View>
      ) : null}
    </View>
  )
}

Empty.displayName = 'Empty'
