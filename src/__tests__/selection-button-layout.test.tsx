import { Checkbox, ConfigProvider, FieldCheckbox, FieldRadio, Radio } from '..'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'

it.each([Checkbox, Radio])(
  '%s button uses text line height and padding for its height',
  async (Control) => {
    await render(
      <ConfigProvider
        theme={{
          components: {
            Checkbox: { lineHeight: 22, buttonHeight: 40 },
            Radio: { lineHeight: 22, buttonHeight: 40 },
          },
        }}
      >
        <Control testID="outlined" variant="button" buttonVariant="outlined">
          Outlined text
        </Control>
        <Control testID="filled" variant="button" buttonVariant="filled">
          Filled text
        </Control>
      </ConfigProvider>,
    )
    for (const [id, text] of [
      ['outlined', 'Outlined text'],
      ['filled', 'Filled text'],
    ]) {
      const root = StyleSheet.flatten(screen.getByTestId(id).props.style)
      const label = StyleSheet.flatten(screen.getByText(text).props.style)
      expect(label.lineHeight).toBe(22)
      expect(root.minHeight).toBe(40)
      expect(label.lineHeight + root.paddingVertical * 2 + root.borderWidth * 2).toBe(40)
    }
  },
)

it.each([Checkbox, Radio])(
  '%s button accommodates long text and custom content without a fixed height',
  async (Control) => {
    await render(
      <ConfigProvider
        theme={{ components: { Checkbox: { fontSize: 36 }, Radio: { fontSize: 36 } } }}
      >
        <View style={{ width: 140 }}>
          <Control testID="long" variant="button">
            A long option that wraps
          </Control>
          <Control testID="custom" variant="button">
            <View style={{ height: 80 }}>
              <Text>Custom content</Text>
            </View>
          </Control>
          <Control testID="override" variant="button" style={{ height: 48, minWidth: 80 }}>
            Override
          </Control>
        </View>
      </ConfigProvider>,
    )

    const styleOf = (id: string) => StyleSheet.flatten(screen.getByTestId(id).props.style)
    expect(styleOf('long')).toMatchObject({ minHeight: 32, maxWidth: '100%', flexShrink: 1 })
    expect(styleOf('long').height).toBeUndefined()
    expect(screen.getByText('A long option that wraps').props.numberOfLines).toBeUndefined()
    expect(
      StyleSheet.flatten(screen.getByText('A long option that wraps').props.style).lineHeight,
    ).toBeGreaterThan(32)
    expect(styleOf('custom').height).toBeUndefined()
    expect(styleOf('override')).toMatchObject({ height: 48, minWidth: 80 })
  },
)

describe.each([FieldCheckbox, FieldRadio])('%s button content', (FieldControl) => {
  it.each([false, true])(
    'shares available width with valueExtra when vertical=%s',
    async (vertical) => {
      await render(
        <FieldControl
          title="Selection"
          vertical={vertical}
          style={{ width: 240 }}
          valueExtra={<Text style={{ width: 40 }}>Extra</Text>}
          variant="button"
          direction="horizontal"
          buttonColumns={4}
          testID="group"
          options={[
            { value: 'a', label: 'Long option A' },
            { value: 'b', label: 'B' },
          ]}
        />,
      )

      expect(StyleSheet.flatten(screen.getByTestId('group').props.style)).toMatchObject({
        width: '100%',
        minWidth: 0,
        flexShrink: 1,
      })
      expect(
        StyleSheet.flatten(screen.getByText('Long option A').parent?.props.style),
      ).toMatchObject({
        width: '100%',
        minWidth: 0,
      })
      expect(
        StyleSheet.flatten(screen.getByText('Long option A').parent?.parent?.props.style),
      ).toMatchObject({ width: '50%', minWidth: 0 })
      expect(screen.getByText('Long option A').props.numberOfLines).toBe(1)
      expect(screen.getByText('Extra')).toBeTruthy()
    },
  )

  it('preserves explicit control style overrides', async () => {
    await render(
      <FieldControl
        testID="group"
        styles={{ control: { flexShrink: 0, minWidth: 90 } }}
        options={[{ value: 'a', label: 'A' }]}
      />,
    )
    expect(StyleSheet.flatten(screen.getByTestId('group').props.style)).toMatchObject({
      flexShrink: 0,
      minWidth: 90,
    })
  })
})
