export interface ColorNeutralMapToken {
  colorTextBase: string
  colorBgBase: string
  colorShadow: string
  colorText: string
  colorTextSecondary: string
  colorTextTertiary: string
  colorTextQuaternary: string
  colorBorder: string
  colorBorderSecondary: string
  colorBorderDisabled: string
  colorFill: string
  colorFillSecondary: string
  colorFillTertiary: string
  colorFillQuaternary: string
  colorBgLayout: string
  colorBgContainer: string
  colorBgElevated: string
  colorBgSpotlight: string
  colorBgBlur: string
  colorBgSolid: string
  colorBgSolidHover: string
  colorBgSolidActive: string
}

interface ColorPrimaryMapToken {
  colorPrimary: string
  colorPrimaryBg: string
  colorPrimaryBgHover: string
  colorPrimaryBorder: string
  colorPrimaryBorderHover: string
  colorPrimaryHover: string
  colorPrimaryActive: string
  colorPrimaryTextHover: string
  colorPrimaryText: string
  colorPrimaryTextActive: string
}

interface ColorSuccessMapToken {
  colorSuccess: string
  colorSuccessBg: string
  colorSuccessBgHover: string
  colorSuccessBorder: string
  colorSuccessBorderHover: string
  colorSuccessHover: string
  colorSuccessActive: string
  colorSuccessTextHover: string
  colorSuccessText: string
  colorSuccessTextActive: string
}

interface ColorWarningMapToken {
  colorWarning: string
  colorWarningBg: string
  colorWarningBgHover: string
  colorWarningBorder: string
  colorWarningBorderHover: string
  colorWarningHover: string
  colorWarningActive: string
  colorWarningTextHover: string
  colorWarningText: string
  colorWarningTextActive: string
}

interface ColorErrorMapToken {
  colorError: string
  colorErrorBg: string
  colorErrorBgHover: string
  colorErrorBgFilledHover: string
  colorErrorBgActive: string
  colorErrorBorder: string
  colorErrorBorderHover: string
  colorErrorHover: string
  colorErrorActive: string
  colorErrorTextHover: string
  colorErrorText: string
  colorErrorTextActive: string
}

interface ColorInfoMapToken {
  colorInfo: string
  colorInfoBg: string
  colorInfoBgHover: string
  colorInfoBorder: string
  colorInfoBorderHover: string
  colorInfoHover: string
  colorInfoActive: string
  colorInfoTextHover: string
  colorInfoText: string
  colorInfoTextActive: string
}

interface ColorLinkMapToken {
  colorLink: string
  colorLinkHover: string
  colorLinkActive: string
}

export interface ColorMapToken
  extends
    ColorNeutralMapToken,
    ColorPrimaryMapToken,
    ColorSuccessMapToken,
    ColorWarningMapToken,
    ColorErrorMapToken,
    ColorInfoMapToken,
    ColorLinkMapToken {
  colorWhite: string
  colorBgMask: string
}
