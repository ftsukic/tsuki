import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  page: { padding: 20, gap: 14 },
  description: { color: '#475467', lineHeight: 21 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: {
    backgroundColor: '#eaf2ff',
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: { color: '#175cd3', fontWeight: '600' },
  status: { color: '#175cd3', lineHeight: 21 },
  track: {
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  card: {
    width: 130,
    height: 72,
    backgroundColor: '#1677ff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { color: '#ffffff', fontWeight: '600' },
})
