import { getAlphaColor } from '../themes/default/colorAlgorithm'
import type { AliasToken } from './alias'
import type { ColorValue, TextStyle } from 'react-native'

export interface ButtonToken {
  paddingInline: number
  paddingInlineSM: number
  paddingInlineLG: number
  contentFontSize: number
  contentFontSizeSM: number
  contentFontSizeLG: number
  primaryBg: string
  primaryBgHover: string
  primaryBgActive: string
  primaryColor: string
  defaultBg: string
  defaultBorderColor: string
  defaultColor: string
  defaultBgHover: string
  defaultBgActive: string
  defaultBorderColorHover: string
  defaultBorderColorActive: string
  textBgHover: string
  textBgActive: string
  linkColor: string
  linkColorHover: string
  linkColorActive: string
  dangerBg: string
  dangerBgHover: string
  dangerBgActive: string
  dangerColor: string
  dangerColorHover: string
  dangerColorActive: string
  iconGap: number
  activeOpacity: number
  disabledOpacity: number
  subtextOpacity: number
}

export interface TypographyToken {
  fontFamily: string
  fontFamilyCode: string
  fontSize: number
  fontSizeSM: number
  fontSizeLG: number
  fontSizeXL: number
  color: string
  colorSecondary: string
  colorDisabled: string
  lineHeight: number
  headingColor: string
}

export interface CellToken {
  backgroundColor: string
  activeColor: string
  activeOpacity: number
  borderColor: string
  paddingHorizontal: number
  paddingVertical: number
  minHeight: number
  titleColor: string
  valueColor: string
  extraColor: string
  groupTitleColor: string
  fontSize: number
  groupTitleFontSize: number
  lineHeight: number
  extraFontSize: number
  extraLineHeight: number
  valueMinWidth: number
  iconColor: string
  iconSize: number
  iconGap: number
  requiredColor: string
  requiredWidth: number
}

export interface SwipeCellToken {
  actionTextColor: string
  actionFontSize: number
  actionPaddingHorizontal: number
  actionMinWidth: number
  actionMinHeight: number
  actionBackgroundColor: string
  actionDisabledOpacity: number
}

export interface SwipeToken {
  dotSize: number
  dotGap: number
  dotColor: string
  dotActiveColor: string
  paginationOffset: number
}

export interface PopupToken {
  backgroundColor: string
  overlayColor: string
  borderRadius: number
  headerHeight: number
  headerPaddingHorizontal: number
  headerTitleColor: string
  headerTitleFontSize: number
  closeColor: string
  closeSize: number
  closeHitSlop: number
  zIndex: number
}

export interface OverlayToken {
  backgroundColor: string
  zIndex: number
}

export interface PickerToken {
  backgroundColor: string
  toolbarBackgroundColor: string
  toolbarTextColor: string
  titleColor: string
  textColor: string
  disabledTextColor: string
  toolbarPaddingHorizontal: number
  toolbarPaddingVertical: number
}

export interface TreeToken {
  activeColor: string
  textColor: string
  disabledTextColor: string
  rowActiveBackgroundColor: string
  rowHeight: number
  rowPaddingHorizontal: number
  labelMarginHorizontal: number
  switcherWidth: number
  switcherPadding: number
  switcherBorderRadius: number
  switcherHighlightBackgroundColor: string
  activeOpacity: number
}

export interface InputToken {
  height: number
  heightSM: number
  heightLG: number
  borderRadius: number
  paddingHorizontal: number
  backgroundColor: string
  borderColor: string
  activeBorderColor: string
  activeShadowColor: string
  placeholderColor: string
  textColor: string
  disabledBackgroundColor: string
  disabledColor: string
  errorBorderColor: string
  warningBorderColor: string
  selectionColor: string
  borderWidth: number
  paddingVertical: number
  clearButtonSize: number
  clearButtonBackgroundColor: string
  clearButtonColor: string
  prefixColor: string
  addonColor: string
  wordLimitColor: string
  wordLimitFontSize: number
}

export interface CardToken {
  backgroundColor: string
  borderColor: string
  borderRadius: number
  padding: number
  headerMinHeight: number
  headerMinHeightSM: number
  titleFontSize: number
  footerFontSize: number
  shadow: string
  titleColor: string
  footerColor: string
}

export interface DividerToken {
  color: ColorValue
  width: number
  style: 'solid' | 'dashed' | 'dotted'
  margin: number
  fontSize: number
}

export interface ModalToken {
  backgroundColor: string
  maskColor: string
  borderRadius: number
  padding: number
  titleColor: string
  contentColor: string
  width: number
  zIndex: number
}

export interface TabsToken {
  height: number
  backgroundColor: string
  color: string
  activeColor: string
  indicatorColor: string
  indicatorHeight: number
  borderColor: string
}

export interface BadgeToken {
  borderRadius: number
  fontSize: number
  paddingHorizontal: number
  size: number
  dotSize: number
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | undefined
}

export interface TagToken {
  borderRadius: number
  paddingHorizontal: number
  lHeight: number
  mHeight: number
  sHeight: number
  lFontSize: number
  mFontSize: number
  sFontSize: number
  lPaddingHorizontal: number
  mPaddingHorizontal: number
  sPaddingHorizontal: number
  lCloseIcon: number
  mCloseIcon: number
  sCloseIcon: number
}

