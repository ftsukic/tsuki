import { DeviceEventEmitter } from 'react-native'

const SWIPE_CELL_CLICK_AWAY_EVENT = 'TIANSHU_SWIPE_CELL_CLICK_AWAY'

export function emitSwipeCellClickAway() {
  DeviceEventEmitter.emit(SWIPE_CELL_CLICK_AWAY_EVENT)
}

export function subscribeSwipeCellClickAway(listener: () => void) {
  return DeviceEventEmitter.addListener(SWIPE_CELL_CLICK_AWAY_EVENT, listener)
}
