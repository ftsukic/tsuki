import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Cell,
  CellGroup,
  Divider,
  Input,
  Surface,
  Text,
  useTsukiTheme,
} from '../../../../packages/tsuki/src'
import type { ThemeConfig } from '../../../../packages/tsuki/src'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

type ComponentName = keyof NonNullable<ThemeConfig['components']>

const componentNames: ComponentName[] = ['Button', 'Input', 'Divider', 'Surface', 'Card', 'Cell']

interface ComponentSectionProps {
  overrides: ThemeConfig
  onChange: (theme: ThemeConfig) => void
}

export function ComponentTokenSection({ overrides, onChange }: ComponentSectionProps) {
  const theme = useTsukiTheme()

  function updateToken(component: ComponentName, token: string, value: number) {
    onChange({
      ...overrides,
      components: {
        ...overrides.components,
        [component]: {
          ...overrides.components?.[component],
          [token]: value,
        },
      } as NonNullable<ThemeConfig['components']>,
    })
  }

  return (
    <View style={styles.section} testID="component-token-section">
      <View style={styles.heading}>
        <Text style={styles.title}>Component Tokens</Text>
        <Text style={styles.description}>
          Edit a value to update the component preview. Values come from the current resolved theme.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange({})}
          style={[
            styles.resetButton,
            {
              backgroundColor: theme.semantic.colorSurface,
              borderColor: theme.semantic.colorBorder,
            },
          ]}
          testID="reset-component-overrides"
        >
          <Text style={styles.resetLabel}>Reset component overrides</Text>
        </Pressable>
      </View>
      {componentNames.map((component) => (
        <Card key={component} testID={`component-token-card-${component}`}>
          <Card.Header>
            <Text style={styles.componentTitle}>{component}</Text>
          </Card.Header>
          <Card.Body>
            <View style={styles.tokenList}>
              {Object.entries(theme.components[component]).map(([token, value]) => (
                <NumericTokenEditor
                  key={token}
                  label={`${component} ${token}`}
                  testID={`token-input-${component}-${token}`}
                  textColor={theme.semantic.colorForeground}
                  backgroundColor={theme.semantic.colorSurface}
                  borderColor={theme.semantic.colorBorder}
                  unit={token === 'disabledOpacity' ? 'opacity' : 'dp'}
                  value={value}
                  onChange={(nextValue) => updateToken(component, token, nextValue)}
                />
              ))}
            </View>
            <View style={styles.preview} testID={`component-preview-${component}`}>
              {renderPreview(component)}
            </View>
          </Card.Body>
        </Card>
      ))}
    </View>
  )
}

function NumericTokenEditor({
  label,
  testID,
  textColor,
  backgroundColor,
  borderColor,
  value,
  unit,
  onChange,
}: {
  label: string
  testID: string
  textColor: string
  backgroundColor: string
  borderColor: string
  value: number
  unit: string
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => setDraft(String(value)), [value])

  return (
    <View style={styles.tokenRow}>
      <Text style={styles.tokenLabel}>{readableTokenName(label)}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType="decimal-pad"
        onBlur={() => {
          if (draft.trim() === '' || !Number.isFinite(Number(draft))) setDraft(String(value))
        }}
        onChangeText={(text) => {
          setDraft(text)
          if (text.trim() !== '' && Number.isFinite(Number(text))) onChange(Number(text))
        }}
        selectTextOnFocus
        style={[styles.numberInput, { color: textColor, backgroundColor, borderColor }]}
        testID={testID}
        value={draft}
      />
      <Text style={styles.unit}>{unit}</Text>
    </View>
  )
}

function renderPreview(component: ComponentName) {
  switch (component) {
    case 'Button':
      return (
        <Button onPress={() => {}} testID="theme-button-preview">
          Theme button
        </Button>
      )
    case 'Input':
      return <Input accessibilityLabel="Theme input preview" placeholder="Theme input" />
    case 'Divider':
      return (
        <View style={styles.dividerPreview}>
          <Text>Above divider</Text>
          <Divider testID="theme-divider-preview" />
          <Text>Below divider</Text>
        </View>
      )
    case 'Surface':
      return (
        <Surface bordered testID="theme-surface-preview">
          <Text>Surface preview</Text>
        </Surface>
      )
    case 'Card':
      return (
        <Card testID="theme-card-preview">
          <Card.Header>
            <Text>Card header</Text>
          </Card.Header>
          <Card.Body>
            <Text>Card body preview</Text>
          </Card.Body>
          <Card.Footer>
            <Text>Card footer</Text>
          </Card.Footer>
        </Card>
      )
    case 'Cell':
      return (
        <CellGroup title="Cell group preview" extra="Tokens" inset>
          <Cell
            title="Standard cell"
            titleExtra="New"
            description="Description uses its own font and line height."
            value="Value"
            valueExtra="More"
            showArrow
          />
          <Cell
            title="Large vertical cell"
            description="Large size and vertical spacing."
            size="large"
            vertical
            showArrow
          />
          <Cell title="Disabled cell" disabled value="Unavailable" />
        </CellGroup>
      )
  }
}

function readableTokenName(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (first) => first.toUpperCase())
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  heading: { gap: 8 },
  title: { fontSize: 21, lineHeight: 28, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21, opacity: 0.72 },
  resetButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  resetLabel: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  componentTitle: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  tokenList: { gap: 8 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40 },
  tokenLabel: { flex: 1, fontSize: 13, lineHeight: 18 },
  numberInput: {
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'right',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#94a3b8',
    fontSize: 14,
  },
  unit: { minWidth: 40, fontSize: 12, lineHeight: 18, opacity: 0.72 },
  preview: { gap: 8, marginTop: 12 },
  dividerPreview: { gap: 8 },
})
