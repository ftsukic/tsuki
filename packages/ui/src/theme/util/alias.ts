import type { AliasToken, MapToken } from '../interface'
import getAlphaColor from './getAlphaColor'
import { FastColor } from '@ant-design/fast-color'

/**
 * React Native equivalent of antd v6 `components/theme/util/alias.ts`.
 * CSS-in-JS override merging is handled by `ThemeProvider`; this function
 * derives the AliasToken fields from the complete MapToken.
 */
export default function createAliasToken(map: MapToken, colorLink = map.colorInfo): AliasToken {
  const shadowBaseColor = map.colorShadow
  const shadowBaseAlpha = new FastColor(shadowBaseColor).a
  const getShadowColor = (alpha: number) =>
    new FastColor(shadowBaseColor).setA(shadowBaseAlpha * alpha).toRgbString()

  const motionDuration = map.motion === false ? 0 : undefined

  return {
    ...map,
    colorLink,
    colorLinkHover: map.colorLinkHover,
    colorLinkActive: map.colorLinkActive,
    colorTextHeading: map.colorText,
    colorTextLabel: map.colorTextSecondary,
    colorTextDescription: map.colorTextTertiary,
    colorTextLightSolid: map.colorWhite,
    colorIcon: map.colorTextTertiary,
    colorIconHover: map.colorText,
    colorBgMask: map.colorBgMask,
    colorBorderBg: map.colorBgContainer,
    colorSplit: getAlphaColor(map.colorBorderSecondary, map.colorBgContainer),
    colorTextPlaceholder: map.colorTextQuaternary,
    colorTextDisabled: map.colorTextQuaternary,
    colorBgContainerDisabled: map.colorFillTertiary,
    colorBgTextHover: map.colorFillSecondary,
    colorBgTextActive: map.colorFill,
    colorFillAlter: map.colorFillQuaternary,
    colorFillContent: map.colorFillSecondary,
    colorFillContentHover: map.colorFill,
    colorHighlight: map.colorError,
    colorErrorOutline: getAlphaColor(map.colorErrorBg, map.colorBgContainer),
    colorWarningOutline: getAlphaColor(map.colorWarningBg, map.colorBgContainer),
    colorErrorAffix: map.colorError,
    colorWarningAffix: map.colorWarning,
    fontSizeIcon: map.fontSizeSM,
    fontWeightStrong: 600,
    lineWidthFocus: map.lineWidth * 3,
    controlOutlineWidth: map.lineWidth * 2,
    controlInteractiveSize: map.controlHeight / 2,
    controlItemBgHover: map.colorFillTertiary,
    controlItemBgActive: map.colorPrimaryBg,
    controlItemBgActiveHover: map.colorPrimaryBgHover,
    controlItemBgActiveDisabled: map.colorFill,
    controlTmpOutline: map.colorFillQuaternary,
    controlOutline: getAlphaColor(map.colorPrimaryBg, map.colorBgContainer),
    opacityLoading: 0.65,
    linkDecoration: 'none',
    linkHoverDecoration: 'none',
    linkFocusDecoration: 'none',
    controlPaddingHorizontal: 12,
    controlPaddingHorizontalSM: 8,
    paddingXXS: map.sizeXXS,
    paddingXS: map.sizeXS,
    paddingSM: map.sizeSM,
    padding: map.size,
    paddingMD: map.sizeMD,
    paddingLG: map.sizeLG,
    paddingXL: map.sizeXL,
    paddingContentHorizontalLG: map.sizeLG,
    paddingContentVerticalLG: map.sizeMS,
    paddingContentHorizontal: map.sizeMS,
    paddingContentVertical: map.sizeSM,
    paddingContentHorizontalSM: map.size,
    paddingContentVerticalSM: map.sizeXS,
    marginXXS: map.sizeXXS,
    marginXS: map.sizeXS,
    marginSM: map.sizeSM,
    margin: map.size,
    marginMD: map.sizeMD,
    marginLG: map.sizeLG,
    marginXL: map.sizeXL,
    marginXXL: map.sizeXXL,
    screenXS: 480,
    screenXSMin: 480,
    screenXSMax: 575,
    screenSM: 576,
    screenSMMin: 576,
    screenSMMax: 767,
    screenMD: 768,
    screenMDMin: 768,
    screenMDMax: 991,
    screenLG: 992,
    screenLGMin: 992,
    screenLGMax: 1199,
    screenXL: 1200,
    screenXLMin: 1200,
    screenXLMax: 1599,
    screenXXL: 1600,
    screenXXLMin: 1600,
    screenXXLMax: 1919,
    screenXXXL: 1920,
    screenXXXLMin: 1920,
    boxShadow: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowSecondary: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowTertiary: `
      0 1px 2px 0 ${getShadowColor(0.05)},
      0 1px 6px -1px ${getShadowColor(0.03)},
      0 2px 4px 0 ${getShadowColor(0.03)}
    `,
    boxShadowPopoverArrow: `2px 2px 5px ${getShadowColor(0.05)}`,
    dropShadowPopover: `drop-shadow(0 6px 16px ${getShadowColor(
      0.08,
    )}) drop-shadow(0 3px 6px ${getShadowColor(0.12)}) drop-shadow(0 9px 28px ${getShadowColor(
      0.05,
    )})`,
    boxShadowCard: `
      0 1px 2px -2px ${getShadowColor(0.16)},
      0 3px 6px 0 ${getShadowColor(0.12)},
      0 5px 12px 4px ${getShadowColor(0.09)}
    `,
    boxShadowDrawerRight: `
      -6px 0 16px 0 ${getShadowColor(0.08)},
      -3px 0 6px -4px ${getShadowColor(0.12)},
      -9px 0 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowDrawerLeft: `
      6px 0 16px 0 ${getShadowColor(0.08)},
      3px 0 6px -4px ${getShadowColor(0.12)},
      9px 0 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowDrawerUp: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowDrawerDown: `
      0 -6px 16px 0 ${getShadowColor(0.08)},
      0 -3px 6px -4px ${getShadowColor(0.12)},
      0 -9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowTabsOverflowLeft: `inset 10px 0 8px -8px ${getShadowColor(0.08)}`,
    boxShadowTabsOverflowRight: `inset -10px 0 8px -8px ${getShadowColor(0.08)}`,
    boxShadowTabsOverflowTop: `inset 0 10px 8px -8px ${getShadowColor(0.08)}`,
    boxShadowTabsOverflowBottom: `inset 0 -10px 8px -8px ${getShadowColor(0.08)}`,
    motion: map.motion,
    motionDurationFast: motionDuration ?? Math.round(map.motionDurationFast * 1000),
    motionDurationMid: motionDuration ?? Math.round(map.motionDurationMid * 1000),
    motionDurationSlow: motionDuration ?? Math.round(map.motionDurationSlow * 1000),
  }
}
