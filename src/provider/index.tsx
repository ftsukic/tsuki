import { createContext, memo, useContext } from 'react'
import { Portal } from '../portal'
import { ConfigProvider } from '../theme'
import type { ProviderProps } from './interface'

const ProviderContext = createContext(false)

export const Provider = memo(function Provider({ children, theme }: ProviderProps) {
  if (useContext(ProviderContext)) {
    throw new Error('Provider can only be mounted once')
  }

  return (
    <ProviderContext.Provider value>
      <ConfigProvider theme={theme}>
        <Portal.Host>{children}</Portal.Host>
      </ConfigProvider>
    </ProviderContext.Provider>
  )
})

Provider.displayName = 'Provider'

export type { ProviderProps } from './interface'
