import { Image } from 'react-native'
import type { ImageURISource } from 'react-native'
import FastImage from 'react-native-fast-image'
import type { Source } from 'react-native-fast-image'
import type { ImagePreviewImageAdapter } from '@ftsukic/tsuki'

function fastSource(source: ImageURISource): Source {
  return {
    uri: source.uri,
    headers: source.headers,
    width: source.width,
    height: source.height,
    scale: source.scale,
    cache:
      source.cache === 'only-if-cached'
        ? 'cacheOnly'
        : source.cache === 'force-cache'
          ? 'immutable'
          : 'web',
  }
}

export const fastImageAdapter: ImagePreviewImageAdapter = {
  render: ({ source, style, onLoadStart, onLoad, onError, testID }) => (
    <FastImage
      source={
        typeof source === 'number'
          ? source
          : Array.isArray(source)
            ? source.map(fastSource)
            : fastSource(source)
      }
      style={style}
      objectFit="contain"
      transition={false}
      accessible={false}
      testID={testID}
      onLoadStart={onLoadStart}
      onLoad={onLoad}
      onError={onError}
    />
  ),
  preload: (source) => {
    if (typeof source === 'number') {
      const asset = Image.resolveAssetSource(source)
      return asset ? FastImage.preload([fastSource(asset)]) : undefined
    }
    return FastImage.preload((Array.isArray(source) ? source : [source]).map(fastSource))
  },
}
