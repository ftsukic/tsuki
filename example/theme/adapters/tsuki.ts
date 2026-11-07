import type { ThemeConfig } from '@ftsukic/tsuki'
import type { ResolvedAppTheme } from '../types'

function lineHeight(theme: ResolvedAppTheme, size: number) {
  return Math.round(size * theme.typography.lineHeight.normal)
}

export function toTsukiTheme(theme: ResolvedAppTheme): ThemeConfig {
  const { colors, typography, shape, mode } = theme
  const status = colors.status
  const radius = (name: keyof typeof shape.radius.semantic) =>
    shape.radius.scale[shape.radius.semantic[name]]

  return {
    mode,
    seed: {
      colorPrimary: colors.brand.primary,
      colorSuccess: status.success.foreground,
      colorWarning: status.warning.foreground,
      colorError: status.danger.foreground,
      colorInfo: status.info.foreground,
      colorLink: colors.text.link,
      colorTextBase: colors.text.primary,
      colorBgBase: colors.surface.canvas,
      fontFamily: typography.family.base,
      fontSize: typography.size.md,
      lineWidth: shape.borderWidth.default,
      borderRadius: radius('control'),
    },
    token: {
      colorIcon: colors.icon.primary,
      colorText: colors.text.primary,
      colorTextSecondary: colors.text.secondary,
      colorTextTertiary: colors.text.tertiary,
      colorTextDisabled: colors.text.disabled,
      colorTextLightSolid: colors.brand.onPrimary,
      colorBgLayout: colors.surface.page,
      colorBgContainer: colors.surface.container,
      colorBgElevated: colors.surface.elevated,
      colorBgContainerPressed: colors.state.pressed,
      colorBgMask: colors.surface.overlay,
      colorBorder: colors.border.default,
      colorBorderSecondary: colors.border.subtle,
      colorPrimaryBg: colors.brand.primaryContainer,
      colorSuccessBg: status.success.background,
      colorSuccessBorder: status.success.border,
      colorWarningBg: status.warning.background,
      colorWarningBorder: status.warning.border,
      colorErrorBg: status.danger.background,
      colorErrorBorder: status.danger.border,
      colorInfoBg: status.info.background,
      colorInfoBorder: status.info.border,
      fontSizeXS: typography.size.xs,
      lineHeightXS: lineHeight(theme, typography.size.xs),
      fontSizeSM: typography.size.sm,
      lineHeightSM: lineHeight(theme, typography.size.sm),
      lineHeight: lineHeight(theme, typography.size.md),
      fontSizeLG: typography.size.lg,
      lineHeightLG: lineHeight(theme, typography.size.lg),
      fontSizeXL: typography.size.xl,
      lineHeightXL: lineHeight(theme, typography.size.xl),
      lineWidthHairline: shape.borderWidth.hairline,
    },
  }
}
