export type ThemeScheme = 'light' | 'dark'

export interface SemanticTokens {
  colorPrimary: string
  colorPrimaryForeground: string
  colorSuccess: string
  colorWarning: string
  colorDanger: string
  colorForeground: string
  colorMuted: string
  colorBackground: string
  colorSurface: string
  colorBorder: string
}

export interface ButtonThemeTokens {
  borderRadius: number
  height: number
}

export interface InputThemeTokens {
  borderRadius: number
  height: number
}

export interface DividerThemeTokens {
  thickness: number
}

export interface SurfaceThemeTokens {
  borderRadius: number
  padding: number
  borderWidth: number
}

export interface CardThemeTokens {
  borderRadius: number
  padding: number
  headerPadding: number
  bodyPadding: number
  footerPadding: number
  gap: number
}

export interface CellThemeTokens {
  paddingHorizontal: number
  paddingVertical: number
  largePaddingVertical: number
  minHeight: number
  largeMinHeight: number
  fontSize: number
  largeFontSize: number
  descriptionFontSize: number
  lineHeight: number
  descriptionLineHeight: number
  iconSize: number
  gap: number
  verticalGap: number
  titleExtraGap: number
  valueExtraGap: number
  dividerWidth: number
  groupTitlePaddingHorizontal: number
  groupTitlePaddingVertical: number
  groupInsetMarginHorizontal: number
  groupRadius: number
  disabledOpacity: number
}

export interface ThemeConfig {
  semantic?: Partial<SemanticTokens>
  components?: {
    Button?: Partial<ButtonThemeTokens>
    Card?: Partial<CardThemeTokens>
    Cell?: Partial<CellThemeTokens>
    Divider?: Partial<DividerThemeTokens>
    Input?: Partial<InputThemeTokens>
    Surface?: Partial<SurfaceThemeTokens>
  }
  inherit?: boolean
}

export interface ResolvedTheme {
  scheme: ThemeScheme
  semantic: SemanticTokens
  components: {
    Button: ButtonThemeTokens
    Card: CardThemeTokens
    Cell: CellThemeTokens
    Divider: DividerThemeTokens
    Input: InputThemeTokens
    Surface: SurfaceThemeTokens
  }
}

export type ThemeVariables = Record<`--tsuki-${string}`, string>
