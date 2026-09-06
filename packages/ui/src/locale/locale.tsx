import type { LocaleProviderProps, Locale } from './interface'
import zhCN from './lang/zh-cn'
import { createContext, memo, useContext, useMemo } from 'react'

const LocaleContext = createContext<Locale>(zhCN)

export function useLocale() {
  return useContext(LocaleContext)
}

function LocaleProvider({ children, locale }: LocaleProviderProps) {
  const value = useMemo<Locale>(() => ({ ...zhCN, ...locale }), [locale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export default memo(LocaleProvider)
