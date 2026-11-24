import { useState } from 'react'
import { ChoiceControl } from '@/components/interaction-lab/common/choice-control'
import { LabScreen } from '@/components/interaction-lab/common/lab-screen'
import { OverlayBackLab } from '@/components/interaction-lab/overlay/overlay-back-lab'
import { OverlayAccessibilityLab } from '@/components/interaction-lab/overlay/overlay-accessibility-lab'
import { OverlayDeclarativeLab } from '@/components/interaction-lab/overlay/overlay-declarative-lab'
import { OverlayImperativeLab } from '@/components/interaction-lab/overlay/overlay-imperative-lab'
import { OverlayStackLab } from '@/components/interaction-lab/overlay/overlay-stack-lab'
import { OverlayThemeLab } from '@/components/interaction-lab/overlay/overlay-theme-lab'
import { OverlayTouchLab } from '@/components/interaction-lab/overlay/overlay-touch-lab'
import { OverlayTransitionLab } from '@/components/interaction-lab/overlay/overlay-transition-lab'

const LABS = [
  { label: 'Stack', value: 'stack' },
  { label: 'Back', value: 'back' },
  { label: 'Theme', value: 'theme' },
  { label: 'Touch', value: 'touch' },
  { label: 'Transitions', value: 'transitions' },
  { label: 'Accessibility', value: 'accessibility' },
  { label: 'Declarative', value: 'declarative' },
  { label: 'Imperative', value: 'imperative' },
] as const

export default function OverlayLab() {
  const [activeLab, setActiveLab] = useState<(typeof LABS)[number]['value']>('stack')

  return (
    <LabScreen
      title="Overlay Runtime"
      description="Live entries rendered by the application root's private Registry and View Host."
    >
      <ChoiceControl
        label="Overlay Lab"
        options={LABS}
        onChange={setActiveLab}
        testID="overlay-lab"
        value={activeLab}
      />
      {activeLab === 'stack' ? <OverlayStackLab /> : null}
      {activeLab === 'back' ? <OverlayBackLab /> : null}
      {activeLab === 'theme' ? <OverlayThemeLab /> : null}
      {activeLab === 'touch' ? <OverlayTouchLab /> : null}
      {activeLab === 'transitions' ? <OverlayTransitionLab /> : null}
      {activeLab === 'accessibility' ? <OverlayAccessibilityLab /> : null}
      {activeLab === 'declarative' ? <OverlayDeclarativeLab /> : null}
      {activeLab === 'imperative' ? <OverlayImperativeLab /> : null}
    </LabScreen>
  )
}
