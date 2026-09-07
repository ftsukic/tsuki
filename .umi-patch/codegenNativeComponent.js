import React, { forwardRef } from 'react'
import { StyleSheet } from 'react-native'

const SVG_TAGS = {
  RNSVGSvgView: 'svg',
  RNSVGSvgViewAndroid: 'svg',
  RNSVGCircle: 'circle',
  RNSVGClipPath: 'clipPath',
  RNSVGDefs: 'defs',
  RNSVGEllipse: 'ellipse',
  RNSVGGroup: 'g',
  RNSVGImage: 'image',
  RNSVGLine: 'line',
  RNSVGLinearGradient: 'linearGradient',
  RNSVGPath: 'path',
  RNSVGPattern: 'pattern',
  RNSVGPolygon: 'polygon',
  RNSVGPolyline: 'polyline',
  RNSVGRect: 'rect',
  RNSVGRadialGradient: 'radialGradient',
  RNSVGSymbol: 'symbol',
  RNSVGText: 'text',
  RNSVGUse: 'use',
}

export default function codegenNativeComponent(componentName) {
  const tagName = SVG_TAGS[componentName] || 'div'

  return forwardRef(function NativeComponent(
    { children, style, accessibilityLabel, ...props },
    ref,
  ) {
    const domProps = {
      ...props,
      ref,
      style: StyleSheet.flatten(style),
    }
    if (accessibilityLabel !== undefined) domProps['aria-label'] = accessibilityLabel

    return React.createElement(tagName, domProps, children)
  })
}
