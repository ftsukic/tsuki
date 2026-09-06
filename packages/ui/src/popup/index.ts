import { Popup as BasePopup } from './popup'
import { PopupHeader } from './popup-header'
import { PopupPage } from './popup-page'

export const Popup = Object.assign(BasePopup, {
  Header: PopupHeader,
  Page: PopupPage,
})

export { PopupHeader, PopupPage }
export type { PopupHeaderProps, PopupPageProps, PopupPosition, PopupProps } from './interface'
