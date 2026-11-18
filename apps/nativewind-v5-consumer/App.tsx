import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import {
  Button,
  ConfigProvider,
  Icon,
  Input,
  serializeTheme,
  Text,
  TextClassContext,
  TsukiProvider,
  useTsukiTheme,
} from '@ftsukic/tsuki'
import { VariableContextProvider } from 'nativewind'
import { Pressable, ScrollView, useColorScheme, View } from 'react-native'
import type { ThemeScheme } from '@ftsukic/tsuki'
import './global.css'

type AppearanceChoice = 'system' | ThemeScheme

function ThemeVariables({ children, className }: PropsWithChildren<{ className?: string }>) {
  const theme = useTsukiTheme()

  return (
    <VariableContextProvider value={serializeTheme(theme)}>
      <View className={className}>{children}</View>
    </VariableContextProvider>
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
  const [iconPresses, setIconPresses] = useState(0)
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
        <ScrollView
          className="flex-1 bg-tsuki-background"
          contentContainerStyle={{
            gap: 16,
            paddingHorizontal: 24,
            paddingTop: 56,
            paddingBottom: 32,
          }}
        >
          <Text className="text-tsuki-foreground text-2xl font-bold">Tsuki NativeWind v5</Text>
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
          <Text>Basic text</Text>
          <TextClassContext.Provider value="text-tsuki-primary">
            <Text>
              First level{' '}
              <Text className="font-bold">
                second <Text className="text-red-500">third</Text>
              </Text>
            </Text>
          </TextClassContext.Provider>
          <Button variant="solid">
            <Text>
              Button <Text className="text-red-500">override</Text>
            </Text>
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
          <View className="flex-row items-center gap-4">
            <View style={{ padding: 16 }}>
              <Icon
                accessibilityLabel="Increment icon count"
                name="PlusOutlined"
                size={20}
                touchableSize={44}
                onPress={() => setIconPresses((count) => count + 1)}
              />
            </View>
            <Icon name="CheckCircleTwoTone" size={32} />
            <Text>Icon presses: {iconPresses}</Text>
          </View>
          <NestedScope />
        </ScrollView>
      </ThemeVariables>
    </TsukiProvider>
  )
}