export interface LoadingToken {
  gap: number
  textColor: string
  textFontSize: number
  iconColor: string
  iconSize: number
  animationDuration: number
}

export interface ResultToken {
  iconSize: number
  titleFontSize: number
  titleLineHeight: number
  subtitleFontSize: number
  subtitleLineHeight: number
}

export interface NavBarToken {
  arrowSize: number
  height: number
  gap: number
  activeOpacity: number
  backgroundColor: string
  titleColor: string
  titleFontSize: number
  iconColor: string
}

export interface PopoverToken {
  borderRadius: number
  backgroundColor: string
  darkBackgroundColor: string
  itemPaddingHorizontal: number
  itemPaddingVertical: number
  dividerColor: string
  darkDividerColor: string
  textColor: string
  darkTextColor: string
  textFontSize: number
  disabledOpacity: number
  shadowColor: string
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

export interface CollapseToken {
  transitionDuration: number
  backgroundColor: string
  iconColor: string
  iconSize: number
  bodyPaddingHorizontal: number
  bodyPaddingVertical: number
}

export interface DescriptionToken {
  fontSizeLG: number
  lineHeightLG: number
  fontSize: number
  lineHeight: number
  fontSizeSM: number
  lineHeightSM: number
  labelColor: string
  textColor: string
}

export interface ActionSheetToken {
  descriptionColor: string
  descriptionFontSize: number
  descriptionLineHeight: number
  descriptionPaddingVertical: number
  actionTextColor: string
  actionFontSize: number
  actionBackgroundColor: string
  actionPressedBackgroundColor: string
  actionDisabledTextColor: string
  actionPaddingHorizontal: number
  actionPaddingVertical: number
  actionMinHeight: number
  actionDividerColor: string
  cancelBackgroundColor: string
  cancelPressedBackgroundColor: string
  cancelTextColor: string
  cancelFontSize: number
  cancelPaddingHorizontal: number
  cancelPaddingVertical: number
  cancelMinHeight: number
  pressedOpacity: number
  cancelGapHeight: number
  cancelGapColor: string
}

export interface ButtonBarToken {
  buttonSpace: number
  buttonMinWidth: number
}

export interface ToastToken {
  backgroundColor: string
  borderRadius: number
  textBorderRadius: number
  iconColor: string
  iconPadding: number
  iconSize: number
  innerPaddingVertical: number
  innerPaddingHorizontal: number
  innerWidth: number
  innerMinHeight: number
  fontSize: number
  textColor: string
  lineHeight: number
  textMinWidth: number
  textPaddingVertical: number
  textPaddingHorizontal: number
  textMarginTop: number
}

export interface NotifyToken {
  textColor: string
  paddingVertical: number
  paddingHorizontal: number
  fontSize: number
  lineHeight: number
  primaryBackgroundColor: string
  successBackgroundColor: string
  errorBackgroundColor: string
  warningBackgroundColor: string
}

export interface DialogToken {
  width: number
  transitionDuration: number
  borderRadius: number
  backgroundColor: string
  closeColor: string
  closeSize: number
  headerFontSize: number
  headerFontWeight: TextStyle['fontWeight']
  headerColor: string
  headerLineHeight: number
  headerPaddingTop: number
  headerPaddingBottom: number
  messagePaddingHorizontal: number
  messageFontSize: number
  messageLineHeight: number
  messageTextColor: string
  footerMarginTop: number
  footerDividerColor: string
  confirmTextColor: string
  cancelTextColor: string
  inputMarginHorizontal: number
  inputMarginTop: number
  inputPaddingBottom: number
  inputMaxHeight: number
}

export const dialogTitleFontSizes = [14, 16, 18] as const
export type DialogTitleFontSize = (typeof dialogTitleFontSizes)[number]

export interface TabBarToken {
  itemPaddingHorizontal: number
  textFontSize: number
  textAloneFontSize: number
  textMarginTop: number
  textColor: string
  activeTextColor: string
  iconColor: string
  activeIconColor: string
  indicatorColor: string
  indicatorHeight: number
  badgeFontSize: number
  badgeColor: string
}

export interface SidebarToken {
  backgroundColor: string
  itemBackgroundColor: string
  underlayColor: string
  paddingVertical: number
  paddingHorizontal: number
  borderRadius: number
  barWidth: number
  barHeight: number
  textLineHeight: number
  textFontSize: number
  barBackgroundColor: string
  activeTextColor: string
  inactiveTextColor: string
  disabledTextColor: string
}

export interface SearchToken {
  backgroundColor: string
  paddingHorizontal: number
  paddingVertical: number
  gap: number
  iconSize: number
  backIconSize: number
  inputBorderRadius: number
  backIconColor: string
  inputBackgroundColor: string
}

export interface StepsToken {
  backgroundColor: string
  paddingVertical: number
  paddingHorizontal: number
  dotSize: number
  activeDotSize: number
  activeDotBackgroundColor: string
  iconSuccessSize: number
  titleSize: number
  lineNormalColor: string
  titleColor: string
  dotColor: string
  lineWidth: number
  iconPaddingHorizontal: number
  iconMarginBottom: number
  titleMarginHorizontal: number
}

export interface NoticeBarToken {
  paddingVertical: number
  paddingHorizontal: number
  paddingVerticalSM: number
  paddingHorizontalSM: number
  textLineHeight: number
  borderRadius: number
  textFontSize: number
  iconSize: number
  iconMarginHorizontal: number
}

export interface CheckboxToken {
  size: number
  gap: number
  groupGap: number
  borderRadius: number
  borderColor: string
  labelColor: string
  labelDisabledColor: string
  activeOpacity: number
  checkedBackgroundColor: string
  checkedColor: string
  disabledBackgroundColor: string
  disabledBorderColor: string
}

export interface SwitchToken {
  width: number
  height: number
  borderRadius: number
  checkedBackgroundColor: string
  uncheckedBackgroundColor: string
  thumbColor: string
  contentColor: string
  disabledOpacity: number
}

export interface NavTabToken {
  backgroundColor: string
  paddingVertical: number
  paddingHorizontal: number
  borderRadius: number
  height: number
  itemMinWidth: number
  activeBackgroundColor: string
  fontSize: number
  lineHeight: number
  itemPaddingVertical: number
  itemPaddingHorizontal: number
  textColor: string
  activeTextColor: string
  activeOpacity: number
}

export interface SegmentedToken {
  trackBg: string
  trackPadding: number
  itemActiveBg: string
  itemSelectedBg: string
  itemColor: string
  itemSelectedColor: string
  itemDisabledColor: string
  itemMinWidth: number
  itemPaddingHorizontalSM: number
  itemPaddingHorizontal: number
  itemPaddingHorizontalLG: number
  itemActiveOpacity: number
  borderRadius: number
  borderRadiusItem: number
  heightSM: number
  height: number
  heightLG: number
  fontSizeSM: number
  fontSize: number
  fontSizeLG: number
}

export interface BottomBarToken {
  backgroundColor: string
  height: number
  dividerColor: string
  dividerWidth: number
}

export interface ProgressToken {
  height: number
  color: string
  backgroundColor: string
  inactiveColor: string
  pivotPaddingHorizontal: number
  pivotTextColor: string
  pivotFontSize: number
  pivotLineHeight: number
  pageBackgroundColor: string
  pageTextFontSize: number
  pageTextLineHeight: number
  pageTextColor: string
  pageButtonWidth: number
}

export interface WaterMarkToken {
  textFontSize: number
  textColor: string
  textOpacity: number
}

export interface WatermarkToken {
  width: number
  height: number
  gapX: number
  gapY: number
  rotate: number
  textColor: string
  fontSize: number
  zIndex: number
}

export interface AvatarToken {
  containerSizeSM: number
  containerSize: number
  containerSizeLG: number
  borderRadius: number
  backgroundColor: string
  textColor: string
  textFontSizeSM: number
  textFontSize: number
  textFontSizeLG: number
  iconFontSizeSM: number
  iconFontSize: number
  iconFontSizeLG: number
  groupBorderColor: string
  groupBorderWidth: number
  groupOverlapping: number
  groupSpace: number
}

export interface RadioToken {
  indicatorSize: number
  dotSize: number
  borderWidth: number
  borderRadius: number
  borderColor: string
  checkedColor: string
  checkmarkColor: string
  labelColor: string
  disabledColor: string
  disabledBackground: string
  disabledLabelColor: string
  fontSize: number
  lineHeight: number
  gap: number
  buttonBg: string
  buttonCheckedBg: string
  buttonCheckedBgDisabled: string
  buttonCheckedColorDisabled: string
  buttonColor: string
  buttonPaddingHorizontal: number
  buttonSolidCheckedActiveBg: string
  buttonSolidCheckedBg: string
  buttonSolidCheckedColor: string
  buttonHeight: number
  buttonHeightSmall: number
  buttonHeightLarge: number
  buttonBorderRadius: number
  activeOpacity: number
  disabledOpacity: number
}

export interface FloatingPanelToken {
  borderRadius: number
  headerHeight: number
  zIndex: number
  backgroundColor: string
  barWidth: number
  barHeight: number
  barColor: string
  animationDuration: number
}

export interface ComponentTokens {
  Button: ButtonToken
  Cell: CellToken
  SwipeCell: SwipeCellToken
  Swipe: SwipeToken
  Popup: PopupToken
  Overlay: OverlayToken
  Picker: PickerToken
  Tree: TreeToken
  Typography: TypographyToken
  Input: InputToken
  Card: CardToken
  Divider: DividerToken
  Modal: ModalToken
  Tabs: TabsToken
  Badge: BadgeToken
  Checkbox: CheckboxToken
  Switch: SwitchToken
  NavTab: NavTabToken
  Segmented: SegmentedToken
  BottomBar: BottomBarToken
  Progress: ProgressToken
  WaterMark: WaterMarkToken
  Tag: TagToken
  Loading: LoadingToken
  Result: ResultToken
  NavBar: NavBarToken
  Steps: StepsToken
  NoticeBar: NoticeBarToken
  Popover: PopoverToken
  Collapse: CollapseToken
  Description: DescriptionToken
  ActionSheet: ActionSheetToken
  ButtonBar: ButtonBarToken
  Toast: ToastToken
  Notify: NotifyToken
  Dialog: DialogToken
  TabBar: TabBarToken
  Sidebar: SidebarToken
  Search: SearchToken
  Watermark: WatermarkToken
  Avatar: AvatarToken
  Radio: RadioToken
  FloatingPanel: FloatingPanelToken
}

export type ComponentTokenOverrides = Partial<{
  [K in keyof ComponentTokens]: Partial<ComponentTokens[K]>
}>

export type ComponentTokenName = keyof ComponentTokens
export type ComponentTokenFactory<Name extends ComponentTokenName> = (
  token: AliasToken,
) => ComponentTokens[Name]

export function createComponentTokens(
  token: AliasToken,
  overrides: ComponentTokenOverrides = {},
  isDark = false,
): ComponentTokens {
  return {
    Button: {
      paddingInline: token.paddingContentHorizontal - token.lineWidth,
      paddingInlineSM: 8 - token.lineWidth,
      paddingInlineLG: token.paddingContentHorizontal - token.lineWidth,
      contentFontSize: token.fontSize,
      contentFontSizeSM: token.fontSize,
      contentFontSizeLG: token.fontSizeLG,
      primaryBg: token.colorPrimary,
      primaryBgHover: token.colorPrimaryHover,
      primaryBgActive: token.colorPrimaryActive,
      primaryColor: token.colorTextLightSolid,
      defaultBg: token.colorBgContainer,
      defaultBorderColor: token.colorBorder,
      defaultColor: token.colorText,
      defaultBgHover: token.colorBgContainer,
      defaultBgActive: token.colorFillTertiary,
      defaultBorderColorHover: token.colorPrimary,
      defaultBorderColorActive: token.colorPrimaryActive,
      textBgHover: token.colorFillTertiary,
      textBgActive: token.colorFillSecondary,
      linkColor: token.colorLink,
      linkColorHover: token.colorPrimaryHover,
      linkColorActive: token.colorPrimaryActive,
      dangerBg: token.colorError,
      dangerBgHover: token.colorErrorHover,
      dangerBgActive: token.colorErrorActive,
      dangerColor: token.colorError,
      dangerColorHover: token.colorErrorHover,
      dangerColorActive: token.colorErrorActive,
      iconGap: token.sizeXS,
      activeOpacity: 0.6,
      disabledOpacity: 0.45,
      subtextOpacity: 0.7,
      ...overrides.Button,
    },
    Cell: {
      backgroundColor: token.colorBgContainer,
      activeColor: token.colorFillTertiary,
      activeOpacity: 0.6,
      borderColor: token.colorBorderSecondary,
      paddingHorizontal: token.sizeSM,
      paddingVertical: token.sizeSM,
      minHeight: token.controlHeightLG,
      titleColor: token.colorText,
      valueColor: token.colorTextSecondary,
      extraColor: token.colorTextTertiary,
      groupTitleColor: token.colorTextSecondary,
      fontSize: token.fontSize,
      groupTitleFontSize: token.fontSizeSM,
      lineHeight: token.fontHeight,
      extraFontSize: token.fontSizeSM,
      extraLineHeight: token.fontHeightSM,
      valueMinWidth: token.sizeXXL,
      iconColor: token.colorTextTertiary,
      iconSize: token.fontSizeLG,
      iconGap: token.sizeSM,
      requiredColor: token.colorError,
      requiredWidth: token.sizeSM,
      ...overrides.Cell,
    },
    SwipeCell: {
      actionTextColor: token.colorTextLightSolid,
      actionFontSize: token.fontSize,
      actionPaddingHorizontal: token.sizeLG,
      actionMinWidth: token.controlHeightLG,
      actionMinHeight: token.controlHeightLG,
      actionBackgroundColor: token.colorPrimary,
      actionDisabledOpacity: 0.45,
      ...overrides.SwipeCell,
    },
    Swipe: {
      dotSize: 8,
      dotGap: token.sizeXS,
      dotColor: token.colorTextQuaternary,
      dotActiveColor: token.colorPrimary,
      paginationOffset: token.sizeSM,
      ...overrides.Swipe,
    },
    Popup: {
      backgroundColor: token.colorBgElevated,
      overlayColor: token.colorBgMask,
      borderRadius: token.borderRadiusLG,
      headerHeight: token.controlHeightLG,
      headerPaddingHorizontal: token.sizeLG,
      headerTitleColor: token.colorText,
      headerTitleFontSize: token.fontSizeLG,
      closeColor: token.colorTextSecondary,
      closeSize: token.fontSizeXL,
      closeHitSlop: token.sizeSM,
      zIndex: token.zIndexPopupBase,
      ...overrides.Popup,
    },
    Overlay: {
      backgroundColor: token.colorBgMask,
      zIndex: token.zIndexPopupBase,
      ...overrides.Overlay,
    },
    Picker: {
      backgroundColor: token.colorBgElevated,
      toolbarBackgroundColor: token.colorBgElevated,
      toolbarTextColor: token.colorPrimary,
      titleColor: token.colorText,
      textColor: token.colorText,
      disabledTextColor: token.colorTextDisabled,
      toolbarPaddingHorizontal: token.size,
      toolbarPaddingVertical: token.sizeSM,
      ...overrides.Picker,
    },
    Tree: {
      activeColor: token.colorPrimary,
      textColor: token.colorText,
      disabledTextColor: token.colorTextDisabled,
      rowActiveBackgroundColor: token.colorFillTertiary,
      rowHeight: token.controlHeightLG,
      rowPaddingHorizontal: token.sizeSM,
      labelMarginHorizontal: token.sizeXS,
      switcherWidth: 28,
      switcherPadding: token.sizeXS,
      switcherBorderRadius: token.borderRadiusSM,
      switcherHighlightBackgroundColor: token.colorPrimaryBg,
      activeOpacity: 0.6,
      ...overrides.Tree,
    },
    Typography: {
      fontFamily: token.fontFamily,
      fontFamilyCode: token.fontFamilyCode,
      fontSize: token.fontSize,
      fontSizeSM: token.fontSizeSM,
      fontSizeLG: token.fontSizeLG,
      fontSizeXL: token.fontSizeXL,
      color: token.colorText,
      colorSecondary: token.colorTextSecondary,
      colorDisabled: token.colorTextDisabled,
      lineHeight: token.lineHeight,
      headingColor: token.colorText,
      ...overrides.Typography,
    },
    Input: {
      height: token.controlHeight,
      heightSM: token.controlHeightSM,
      heightLG: token.controlHeightLG,
      borderRadius: token.borderRadius,
      paddingHorizontal: token.size,
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      activeBorderColor: token.colorPrimary,
      activeShadowColor: token.colorPrimaryBg,
      placeholderColor: token.colorTextPlaceholder,
      textColor: token.colorText,
      disabledBackgroundColor: token.colorBgContainerDisabled,
      disabledColor: token.colorTextDisabled,
      errorBorderColor: token.colorError,
      warningBorderColor: token.colorWarning,
      selectionColor: token.colorPrimary,
      borderWidth: token.lineWidth,
      paddingVertical: token.sizeSM,
      clearButtonSize: token.fontSizeLG,
      clearButtonBackgroundColor: token.colorTextTertiary,
      clearButtonColor: token.colorTextLightSolid,
      prefixColor: token.colorText,
      addonColor: token.colorText,
      wordLimitColor: token.colorTextSecondary,
      wordLimitFontSize: token.fontSizeSM,
      ...overrides.Input,
    },
    Card: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorderSecondary,
      borderRadius: token.borderRadiusLG,
      padding: token.sizeLG,
      headerMinHeight: token.controlHeightLG + token.sizeXS,
      headerMinHeightSM: token.controlHeightLG,
      titleFontSize: token.fontSizeLG,
      footerFontSize: token.fontSize,
      shadow: 'none',
      titleColor: token.colorText,
      footerColor: token.colorTextSecondary,
      ...overrides.Card,
    },
    Divider: {
      color: token.colorBorderSecondary,
      width: token.lineWidth,
      style: token.lineType,
      margin: token.size,
      fontSize: token.fontSize,
      ...overrides.Divider,
    },
    Modal: {
      backgroundColor: token.colorBgElevated,
      maskColor: token.colorBgSpotlight,
      borderRadius: token.borderRadiusLG,
      padding: token.sizeLG,
      titleColor: token.colorText,
      contentColor: token.colorTextSecondary,
      width: 520,
      zIndex: token.zIndexPopupBase,
      ...overrides.Modal,
    },
    Tabs: {
      height: token.controlHeightLG,
      backgroundColor: token.colorBgContainer,
      color: token.colorTextSecondary,
      activeColor: token.colorPrimary,
      indicatorColor: token.colorPrimary,
      indicatorHeight: 2,
      borderColor: token.colorBorderSecondary,
      ...overrides.Tabs,
    },
    Badge: {
      borderRadius: 999,
      fontSize: token.fontSizeSM,
      paddingHorizontal: token.sizeXS,
      size: 16,
      dotSize: 8,
      fontWeight: 'bold',
      ...overrides.Badge,
    },
    Checkbox: {
      size: token.fontSizeLG,
      gap: token.sizeXS,
      groupGap: token.sizeXS,
      borderRadius: token.borderRadiusXS,
      borderColor: token.colorBorder,
      labelColor: token.colorText,
      labelDisabledColor: token.colorTextDisabled,
      activeOpacity: 0.6,
      checkedBackgroundColor: token.colorPrimary,
      checkedColor: token.colorTextLightSolid,
      disabledBackgroundColor: token.colorBgContainerDisabled,
      disabledBorderColor: token.colorBorderDisabled,
      ...overrides.Checkbox,
    },
    Switch: {
      width: 44,
      height: 22,
      borderRadius: 999,
      checkedBackgroundColor: token.colorPrimary,
      uncheckedBackgroundColor: token.colorFill,
      thumbColor: token.colorBgContainer,
      contentColor: token.colorTextLightSolid,
      disabledOpacity: 0.45,
      ...overrides.Switch,
    },
    NavTab: {
      backgroundColor: token.colorFillTertiary,
      paddingVertical: 2,
      paddingHorizontal: 2,
      borderRadius: token.borderRadiusSM,
      height: 32,
      itemMinWidth: 54,
      activeBackgroundColor: token.colorBgContainer,
      fontSize: token.fontSizeSM,
      lineHeight: token.fontHeightSM,
      itemPaddingVertical: 3,
      itemPaddingHorizontal: 12,
      textColor: token.colorTextSecondary,
      activeTextColor: token.colorText,
      activeOpacity: 0.6,
      ...overrides.NavTab,
    },
    Segmented: {
      trackBg: token.colorFillTertiary,
      trackPadding: 2,
      itemActiveBg: token.colorFillSecondary,
      itemSelectedBg: token.colorBgContainer,
      itemColor: token.colorTextSecondary,
      itemSelectedColor: token.colorText,
      itemDisabledColor: token.colorTextDisabled,
      itemMinWidth: 54,
      itemPaddingHorizontalSM: token.controlPaddingHorizontalSM,
      itemPaddingHorizontal: token.controlPaddingHorizontal,
      itemPaddingHorizontalLG: token.controlPaddingHorizontal,
      itemActiveOpacity: 0.6,
      borderRadius: token.borderRadiusSM,
      borderRadiusItem: token.borderRadiusXS,
      heightSM: token.controlHeightSM,
      height: token.controlHeight,
      heightLG: token.controlHeightLG,
      fontSizeSM: token.fontSizeSM,
      fontSize: token.fontSize,
      fontSizeLG: token.fontSizeLG,
      ...overrides.Segmented,
    },
    BottomBar: {
      backgroundColor: token.colorBgContainer,
      height: 50,
      dividerColor: token.colorBorderSecondary,
      dividerWidth: token.lineWidth,
      ...overrides.BottomBar,
    },
    Progress: {
      height: 4,
      color: token.colorPrimary,
      backgroundColor: token.colorFillTertiary,
      inactiveColor: token.colorTextDisabled,
      pivotPaddingHorizontal: token.sizeXS,
      pivotTextColor: token.colorTextLightSolid,
      pivotFontSize: token.fontSizeSM,
      pivotLineHeight: 1.6,
      pageBackgroundColor: token.colorBgContainer,
      pageTextFontSize: token.fontSize,
      pageTextLineHeight: token.fontHeight,
      pageTextColor: token.colorTextSecondary,
      pageButtonWidth: 156,
      ...overrides.Progress,
    },
    WaterMark: {
      textFontSize: token.fontSizeSM,
      textColor: token.colorTextBase,
      textOpacity: 0.1,
      ...overrides.WaterMark,
    },
    Tag: {
      borderRadius: token.borderRadiusXS,
      paddingHorizontal: token.sizeXS,
      lHeight: 24,
      mHeight: 20,
      sHeight: 16,
      lFontSize: token.fontSize,
      mFontSize: token.fontSizeSM,
      sFontSize: token.fontSizeSM - 1,
      lPaddingHorizontal: token.sizeSM,
      mPaddingHorizontal: 4,
      sPaddingHorizontal: 2,
      lCloseIcon: token.fontSizeLG,
      mCloseIcon: token.fontSizeSM,
      sCloseIcon: token.fontSizeSM,
      ...overrides.Tag,
    },
    Loading: {
      gap: token.sizeSM,
      textColor: token.colorTextSecondary,
      textFontSize: token.fontSize,
      iconColor: token.colorTextSecondary,
      iconSize: 24,
      animationDuration: 800,
      ...overrides.Loading,
    },
    Result: {
      iconSize: 72,
      titleFontSize: token.fontSizeHeading3,
      titleLineHeight: token.fontHeightLG,
      subtitleFontSize: token.fontSizeSM,
      subtitleLineHeight: token.fontHeightSM,
      ...overrides.Result,
    },
    NavBar: {
      arrowSize: 20,
      height: 44,
      gap: token.size,
      activeOpacity: 0.6,
      backgroundColor: token.colorBgContainer,
      titleColor: token.colorText,
      titleFontSize: token.fontSizeLG,
      iconColor: token.colorText,
      ...overrides.NavBar,
    },
    Steps: {
      backgroundColor: token.colorPrimary,
      paddingVertical: token.size,
      paddingHorizontal: token.sizeLG,
      dotSize: 10,
      activeDotSize: 16,
      activeDotBackgroundColor: token.colorTextLightSolid,
      iconSuccessSize: 16,
      titleSize: token.fontSize,
      lineNormalColor: token.colorPrimaryBorder,
      titleColor: token.colorTextLightSolid,
      dotColor: getAlphaColor(token.colorTextLightSolid, 0.4),
      lineWidth: token.lineWidth,
      iconPaddingHorizontal: 2,
      iconMarginBottom: token.sizeSM,
      titleMarginHorizontal: 2,
      ...overrides.Steps,
    },
    NoticeBar: {
      paddingVertical: token.sizeSM,
      paddingHorizontal: token.size,
      paddingVerticalSM: token.sizeXS,
      paddingHorizontalSM: token.sizeSM,
      textLineHeight: token.fontHeight,
      borderRadius: token.borderRadiusSM,
      textFontSize: token.fontSizeSM,
      iconSize: token.fontSizeSM,
      iconMarginHorizontal: token.sizeXS,
      ...overrides.NoticeBar,
    },
    Popover: {
      borderRadius: token.borderRadiusSM,
      backgroundColor: token.colorBgContainer,
      darkBackgroundColor: getAlphaColor(token.colorTextBase, 0.7),
      itemPaddingHorizontal: token.size,
      itemPaddingVertical: token.size,
      dividerColor: token.colorBorderSecondary,
      darkDividerColor: getAlphaColor(isDark ? token.colorText : token.colorTextLightSolid, 0.15),
      textColor: token.colorText,
      darkTextColor: isDark ? token.colorText : token.colorTextLightSolid,
      textFontSize: token.fontSizeSM,
      disabledOpacity: 0.45,
      shadowColor: token.colorShadow,
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 4,
      elevation: 4,
      ...overrides.Popover,
    },
    Collapse: {
      transitionDuration: token.motionDurationMid,
      backgroundColor: token.colorBgContainer,
      iconColor: token.colorTextSecondary,
      iconSize: token.fontSizeLG,
      bodyPaddingHorizontal: token.sizeLG,
      bodyPaddingVertical: token.sizeLG,
      ...overrides.Collapse,
    },
    Description: {
      fontSizeLG: token.fontSizeLG,
      lineHeightLG: token.fontHeightLG,
      fontSize: token.fontSize,
      lineHeight: token.fontHeight,
      fontSizeSM: token.fontSizeSM,
      lineHeightSM: token.fontHeightSM,
      labelColor: token.colorTextSecondary,
      textColor: token.colorText,
      ...overrides.Description,
    },
    ActionSheet: {
      descriptionColor: token.colorTextSecondary,
      descriptionFontSize: token.fontSizeSM,
      descriptionLineHeight: token.fontHeightSM,
      descriptionPaddingVertical: token.sizeSM + token.sizeXS,
      actionTextColor: token.colorText,
      actionFontSize: token.fontSizeLG,
      actionBackgroundColor: token.colorBgContainer,
      actionPressedBackgroundColor: token.colorFillTertiary,
      actionDisabledTextColor: token.colorTextDisabled,
      actionPaddingHorizontal: token.paddingContentHorizontal,
      actionPaddingVertical: token.paddingContentVerticalLG,
      actionMinHeight: token.controlHeightLG,
      actionDividerColor: token.colorSplit,
      cancelBackgroundColor: token.colorBgContainer,
      cancelPressedBackgroundColor: token.colorFillTertiary,
      cancelTextColor: token.colorTextSecondary,
      cancelFontSize: token.fontSizeLG,
      cancelPaddingHorizontal: token.paddingContentHorizontal,
      cancelPaddingVertical: token.paddingContentVerticalLG,
      cancelMinHeight: token.controlHeightLG,
      pressedOpacity: 1,
      cancelGapHeight: token.sizeSM,
      cancelGapColor: token.colorFillTertiary,
      ...overrides.ActionSheet,
    },
    ButtonBar: {
      buttonSpace: token.sizeSM,
      buttonMinWidth: 92,
      ...overrides.ButtonBar,
    },
    Toast: {
      backgroundColor: isDark ? token.colorBgSpotlight : getAlphaColor(token.colorTextBase, 0.7),
      borderRadius: token.borderRadiusLG,
      textBorderRadius: token.borderRadius,
      iconColor: isDark ? token.colorText : token.colorTextLightSolid,
      iconPadding: token.sizeXXS,
      iconSize: 36,
      innerPaddingVertical: token.size,
      innerPaddingHorizontal: token.size,
      innerWidth: 120,
      innerMinHeight: 120,
      fontSize: token.fontSizeSM,
      textColor: isDark ? token.colorText : token.colorTextLightSolid,
      lineHeight: 20,
      textMinWidth: 96,
      textPaddingVertical: token.sizeXS,
      textPaddingHorizontal: token.sizeSM,
      textMarginTop: token.sizeXS,
      ...overrides.Toast,
    },
    Notify: {
      textColor: token.colorTextLightSolid,
      paddingVertical: token.sizeSM,
      paddingHorizontal: token.sizeLG,
      fontSize: token.fontSize,
      lineHeight: token.fontHeight,
      primaryBackgroundColor: token.colorPrimary,
      successBackgroundColor: token.colorSuccess,
      errorBackgroundColor: token.colorError,
      warningBackgroundColor: token.colorWarning,
      ...overrides.Notify,
    },
    Dialog: {
      width: 640,
      transitionDuration: token.motionDurationMid,
      borderRadius: token.borderRadiusLG,
      backgroundColor: token.colorBgElevated,
      closeColor: token.colorText,
      closeSize: token.fontSizeLG,
      headerFontSize: token.fontSizeLG,
      headerFontWeight: 'normal',
      headerColor: token.colorText,
      headerLineHeight: token.fontHeightLG,
      headerPaddingTop: token.sizeXL,
      headerPaddingBottom: token.sizeLG,
      messagePaddingHorizontal: token.sizeXL,
      messageFontSize: token.fontSizeLG,
      messageLineHeight: token.fontHeight,
      messageTextColor: token.colorTextSecondary,
      footerMarginTop: token.sizeLG,
      footerDividerColor: token.colorBorderSecondary,
      confirmTextColor: token.colorPrimary,
      cancelTextColor: token.colorText,
      inputMarginHorizontal: token.sizeLG,
      inputMarginTop: token.sizeLG,
      inputPaddingBottom: token.sizeSM,
      inputMaxHeight: 200,
      ...overrides.Dialog,
    },
    TabBar: {
      itemPaddingHorizontal: token.sizeSM,
      textFontSize: token.fontSizeSM,
      textAloneFontSize: token.fontSize,
      textMarginTop: token.sizeXS,
      textColor: token.colorTextSecondary,
      activeTextColor: token.colorPrimary,
      iconColor: token.colorTextSecondary,
      activeIconColor: token.colorPrimary,
      indicatorColor: token.colorPrimary,
      indicatorHeight: 3,
      badgeFontSize: token.fontSizeSM,
      badgeColor: token.colorError,
      ...overrides.TabBar,
    },
    Sidebar: {
      backgroundColor: token.colorBgContainer,
      itemBackgroundColor: token.colorFillTertiary,
      underlayColor: token.colorFillSecondary,
      paddingVertical: token.size,
      paddingHorizontal: token.size,
      borderRadius: token.borderRadius,
      barWidth: 3,
      barHeight: 26,
      textLineHeight: token.fontHeight,
      textFontSize: token.fontSizeSM,
      barBackgroundColor: token.colorPrimary,
      activeTextColor: token.colorText,
      inactiveTextColor: token.colorTextSecondary,
      disabledTextColor: token.colorTextDisabled,
      ...overrides.Sidebar,
    },
    Search: {
      backgroundColor: token.colorBgContainer,
      paddingHorizontal: token.size,
      paddingVertical: token.sizeXS,
      gap: token.sizeSM,
      iconSize: token.sizeMD,
      backIconSize: token.sizeLG,
      inputBorderRadius: token.borderRadiusSM,
      backIconColor: token.colorText,
      inputBackgroundColor: token.colorFillTertiary,
      ...overrides.Search,
    },
    Watermark: {
      width: 100,
      height: 100,
      gapX: 0,
      gapY: 0,
      rotate: -22,
      textColor: '#dcdee0',
      fontSize: token.fontSize,
      zIndex: token.zIndexBase + 100,
      ...overrides.Watermark,
    },
    Avatar: {
      containerSizeSM: 24,
      containerSize: 32,
      containerSizeLG: 40,
      borderRadius: token.borderRadiusSM,
      backgroundColor: token.colorFillSecondary,
      textColor: token.colorText,
      textFontSizeSM: token.fontSizeSM,
      textFontSize: token.fontSize,
      textFontSizeLG: token.fontSize,
      iconFontSizeSM: 14,
      iconFontSize: 18,
      iconFontSizeLG: 24,
      groupBorderColor: token.colorBgContainer,
      groupBorderWidth: 1,
      groupOverlapping: -8,
      groupSpace: token.paddingXS,
      ...overrides.Avatar,
    },
    Radio: {
      indicatorSize: token.controlInteractiveSize,
      dotSize: token.controlInteractiveSize / 2,
      borderWidth: token.lineWidth,
      borderRadius: token.borderRadiusSM,
      borderColor: token.colorBorder,
      checkedColor: token.colorPrimary,
      checkmarkColor: token.colorTextLightSolid,
      labelColor: token.colorText,
      disabledColor: token.colorTextDisabled,
      disabledBackground: token.colorFillTertiary,
      disabledLabelColor: token.colorTextDisabled,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      gap: token.paddingXS,
      buttonBg: token.colorBgContainer,
      buttonCheckedBg: token.colorBgContainer,
      buttonCheckedBgDisabled: token.colorBgContainerDisabled,
      buttonCheckedColorDisabled: token.colorTextDisabled,
      buttonColor: token.colorText,
      buttonPaddingHorizontal: token.controlPaddingHorizontal,
      buttonSolidCheckedActiveBg: token.colorPrimaryActive,
      buttonSolidCheckedBg: token.colorPrimary,
      buttonSolidCheckedColor: token.colorTextLightSolid,
      buttonHeight: token.controlHeight,
      buttonHeightSmall: token.controlHeightSM,
      buttonHeightLarge: token.controlHeightLG,
      buttonBorderRadius: token.borderRadiusSM,
      activeOpacity: 0.6,
      disabledOpacity: 0.4,
      ...overrides.Radio,
    },
    FloatingPanel: {
      borderRadius: 16,
      headerHeight: 30,
      zIndex: token.zIndexPopupBase - 1,
      backgroundColor: token.colorBgElevated,
      barWidth: 20,
      barHeight: 3,
      barColor: token.colorTextQuaternary,
      animationDuration: Math.max(0, token.motionDurationSlow * 1000),
      ...overrides.FloatingPanel,
    },
  }
}
