import { Text, getDesignToken } from '..'
import { TextInheritanceProvider } from '../text/text-inheritance-provider'
import { Fragment } from 'react'
import { render, screen } from '@testing-library/react-native'
import { StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'

function NestedText({ testID, children }: { testID: string; children: ReactNode }) {
  return (
    <View>
      <View>
        <Text testID={testID}>{children}</Text>
      </View>
    </View>
  )
}

describe('Text inheritance', () => {
  it('passes inherited styles through nested components, Fragments, and arrays', async () => {
    await render(
      <TextInheritanceProvider style={{ color: '#204060', fontSize: 19, fontWeight: '600' }}>
        {[
          <NestedText key="nested" testID="nested-text">
            Nested
          </NestedText>,
          <Fragment key="fragment-group">
            <NestedText key="fragment" testID="fragment-text">
              Fragment
            </NestedText>
          </Fragment>,
        ]}
      </TextInheritanceProvider>,
    )

    for (const testID of ['nested-text', 'fragment-text']) {
      expect(StyleSheet.flatten(screen.getByTestId(testID).props.style)).toMatchObject({
        color: '#204060',
        fontSize: 19,
        fontWeight: '600',
      })
    }
    expect(screen.getByText('Nested')).toBeTruthy()
  })

  it('merges inherited and local class names with Tailwind conflict resolution', async () => {
    await render(
      <TextInheritanceProvider className="text-red-500 font-bold px-4">
        <Text testID="merged-class" className="text-blue-500 font-normal px-2">
          Merged
        </Text>
      </TextInheritanceProvider>,
    )

    expect(screen.getByTestId('merged-class').props.className).toBe(
      'text-blue-500 font-normal px-2',
    )
  })

  it('preserves important AppTheme typography and color utilities during inheritance merging', async () => {
    await render(
      <TextInheritanceProvider className="text-red-500 font-bold px-4">
        <Text
          testID="app-theme-class"
          className="!type-page-title !text-app-text-primary font-normal px-2"
        >
          AppTheme
        </Text>
      </TextInheritanceProvider>,
    )

    expect(screen.getByTestId('app-theme-class').props.className).toBe(
      'text-red-500 !type-page-title !text-app-text-primary font-normal px-2',
    )
  })

  it('lets local type, size, and weight props replace inherited values', async () => {
    await render(
      <TextInheritanceProvider
        style={{ color: '#204060', fontSize: 10, lineHeight: 12, fontWeight: '300' }}
      >
        <Text testID="inherited-text">Inherited</Text>
        <Text testID="overridden-text" type="secondary" size="large" weight="700">
          Overridden
        </Text>
      </TextInheritanceProvider>,
    )

    const token = getDesignToken()
    expect(StyleSheet.flatten(screen.getByTestId('inherited-text').props.style)).toMatchObject({
      color: '#204060',
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '300',
    })
    expect(StyleSheet.flatten(screen.getByTestId('overridden-text').props.style)).toMatchObject({
      color: token.colorTextSecondary,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: '700',
    })
  })

  it('keeps the local inline style above inherited and semantic styles', async () => {
    await render(
      <TextInheritanceProvider
        style={{ color: '#204060', fontSize: 19, lineHeight: 23, fontWeight: '600' }}
      >
        <Text
          testID="inline-override"
          type="secondary"
          size="large"
          weight="700"
          style={{ color: '#c02040', fontSize: 11, lineHeight: 13, fontWeight: '400' }}
        >
          Inline
        </Text>
      </TextInheritanceProvider>,
    )

    expect(StyleSheet.flatten(screen.getByTestId('inline-override').props.style)).toMatchObject({
      color: '#c02040',
      fontSize: 11,
      lineHeight: 13,
      fontWeight: '400',
    })
  })
})
