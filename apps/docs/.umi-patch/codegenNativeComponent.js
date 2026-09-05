import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';

const SVG_TAGS = {
  RNSVGSvgView: 'svg',
  RNSVGSvgViewAndroid: 'svg',
  RNSVGCircle: 'circle',
  RNSVGClipPath: 'clipPath',
  RNSVGDefs: 'defs',
  RNSVGEllipse: 'ellipse',
  RNSVGFeBlend: 'feBlend',
  RNSVGFeColorMatrix: 'feColorMatrix',
  RNSVGFeComposite: 'feComposite',
  RNSVGFeFlood: 'feFlood',
  RNSVGFeGaussianBlur: 'feGaussianBlur',
  RNSVGFeMerge: 'feMerge',
  RNSVGFeOffset: 'feOffset',
  RNSVGFilter: 'filter',
  RNSVGForeignObject: 'foreignObject',
  RNSVGGroup: 'g',
  RNSVGImage: 'image',
  RNSVGLine: 'line',
  RNSVGLinearGradient: 'linearGradient',
  RNSVGMarker: 'marker',
  RNSVGMask: 'mask',
  RNSVGPath: 'path',
  RNSVGPattern: 'pattern',
  RNSVGPolygon: 'polygon',
  RNSVGPolyline: 'polyline',
  RNSVGRect: 'rect',
  RNSVGRadialGradient: 'radialGradient',
  RNSVGSymbol: 'symbol',
  RNSVGText: 'text',
  RNSVGTextPath: 'textPath',
  RNSVGUse: 'use',
};

export default function codegenNativeComponent(componentName) {
  const tagName = SVG_TAGS[componentName] || 'div';

  return forwardRef(function NativeComponent(
    {
      children,
      style,
      propList,
      bbWidth,
      bbHeight,
      minX,
      minY,
      vbWidth,
      vbHeight,
      meetOrSlice,
      accessibilityLabel,
      ...props
    },
    ref,
  ) {
    const domProps = {
      ...props,
      ref,
      style: StyleSheet.flatten(style),
    };
    if (accessibilityLabel !== undefined) domProps['aria-label'] = accessibilityLabel;

    return React.createElement(tagName, domProps, children);
  });
}
