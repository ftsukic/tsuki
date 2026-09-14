import { GestureBoundary } from '@ftsukic/tsuki'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import FixtureExplorer from './components/fixture-explorer'

export default function App() {
  return (
    <KeyboardProvider preload={false}>
      <GestureBoundary>
        <FixtureExplorer />
      </GestureBoundary>
    </KeyboardProvider>
  )
}
