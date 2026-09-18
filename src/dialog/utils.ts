export function isDialogContentRenderable(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false && value !== ''
}

interface DialogLayoutState {
  titleVisible: boolean
  bodyVisible: boolean
  titleOnly: boolean
  messageOnly: boolean
  titleWithMessage: boolean
}

export function getDialogLayoutState(title: unknown, body: unknown): DialogLayoutState {
  const titleVisible = isDialogContentRenderable(title)
  const bodyVisible = isDialogContentRenderable(body)

  return {
    titleVisible,
    bodyVisible,
    titleOnly: titleVisible && !bodyVisible,
    messageOnly: !titleVisible && bodyVisible,
    titleWithMessage: titleVisible && bodyVisible,
  }
}
