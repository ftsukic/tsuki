export type AppThemeMode = 'system' | 'light' | 'dark'
export type AppResolvedColorScheme = Exclude<AppThemeMode, 'system'>

export interface AppStatusColor {
  foreground: string
  background: string
  border: string
}

export interface AppColorScheme {
  brand: {
    primary: string
    onPrimary: string
    primaryContainer: string
    onPrimaryContainer: string
  }
  surface: {
    canvas: string
    page: string
    container: string
    elevated: string
    sunken: string
    overlay: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    disabled: string
    inverse: string
    link: string
  }
  icon: {
    primary: string
    secondary: string
    tertiary: string
    disabled: string
  }
  border: {
    subtle: string
    default: string
    strong: string
    focus: string
  }
  status: {
    success: AppStatusColor
    warning: AppStatusColor
    danger: AppStatusColor
    info: AppStatusColor
  }
  state: {
    pressed: string
    selected: AppStatusColor
  }
}

export type FontSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

export type TypographyRole =
  'display' | 'pageTitle' | 'sectionTitle' | 'body' | 'bodySmall' | 'label' | 'caption'

export interface AppTypographyStyleDefinition {
  family: keyof AppTypographyDefinition['family']
  size: FontSizeKey
  weight: keyof AppTypographyDefinition['weight']
  lineHeight: keyof AppTypographyDefinition['lineHeight']
  letterSpacing: keyof AppTypographyDefinition['letterSpacing']
}

export interface AppTypographyDefinition {
  family: {
    base: string
    heading: string
    mono: string
  }
  size: Record<FontSizeKey, number>
  weight: {
    regular: '400'
    medium: '500'
    semibold: '600'
    bold: '700'
  }
  lineHeight: {
    tight: number
    title: number
    comfortable: number
    normal: number
    relaxed: number
  }
  letterSpacing: {
    tight: number
    compact: number
    subtle: number
    normal: number
    wide: number
  }
  styles: Record<TypographyRole, AppTypographyStyleDefinition>
}

export interface AppSpacingDefinition {
  scale: {
    0: number
    1: number
    2: number
    3: number
    4: number
    5: number
    6: number
    8: number
    10: number
    12: number
  }
  layout: {
    page: {
      horizontal: number
      vertical: number
    }
    section: number
    card: number
    item: number
    inline: number
  }
}

export type AppRadiusKey = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export interface AppShapeDefinition {
  radius: {
    scale: Record<AppRadiusKey, number>
    semantic: {
      control: AppRadiusKey
      card: AppRadiusKey
      sheet: AppRadiusKey
      popover: AppRadiusKey
      pill: AppRadiusKey
    }
  }
  borderWidth: {
    hairline: number
    default: number
    strong: number
  }
}

export interface AppThemeDefinition {
  colors: {
    light: AppColorScheme
    dark: AppColorScheme
  }
  typography: AppTypographyDefinition
  spacing: AppSpacingDefinition
  shape: AppShapeDefinition
}

export interface ResolvedAppTypography extends Omit<AppTypographyDefinition, 'styles'> {
  styles: Record<TypographyRole, AppResolvedTextStyle>
}

export interface AppResolvedTextStyle {
  fontFamily: string
  fontSize: number
  lineHeight: number
  fontWeight: '400' | '500' | '600' | '700'
  letterSpacing: number
}

export type ResolvedAppSpacing = AppSpacingDefinition
export type ResolvedAppShape = AppShapeDefinition

export interface ResolvedAppTheme {
  mode: AppResolvedColorScheme
  baseFontSize: number
  fontScale: number
  colors: AppColorScheme
  typography: ResolvedAppTypography
  spacing: ResolvedAppSpacing
  shape: ResolvedAppShape
}

export interface AppThemeContextValue {
  definition: AppThemeDefinition
  theme: ResolvedAppTheme
  mode: AppThemeMode
  setMode: (mode: AppThemeMode) => void
  baseFontSize: number
  setBaseFontSize: (baseFontSize: number) => void
}
