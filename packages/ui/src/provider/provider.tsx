import { LocaleProvider, type Locale } from '../locale'
import { PortalHost } from '../portal'
import { UIThemeProvider, type ThemeConfig } from '../theme'
import type { PropsWithChildren } from 'react'

export interface UIProviderProps extends PropsWithChildren {
  theme?: ThemeConfig
  locale?: Partial<Locale>
}

export function UIProvider({ children, theme, locale }: UIProviderProps) {
  return (
    <UIThemeProvider theme={theme}>
      <LocaleProvider locale={locale}>
        <PortalHost>{children}</PortalHost>
      </LocaleProvider>
    </UIThemeProvider>
  )
}
