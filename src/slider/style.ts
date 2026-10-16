import { StyleSheet } from 'react-native'

export const sliderStyles = StyleSheet.create({
  root: { minHeight: 44, justifyContent: 'center' },
  body: { height: 44, justifyContent: 'center' },
  rail: { position: 'absolute', left: 0, right: 0, borderRadius: 999 },
  track: { position: 'absolute', borderRadius: 999 },
  thumbContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: '100%', height: '100%', borderRadius: 999, borderWidth: 1 },
  mark: { position: 'absolute', width: 1, height: 8, top: 18 },
  markLabel: { position: 'absolute', top: 36, width: 80, marginLeft: -40, alignItems: 'center' },
})
