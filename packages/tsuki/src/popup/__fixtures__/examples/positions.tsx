/**
 * @title Five Positions
 * @description Switches between centered, edge-aligned, and side Popup layouts.
 */
import { useState } from 'react'
import { Button, Popup, Text } from '@ftsukic/tsuki'
import type { PopupPosition } from '@ftsukic/tsuki'

const positions: PopupPosition[] = ['center', 'top', 'bottom', 'left', 'right']

export default function PopupPositions() {
  const [position, setPosition] = useState<PopupPosition>('center')
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Text>Position: {position}</Text>
      {positions.map((nextPosition) => (
        <Button
          key={nextPosition}
          onPress={() => {
            setPosition(nextPosition)
            setVisible(true)
          }}
        >{`Open ${nextPosition}`}</Button>
      ))}
      <Popup position={position} visible={visible} onVisibleChange={setVisible}>
        <Text className="p-5">{position} Popup</Text>
      </Popup>
    </>
  )
}
