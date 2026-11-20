import { createContext, useContext, useState, type PropsWithChildren } from 'react'
import { TsukiProvider } from '@tsuki-v2/theme/tsuki-provider'
import type { MotionConfig } from '@tsuki-v2/theme/types'
import { useDemoTheme } from '../demo-provider'

export interface LabMotionPolicy extends Required<MotionConfig> {}

interface InteractionLabContextValue {
  motion: LabMotionPolicy
  setMotion: (motion: LabMotionPolicy) => void
}

const DEFAULT_MOTION: LabMotionPolicy = {
  enabled: true,
  reducedMotion: 'system',
  durationScale: 1,
}

const InteractionLabContext = createContext<InteractionLabContextValue | null>(null)

export function InteractionLabProvider({ children }: PropsWithChildren) {
  const { dark } = useDemoTheme()
  const [motion, setMotion] = useState(DEFAULT_MOTION)

  return (
    <InteractionLabContext.Provider value={{ motion, setMotion }}>
      <TsukiProvider scheme={dark ? 'dark' : 'light'} theme={{ motion }}>
        {children}
      </TsukiProvider>
    </InteractionLabContext.Provider>
  )
}

export function useInteractionLab() {
  const context = useContext(InteractionLabContext)
  if (!context) throw new Error('useInteractionLab must be used inside InteractionLabProvider')
  return context
}
