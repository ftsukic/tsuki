import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import {
  Button,
  ConfigProvider,
  Input,
  serializeTheme,
  TsukiProvider,
  useTsukiTheme,
} from '@ftsukic/tsuki'
import { vars } from 'nativewind'
import { Pressable, Text, useColorScheme, View } from 'react-native'
import type { ThemeScheme } from '@ftsukic/tsuki'
import './global.css'

type AppearanceChoice = 'system' | ThemeScheme

function ThemeVariables({ children, className }: PropsWithChildren<{ className?: string }>) {
  const theme = useTsukiTheme()

  return (
    <View className={className} style={vars(serializeTheme(theme))}>
      {children}
    </View>
  )
}

function NestedScopeContent() {
  const theme = useTsukiTheme()

  return (
    <>
      <Text className="text-tsuki-primary font-semibold" testID="nested-primary">
        Nested primary: {theme.semantic.colorPrimary}
      </Text>
      <Button
        className="bg-tsuki-primary rounded-tsuki-button"
        testID="nested-button"
        onPress={() => {}}
      >
        Scoped action
      </Button>
      <Input
        accessibilityLabel="Nested scope input"
        className="border-tsuki-primary rounded-tsuki-input"
        placeholder="Nested input"
        testID="nested-input"
      />
    </>
  )
}

function NestedScope() {
  return (
    <ConfigProvider
      theme={{
        semantic: { colorPrimary: '#7c3aed' },
        components: {
          Button: { borderRadius: 16, height: 52 },
          Input: { borderRadius: 16, height: 52 },
        },
      }}
    >
      <ThemeVariables className="gap-3 rounded-xl border border-tsuki-border bg-tsuki-surface p-4">
        <Text className="text-tsuki-foreground font-medium">Nested override</Text>
        <NestedScopeContent />
      </ThemeVariables>
    </ConfigProvider>
  )
}

export default function App() {
  const systemScheme = useColorScheme()
  const [appearance, setAppearance] = useState<AppearanceChoice>('system')
  const scheme: ThemeScheme =
    appearance === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : appearance

  function cycleAppearance() {
    setAppearance((current) =>
      current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system',
    )
  }

  return (
    <TsukiProvider scheme={scheme}>
      <ThemeVariables className="flex-1">
        <View className="flex-1 gap-4 bg-tsuki-background px-6 pb-8 pt-14">
          <Text className="text-tsuki-foreground text-2xl font-bold">Tsuki NativeWind v4</Text>
          <Text className="text-tsuki-muted">Scheme: {scheme}</Text>
          <Pressable
            accessibilityLabel="Cycle color scheme"
            accessibilityRole="button"
            className="rounded-xl bg-tsuki-surface px-4 py-3"
            testID="scheme-toggle"
            onPress={cycleAppearance}
          >
            <Text className="text-tsuki-foreground">Change scheme ({appearance})</Text>
          </Pressable>
          <Button
            className="bg-tsuki-primary rounded-tsuki-button"
            classNames={{ root: 'px-4', content: 'font-semibold' }}
            style={{ minWidth: 96 }}
            styles={{ content: { letterSpacing: 0.2 } }}
            testID="root-button"
            onPress={() => {}}
          >
            Save
          </Button>
          <Input
            accessibilityLabel="Search"
            className="w-full"
            classNames={{ input: 'text-tsuki-foreground placeholder:text-tsuki-muted' }}
            placeholder="Search items"
            style={{ maxWidth: 360 }}
            styles={{ input: { letterSpacing: 0.1 } }}
            testID="root-input"
          />
          <NestedScope />
        </View>
      </ThemeVariables>
    </TsukiProvider>
  )
}
