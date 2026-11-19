import { useState } from 'react'
import type { ComponentType, PropsWithChildren } from 'react'
import {
  Button,
  Card,
  Cell,
  CellGroup,
  ConfigProvider,
  Divider,
  Icon,
  Input,
  Space,
  Surface,
  Text,
  TextClassContext,
  useTsukiTheme,
} from '@ftsukic/tsuki'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { ThemeScheme } from '@ftsukic/tsuki'

export type ConsumerAppearance = 'system' | ThemeScheme

export interface ConsumerThemeVariablesProps extends PropsWithChildren {
  className?: string
  style?: StyleProp<ViewStyle>
}

export interface ConsumerDemoProps {
  title: string
  appearance: ConsumerAppearance
  scheme: ThemeScheme
  onCycleAppearance: () => void
  ThemeVariables: ComponentType<ConsumerThemeVariablesProps>
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  control: {
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.72 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconTarget: { padding: 16 },
})

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
function NestedScope({ ThemeVariables }: Pick<ConsumerDemoProps, 'ThemeVariables'>) {
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

export function ConsumerDemo({
  title,
  appearance,
  scheme,
  onCycleAppearance,
  ThemeVariables,
}: ConsumerDemoProps) {
  const theme = useTsukiTheme()
  const [cardSaved, setCardSaved] = useState(false)
  const [cellCount, setCellCount] = useState(0)
  const [surfacePadding, setSurfacePadding] = useState(10)
  const [dividerThickness, setDividerThickness] = useState(3)
  const [gap, setGap] = useState(7)
  const [iconPresses, setIconPresses] = useState(0)

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.semantic.colorBackground }]}
      contentContainerStyle={styles.content}
      testID="consumer-demo-scroll"
    >
      <Text className="text-tsuki-foreground text-2xl font-bold">{title}</Text>
      <Text className="text-tsuki-muted">Scheme: {scheme}</Text>
      <Pressable
        accessibilityLabel="Cycle color scheme"
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.control,
          { backgroundColor: theme.semantic.colorSurface },
          pressed && styles.pressed,
        ]}
        testID="scheme-toggle"
        onPress={onCycleAppearance}
      >
        <Text className="text-tsuki-foreground">Change scheme ({appearance})</Text>
      </Pressable>
      <ConfigProvider
        theme={{
          semantic: { colorMuted: '#7c3aed' },
          components: { Cell: { minHeight: 48, groupInsetMarginHorizontal: 12 } },
        }}
      >
        <CellGroup inset title="Cell settings" extra="Local theme" testID="cell-group">
          <Cell
            testID="cell-action"
            accessibilityLabel="Change Cell count"
            title="Tap Cell"
            leading={<Icon name="InfoCircleOutlined" />}
            trailing="Ready"
            value={`Count: ${cellCount}`}
            showArrow
            onPress={() => setCellCount((count) => count + 1)}
            onLongPress={() => setCellCount((count) => count + 10)}
          />
          <Cell
            testID="cell-overrides"
            vertical
            title="A very long row title that should remain inside the inset group without pushing the arrow out of the row"
            titleLines={1}
            description="Vertical layout"
            value="Native style"
            valueAlign="left"
            showArrow
            className="bg-lime-200"
            style={{ paddingHorizontal: 12 }}
            classNames={{ container: 'px-8', title: 'text-blue-700', value: 'text-green-800' }}
            styles={{ container: { paddingHorizontal: 12 }, value: { color: '#b91c1c' } }}
          />
          <Cell
            testID="cell-disabled"
            title="Disabled Cell"
            value="Unavailable"
            disabled
            onPress={() => setCellCount((count) => count + 100)}
          />
        </CellGroup>
      </ConfigProvider>
      <Card testID="card-simple" className="opacity-100">
        <Text>Simple card</Text>
      </Card>
      <ConfigProvider
        theme={{
          components: { Card: { padding: cardSaved ? 10 : 6, headerPadding: 4, gap: 8 } },
        }}
      >
        <Card testID="card-full" bordered className="opacity-100">
          <Card.Header testID="card-header" className="p-2">
            <Space align="center" gap={4}>
              <Icon name="InfoCircleOutlined" />
              <Text>Card details</Text>
            </Space>
          </Card.Header>
          <Card.Body testID="card-body" className="p-4" style={{ padding: 8 }}>
            <Text>{cardSaved ? 'Card saved' : 'Card body'}</Text>
          </Card.Body>
          <Card.Footer testID="card-footer" className="p-1">
            <Button onPress={() => setCardSaved(true)}>Save card</Button>
          </Card.Footer>
        </Card>
      </ConfigProvider>
      <Card
        testID="card-overrides"
        className="bg-red-500 p-4 gap-4"
        style={{ backgroundColor: '#15803d', padding: 5, gap: 3 }}
      >
        <Text>Override first</Text>
        <Text>Override second</Text>
      </Card>

      <Surface testID="surface-default" className="opacity-100">
        <Text>Surface default</Text>
      </Surface>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
        testID="surface-padding-toggle"
        onPress={() => setSurfacePadding((value) => (value === 10 ? 20 : 10))}
      >
        <Text>Change surface padding ({surfacePadding})</Text>
      </Pressable>
      <ConfigProvider
        theme={{
          semantic: { colorSurface: '#7c3aed', colorBorder: '#f59e0b' },
          components: { Surface: { borderRadius: 6, padding: surfacePadding, borderWidth: 2 } },
        }}
      >
        <Surface bordered inset className="opacity-100" testID="surface-theme">
          <Text>Surface theme</Text>
        </Surface>
      </ConfigProvider>
      <Surface
        bordered
        radius={3}
        padding={2}
        borderWidth={1}
        className="bg-red-500 rounded-xl p-4 border-4 border-green-500"
        testID="surface-class"
      >
        <Text>Surface class</Text>
      </Surface>
      <Surface
        className="bg-red-500 rounded-xl p-4 border-4 border-green-500"
        style={{
          backgroundColor: '#15803d',
          borderRadius: 0,
          borderWidth: 2,
          borderColor: '#123456',
          padding: 7,
        }}
        testID="surface-style"
      >
        <Text>Surface style</Text>
      </Surface>

      <Divider className="opacity-100" testID="divider-default" />
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
        testID="divider-thickness-toggle"
        onPress={() => setDividerThickness((value) => (value === 3 ? 7 : 3))}
      >
        <Text>Change divider thickness ({dividerThickness})</Text>
      </Pressable>
      <ConfigProvider
        theme={{
          semantic: { colorBorder: '#7c3aed' },
          components: { Divider: { thickness: dividerThickness } },
        }}
      >
        <Divider className="opacity-100" inset={12} testID="divider-theme" />
        <Space style={{ height: 40 }}>
          <Divider
            orientation="vertical"
            className="opacity-100"
            inset={6}
            testID="divider-vertical"
          />
        </Space>
      </ConfigProvider>
      <Divider className="bg-red-500 h-4" color="#7c3aed" thickness={3} testID="divider-class" />
      <Divider
        className="bg-red-500 h-4"
        style={{ backgroundColor: '#15803d', height: 9 }}
        testID="divider-style"
      />

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
      <Text testID="root-text">Basic text</Text>
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
      <View style={styles.inlineRow}>
        <View style={styles.iconTarget}>
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
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
        testID="space-gap-toggle"
        onPress={() => setGap((value) => (value === 7 ? 19 : 7))}
      >
        <Text>Change Space gap ({gap})</Text>
      </Pressable>
      <Space gap={gap} className="bg-tsuki-surface" testID="space-gap">
        <Text>Gap A</Text>
        <Text>Gap B</Text>
      </Space>
      <Space gap={7} className="flex-col gap-4">
        <Text>Class A</Text>
        <Text>Class B</Text>
      </Space>
      <Space
        direction="vertical"
        gap={7}
        className="flex-col gap-4"
        style={{ flexDirection: 'row', gap: 24 }}
      >
        <Text>Style A</Text>
        <Text>Style B</Text>
      </Space>
      <Space gap={8} wrap style={{ width: 120 }}>
        <Text style={{ width: 80 }}>Wrap A</Text>
        <Text style={{ width: 80 }}>Wrap B</Text>
      </Space>
      <NestedScope ThemeVariables={ThemeVariables} />
    </ScrollView>
  )
}
