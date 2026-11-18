import { getPopupKeyboardLayout } from '../popup/keyboard-layout'

describe('Popup keyboard layout', () => {
  it('moves a centered panel only by its overlap, not half the keyboard height', () => {
    expect(getPopupKeyboardLayout(0, 800, 300, 500, 'center')).toEqual({
      availableHeight: 500,
      overlap: 300,
      offset: 50,
    })
    expect(getPopupKeyboardLayout(0, 800, 160, 500, 'center').offset).toBe(0)
  })

  it('pins a bottom panel to the keyboard without adding an extra gap', () => {
    expect(getPopupKeyboardLayout(0, 800, 300, 500, 'bottom').offset).toBe(300)
  })

  it('preserves the top position and limits oversized panels', () => {
    expect(getPopupKeyboardLayout(0, 800, 700, 400, 'top')).toEqual({
      availableHeight: 400,
      overlap: 400,
      offset: 0,
    })
    expect(getPopupKeyboardLayout(0, 800, 700, 400, 'center').offset).toBe(200)
  })

  it('uses host coordinates and avoids subtracting a resized window twice', () => {
    expect(getPopupKeyboardLayout(100, 700, 300, 500, 'center').offset).toBe(100)
    expect(getPopupKeyboardLayout(0, 500, 300, 500, 'bottom').offset).toBe(0)
    expect(getPopupKeyboardLayout(0, 800, 300, undefined, 'center').offset).toBe(0)
  })
})
