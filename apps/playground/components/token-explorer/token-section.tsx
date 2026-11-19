import { Text } from '../../../../packages/tsuki/src'
import { StyleSheet, View } from 'react-native'
import { TokenRow } from './token-row'
import type { TokenDetail } from './token-types'

export function TokenSection({
  title,
  description,
  tokens,
  testID,
}: {
  title: string
  description: string
  tokens: TokenDetail[]
  testID: string
}) {
  return (
    <View style={styles.section} testID={testID}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.tokens}>
        {tokens.map((token) => (
          <TokenRow key={`${testID}-${token.name}`} sectionID={testID} token={token} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { gap: 4 },
  title: { fontSize: 21, lineHeight: 28, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21, opacity: 0.72 },
  tokens: { gap: 8 },
})
