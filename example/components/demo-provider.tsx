import { useMemo, type PropsWithChildren } from 'react'
import { View } from 'react-native'
import type { ViewProps } from 'react-native'
import { vars } from 'nativewind'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ImagePreview, TsukiProvider } from '@ftsukic/tsuki'
import { AppThemeProvider, toNativeWindVariables, toTsukiTheme, useAppTheme } from '@/theme'

export function DemoProvider({ children }: PropsWithChildren) {
  return (
    <AppThemeProvider>
      <AppThemeRuntime>{children}</AppThemeRuntime>
    </AppThemeProvider>
  )
}

function AppThemeRuntime({ children }: PropsWithChildren) {
  const theme = useAppTheme()
  const tsukiTheme = useMemo(() => toTsukiTheme(theme), [theme])
  const nativeWindStyle = useMemo(() => vars(toNativeWindVariables(theme)), [theme])
  const rootProps = {
    className: `${theme.mode === 'dark' ? 'dark ' : ''}bg-app-surface-page dark:bg-app-surface-page`,
  } as ViewProps & { className: string }

  return (
    <View {...rootProps} style={[{ flex: 1 }, nativeWindStyle]}>
      <KeyboardProvider preload={false}>
        <TsukiProvider safeArea theme={tsukiTheme}>
          <ImagePreview.Provider>{children}</ImagePreview.Provider>
        </TsukiProvider>
      </KeyboardProvider>
    </View>
  )
}
