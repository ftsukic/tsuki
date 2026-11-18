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

export interface ThemeConfig {
  semantic?: Partial<SemanticTokens>
  components?: {
    Button?: Partial<ButtonThemeTokens>
    Card?: Partial<CardThemeTokens>
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
    Divider: DividerThemeTokens
    Input: InputThemeTokens
    Surface: SurfaceThemeTokens
  }
}

export type ThemeVariables = Record<`--tsuki-${string}`, string>
