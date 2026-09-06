import { StyleSheet } from 'react-native'

export function createSwitchStyles() {
  return StyleSheet.create({
    pressable: {
      alignSelf: 'flex-start',
    },
    track: {
      overflow: 'hidden',
      position: 'relative',
    },
    childrenWrap: {
      overflow: 'hidden',
      position: 'relative',
    },
    thumb: {
      alignItems: 'center',
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      top: 2,
    },
    children: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}
