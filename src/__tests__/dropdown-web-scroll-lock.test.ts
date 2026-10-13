/** @jest-environment jsdom */
import { lockWebBackgroundScroll } from '../dropdown/web-scroll-lock'

function setup() {
  const background = document.createElement('div')
  background.style.overflow = 'auto'
  const menu = document.createElement('div')
  const panel = document.createElement('div')
  panel.style.overflowY = 'auto'
  Object.defineProperties(panel, { scrollHeight: { value: 500 }, clientHeight: { value: 100 } })
  background.append(menu)
  document.body.append(background, panel)
  return { background, menu, panel }
}
function wheel(target: HTMLElement, deltaY: number) {
  const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY })
  target.dispatchEvent(event)
  return event.defaultPrevented
}

afterEach(() => {
  document.body.replaceChildren()
})

it('locks nested background containers, permits panel scroll and stops boundary chaining', () => {
  const { background, menu, panel } = setup()
  const release = lockWebBackgroundScroll(menu, () => panel, jest.fn(), jest.fn())
  try {
    expect(background.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).toBe('hidden')
    expect(wheel(background, 20)).toBe(true)
    expect(wheel(menu, 20)).toBe(true)
    expect(wheel(panel, 20)).toBe(false)
    expect(wheel(panel, -20)).toBe(true)
    panel.scrollTop = 400
    expect(wheel(panel, 20)).toBe(true)
  } finally {
    release()
  }
  expect(background.style.overflow).toBe('auto')
  expect(document.body.style.overflow).toBe('')
  expect(wheel(background, 20)).toBe(false)
})

it('shares locks and allowed panels, closes only the latest popup on Escape, and restores CSS priority', () => {
  const { menu, panel } = setup()
  document.body.style.setProperty('overflow', 'scroll', 'important')
  const firstClose = jest.fn()
  const secondClose = jest.fn()
  const first = lockWebBackgroundScroll(menu, () => panel, firstClose, jest.fn())
  const otherPanel = document.createElement('div')
  otherPanel.style.overflowY = 'auto'
  Object.defineProperties(otherPanel, {
    scrollHeight: { value: 500 },
    clientHeight: { value: 100 },
  })
  document.body.append(otherPanel)
  const second = lockWebBackgroundScroll(menu, () => otherPanel, secondClose, jest.fn())
  try {
    expect(wheel(panel, 20)).toBe(false)
    expect(wheel(otherPanel, 20)).toBe(false)
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    expect(firstClose).not.toHaveBeenCalled()
    expect(secondClose).toHaveBeenCalledTimes(1)
    first()
    expect(document.body.style.overflow).toBe('hidden')
  } finally {
    first()
    second()
  }
  expect(document.body.style.overflow).toBe('scroll')
  expect(document.body.style.getPropertyPriority('overflow')).toBe('important')
  document.body.style.removeProperty('overflow')
})

it('closes when a locked ancestor is programmatically scrolled', () => {
  const { background, menu, panel } = setup()
  const onAnchorScroll = jest.fn()
  const release = lockWebBackgroundScroll(menu, () => panel, jest.fn(), onAnchorScroll)
  try {
    panel.dispatchEvent(new Event('scroll'))
    expect(onAnchorScroll).not.toHaveBeenCalled()
    background.dispatchEvent(new Event('scroll'))
    expect(onAnchorScroll).toHaveBeenCalledTimes(1)
  } finally {
    release()
  }
})

it('preserves overflow longhands and permits only horizontal scrolling in the menu', () => {
  const { background, menu, panel } = setup()
  background.style.removeProperty('overflow')
  background.style.setProperty('overflow-x', 'hidden', 'important')
  background.style.setProperty('overflow-y', 'scroll')
  menu.style.overflowX = 'auto'
  Object.defineProperties(menu, { scrollWidth: { value: 600 }, clientWidth: { value: 300 } })
  const release = lockWebBackgroundScroll(menu, () => panel, jest.fn(), jest.fn())
  try {
    const horizontal = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX: 100 })
    menu.dispatchEvent(horizontal)
    expect(horizontal.defaultPrevented).toBe(false)
    expect(wheel(menu, 100)).toBe(true)
  } finally {
    release()
  }
  expect(background.style.getPropertyValue('overflow-x')).toBe('hidden')
  expect(background.style.getPropertyPriority('overflow-x')).toBe('important')
  expect(background.style.getPropertyValue('overflow-y')).toBe('scroll')
})
