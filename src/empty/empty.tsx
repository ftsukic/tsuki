import { Image, Platform, View } from 'react-native'
import type { DimensionValue } from 'react-native'
import { Text } from '../text'
import { useComponentToken, useToken } from '../theme'
import { EmptyImage } from './empty-image'
import { getEmptyToken } from './token'
import type { EmptyProps } from './interface'

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

function renderDescription(
  description: EmptyProps['description'],
  color: string,
  fontSize: number,
) {
  if (!isRenderable(description) || description === '') return null

  if (typeof description === 'string' || typeof description === 'number') {
    return (
      <Text
        type="secondary"
        style={{
          color,
          fontSize,
          textAlign: 'center',
        }}
      >
        {description}
      </Text>
    )
  }

  return description
}

export function Empty({
  children,
  description,
  image,
  imageSize,
  style,
  ...viewProps
}: EmptyProps) {
  const { token: themeToken } = useToken()
  const token = useComponentToken('Empty', getEmptyToken)
  const resolvedImageSize = resolveImageSize(imageSize, token.empty_image_size)
  const hasImage = image === undefined || isRenderable(image)
  const imageContent =
    image === undefined ? (
      <EmptyImage />
    ) : typeof image === 'string' ? (
      <Image
        accessibilityRole="image"
        resizeMode="contain"
        source={{ uri: image }}
        style={{ height: '100%', width: '100%' }}
      />
    ) : (
      image
    )
  const descriptionContent = renderDescription(
    description,
    token.empty_description_color,
    token.empty_description_font_size,
  )
  const hasAction = isRenderable(children)

  return (
    <View
      {...viewProps}
      style={[
        {
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingVertical: themeToken.paddingXL,
        },
        style,
      ]}
    >
      {hasImage ? (
        <View
          accessibilityRole="image"
          style={{
            alignItems: 'center',
            height: resolvedImageSize as DimensionValue,
            justifyContent: 'center',
            width: resolvedImageSize as DimensionValue,
          }}
        >
          {imageContent}
        </View>
      ) : null}
      {descriptionContent ? (
        <View
          style={{
            marginTop: token.empty_description_margin_top,
            paddingHorizontal: token.empty_description_padding_horizontal,
          }}
        >
          {descriptionContent}
        </View>
      ) : null}
      {hasAction ? (
        <View style={{ marginTop: token.empty_footer_margin_top }}>{children}</View>
      ) : null}
    </View>
  )
}

Empty.displayName = 'Empty'
