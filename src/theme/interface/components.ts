import type { AliasToken } from './alias'
import type { DimensionValue, TextStyle } from 'react-native'

export interface ButtonToken {
  heightXS: number
  heightSM: number
  height: number
  heightLG: number
  borderRadiusXS: number
  borderRadiusSM: number
  borderRadius: number
  borderRadiusLG: number
  borderRadiusRound: number
  paddingHorizontalXS: number
  paddingHorizontalSM: number
  paddingHorizontal: number
  paddingHorizontalLG: number
  contentFontSizeXS: number
  contentFontSizeSM: number
  contentFontSize: number
  contentFontSizeLG: number
  borderWidth: number
  activeOpacity: number
  pressedOverlayColor: string
  disabledOpacity: number
  iconGap: number
  fontFamily: string
}

export interface CellToken {
  backgroundColor: string
  activeColor: string
  borderColor: string
  groupBackgroundColor: string
  groupBorderColor: string
  groupBorderWidth: number
  dividerWidth: number
  paddingHorizontal: number
  paddingVertical: number
  largePaddingVertical: number
  minHeight: number
  largeMinHeight: number
  titleColor: string
  labelColor: string
  valueColor: string
  extraColor: string
  fontSize: number
  labelFontSize: number
  extraFontSize: number
  extraLineHeight: number
  lineHeight: number
  lineHeightSM: number
  labelMarginTop: number
  largeTitleFontSize: number
  largeLabelFontSize: number
  iconColor: string
  iconSize: number
  iconGap: number
  verticalGap: number
  titleExtraGap: number
  valueExtraGap: number
  requiredColor: string
  requiredWidth: number
  groupTitleColor: string
  groupTitleFontSize: number
  groupTitleLineHeight: number
  groupTitlePaddingHorizontal: number
  groupTitlePaddingVertical: number
  groupInsetTitlePaddingHorizontal: number
  groupInsetTitlePaddingVertical: number
  groupInsetMarginHorizontal: number
  insetRadius: number
  fontFamily: string
}

export interface CollapseToken {
  headerHeight: number
  paddingHorizontal: number
  titleColor: string
  titleFontSize: number
  titleLineHeight: number
  iconColor: string
  iconSize: number
  iconGap: number
  activeColor: string
  disabledColor: string
  disabledOpacity: number
  contentPaddingVertical: number
  contentPaddingHorizontal: number
  contentFontSize: number
  contentLineHeight: number
  contentTextColor: string
  contentBackgroundColor: string
  borderColor: string
  borderWidth: number
  animationDuration: number
  fontFamily: string
}

export interface NavbarToken {
  height: number
  paddingHorizontal: number
  titleFontSize: number
  titleColor: string
  actionFontSize: number
  actionColor: string
  iconSize: number
  borderColor: string
}

export interface SwipeCellToken {
  backgroundColor: string
  actionBackgroundColor: string
  actionDefaultBackgroundColor: string
  actionPrimaryBackgroundColor: string
  actionSuccessBackgroundColor: string
  actionWarningBackgroundColor: string
  actionDangerBackgroundColor: string
  actionTextColor: string
  actionHeight: number
  actionMinWidth: number
  actionPaddingHorizontal: number
  actionFontSize: number
  actionLineHeight: number
  animationDuration: number
  fontFamily: string
}

export interface ImagePreviewToken {
  zIndex: number
  overlayColor: string
  indexColor: string
  indexFontSize: number
  indexLineHeight: number
  indexTop: number
  closeIconColor: string
  closeIconSize: number
  closeIconTop: number
  closeIconRight: number
  animationDuration: number
}

export interface InputToken {
  heightSM: number
  height: number
  heightLG: number
  fontSizeSM: number
  fontSize: number
  fontSizeLG: number
  lineHeightSM: number
  lineHeight: number
  lineHeightLG: number
  borderRadius: number
  paddingHorizontal: number
  paddingVertical: number
  backgroundColor: string
  borderColor: string
  activeBorderColor: string
  placeholderColor: string
  textColor: string
  disabledBackgroundColor: string
  disabledColor: string
  selectionColor: string
  borderWidth: number
  clearButtonSize: number
  clearButtonBackgroundColor: string
  clearButtonColor: string
  prefixColor: string
  addonColor: string
  wordLimitColor: string
  wordLimitFontSize: number
  fontFamily: string
}

export interface FieldToken {
  defaultLabelWidth: number
  labelGap: number
  descriptionGap: number
  errorGap: number
  descriptionColor: string
  errorColor: string
  warningColor: string
}

export interface SearchToken {
  search_height: number
  search_background_color: string
  search_content_background_color: string
  search_text_color: string
  search_placeholder_color: string
  search_icon_color: string
  search_border_radius: number
  search_round_border_radius: number
  search_padding_horizontal: number
  search_padding_vertical: number
  search_gap: number
  search_label_spacing: number
  search_icon_size: number
  search_disabled_text_color: string
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
  fontFamily: string
}

export interface EmptyToken {
  empty_image_size: number
  empty_description_margin_top: number
  empty_description_padding_horizontal: number
  empty_description_color: string
  empty_description_font_size: number
  empty_footer_margin_top: number
}

export interface BadgeToken {
  height: number
  heightSM: number
  minWidth: number
  minWidthSM: number
  dotSize: number
  borderRadius: number
  borderWidth: number
  paddingHorizontal: number
  paddingHorizontalSM: number
  fontSize: number
  fontSizeSM: number
  color: string
  textColor: string
  borderColor: string
  successColor: string
  processingColor: string
  defaultColor: string
  errorColor: string
  warningColor: string
  statusGap: number
  fontFamily: string
}

export interface FloatingPanelToken {
  borderRadius: number
  headerHeight: number
  zIndex: number
  backgroundColor: string
  barWidth: number
  barHeight: number
  barColor: string
  shadowColor: string
  shadowOpacity: number
  shadowRadius: number
  shadowOffset: number
  elevation: number
  animationDuration: number
}

export interface RadioToken {
  indicatorSize: number
  dotSize: number
  borderWidth: number
  borderRadius: number
  borderColor: string
  checkedColor: string
  labelColor: string
  disabledBorderColor: string
  disabledBackgroundColor: string
  disabledCheckedBackgroundColor: string
  disabledMarkColor: string
  disabledLabelColor: string
  fontSize: number
  lineHeight: number
  gap: number
  activeOpacity: number
  disabledOpacity: number
  fontFamily: string
  buttonHeight: number
  buttonPaddingHorizontal: number
  buttonBorderRadius: number
  buttonBackground: string
  buttonDisabledBackground: string
  buttonCheckedLabelColor: string
}

export interface CheckboxToken {
  size: number
  borderRadius: number
  borderWidth: number
  borderColor: string
  checkedBackground: string
  checkedIconColor: string
  disabledColor: string
  disabledBackground: string
  labelColor: string
  gap: number
  groupGap: number
  activeOpacity: number
  disabledOpacity: number
  fontSize: number
  lineHeight: number
  fontFamily: string
  buttonHeight: number
  buttonPaddingHorizontal: number
  buttonBorderRadius: number
  buttonBackground: string
  buttonDisabledBackground: string
}

export interface TabsToken {
  height: number
  paddingHorizontal: number
  fontSize: number
  activeColor: string
  inactiveColor: string
  disabledColor: string
  indicatorHeight: number
  indicatorWidth: number
  borderWidth: number
  borderColor: string
  cardRadius: number
  cardBorderColor: string
  cardBackgroundColor: string
  cardActiveBackgroundColor: string
  cardActiveTextColor: string
  activeOpacity: number
  disabledOpacity: number
  animationDuration: number
  fontFamily: string
}

export interface SegmentedToken {
  activeBackgroundColor: string
  activeColor: string
  backgroundColor: string
  borderColor: string
  borderWidth: number
  disabledColor: string
  animationDuration: number
  padding: number
  fontFamily: string
}

export interface DialogToken {
  width: number
  smallScreenWidth: DimensionValue
  backgroundColor: string
  overlayColor: string
  borderRadius: number
  titleColor: string
  messageColor: string
  fontSize: number
  titleFontSize: number
  titleLineHeight: number
  messageLineHeight: number
  headerFontWeight: TextStyle['fontWeight']
  headerPaddingTop: number
  headerPaddingHorizontal: number
  headerPaddingBottom: number
  headerIsolatedPaddingVertical: number
  messagePaddingHorizontal: number
  messagePaddingTop: number
  messagePaddingBottom: number
  messageMaxHeightRatio: number
  buttonHeight: number
  roundButtonHeight: number
  confirmButtonColor: string
  cancelButtonColor: string
  dividerColor: string
  buttonGap: number
  footerPaddingHorizontal: number
  footerPaddingVertical: number
  animationDuration: number
  zIndex: number
  fontFamily: string
}

export interface OverlayToken {
  backgroundColor: string
  animationDuration: number
  zIndex: number
}

export interface PopupToken {
  backgroundColor: string
  overlayColor: string
  borderRadius: number
  animationDuration: number
  zIndex: number
}

export interface PickerToken {
  picker_toolbar_height: number
  picker_item_height: number
  picker_visible_item_count: number
  picker_item_font_size: number
  picker_item_line_height: number
  picker_text_color: string
  picker_active_text_color: string
  picker_indicator_color: string
  picker_mask_color: string
  picker_background_color: string
  picker_toolbar_button_font_size: number
  picker_toolbar_button_line_height: number
  picker_toolbar_padding_horizontal: number
  picker_border_width: number
  picker_item_padding_horizontal: number
  picker_item_inactive_opacity: number
  picker_item_inactive_scale: number
  picker_item_translate_y: number
  picker_mask_opacities: readonly number[]
  picker_font_family: string
}

export interface ActionSheetToken {
  backgroundColor: string
  actionActiveBackgroundColor: string
  cancelActiveBackgroundColor: string
  titleColor: string
  actionColor: string
  descriptionColor: string
  dangerColor: string
  disabledColor: string
  loadingColor: string
  dividerColor: string
  borderRadius: number
  titleFontSize: number
  titleLineHeight: number
  actionFontSize: number
  actionLineHeight: number
  descriptionFontSize: number
  descriptionLineHeight: number
  titleHeight: number
  actionHeight: number
  titlePaddingHorizontal: number
  titlePaddingVertical: number
  actionPaddingHorizontal: number
  actionPaddingVertical: number
  descriptionMarginTop: number
  cancelGap: number
  cancelGapColor: string
  cancelPaddingVertical: number
  animationDuration: number
  zIndex: number
  fontFamily: string
}

export interface ToastToken {
  maxWidth: DimensionValue
  fontSize: number
  textColor: string
  loadingIconColor: string
  lineHeight: number
  borderRadius: number
  backgroundColor: string
  iconSize: number
  textMinWidth: number
  textPaddingVertical: number
  textPaddingHorizontal: number
  defaultPaddingHorizontal: number
  defaultPaddingVertical: number
  defaultWidth: number
  defaultMinHeight: number
  iconTextGap: number
  positionTopDistance: DimensionValue
  positionBottomDistance: DimensionValue
  overlayColor: string
  duration: number
  animationDuration: number
  zIndex: number
  fontFamily: string
}

export interface LoadingToken {
  defaultSize: number
  defaultColor: string
  textColor: string
  textFontSize: number
  textGap: number
  animationDuration: number
}

export interface SkeletonToken {
  backgroundColor: string
  titleHeight: number
  titleWidth: DimensionValue
  rowHeight: number
  rowWidth: DimensionValue
  rowGap: number
  titleRowGap: number
  avatarSize: number
  avatarGap: number
  borderRadius: number
  roundBorderRadius: number
  animationDuration: number
  animationMinOpacity: number
}

export interface SwitchToken {
  smallWidth: number
  smallHeight: number
  mediumWidth: number
  mediumHeight: number
  largeWidth: number
  largeHeight: number
  thumbInset: number
  activeColor: string
  inactiveColor: string
  thumbColor: string
  loadingColor: string
  disabledOpacity: number
  activeOpacity: number
  animationDuration: number
}

export interface ProgressToken {
  progress_height: number
  progress_track_color: string
  progress_color: string
  progress_circle_size: number
  progress_circle_stroke_width: number
  progress_pivot_font_size: number
  progress_pivot_color: string
  progress_animation_duration: number
}

export interface NotifyToken {
  primaryBackgroundColor: string
  successBackgroundColor: string
  errorBackgroundColor: string
  warningBackgroundColor: string
  textColor: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  paddingHorizontal: number
  paddingVertical: number
}

export interface DropdownToken {
  menuHeight: number
  menuBackgroundColor: string
  titleColor: string
  activeColor: string
  disabledColor: string
  optionTextColor: string
  optionDisabledColor: string
  optionPressedColor: string
  titleFontSize: number
  titleLineHeight: number
  titleFontFamily: string
  caretSize: number
  caretGap: number
  optionHeight: number
  optionPaddingHorizontal: number
  optionFontSize: number
  optionLineHeight: number
  optionIconSize: number
  contentBackgroundColor: string
  dividerColor: string
  dividerWidth: number
  shadowColor: string
  shadowOpacity: number
  shadowRadius: number
  shadowOffset: number
  elevation: number
  overlayColor: string
  animationDuration: number
  zIndex: number
}

export interface ComponentTokenOverrides {
  Button?: Partial<ButtonToken>
  Cell?: Partial<CellToken>
  Collapse?: Partial<CollapseToken>
  Navbar?: Partial<NavbarToken>
  SwipeCell?: Partial<SwipeCellToken>
  ImagePreview?: Partial<ImagePreviewToken>
  Input?: Partial<InputToken>
  Field?: Partial<FieldToken>
  Search?: Partial<SearchToken>
  Radio?: Partial<RadioToken>
  Checkbox?: Partial<CheckboxToken>
  Tabs?: Partial<TabsToken>
  Segmented?: Partial<SegmentedToken>
  Avatar?: Partial<AvatarToken>
  Empty?: Partial<EmptyToken>
  Badge?: Partial<BadgeToken>
  FloatingPanel?: Partial<FloatingPanelToken>
  Dialog?: Partial<DialogToken>
  Overlay?: Partial<OverlayToken>
  Popup?: Partial<PopupToken>
  Picker?: Partial<PickerToken>
  ActionSheet?: Partial<ActionSheetToken>
  Toast?: Partial<ToastToken>
  Loading?: Partial<LoadingToken>
  Skeleton?: Partial<SkeletonToken>
  Switch?: Partial<SwitchToken>
  Progress?: Partial<ProgressToken>
  Notify?: Partial<NotifyToken>
  Dropdown?: Partial<DropdownToken>
}

export interface ComponentTokenMap {
  Button: ButtonToken
  Cell: CellToken
  Collapse: CollapseToken
  Navbar: NavbarToken
  SwipeCell: SwipeCellToken
  ImagePreview: ImagePreviewToken
  Input: InputToken
  Field: FieldToken
  Search: SearchToken
  Radio: RadioToken
  Checkbox: CheckboxToken
  Tabs: TabsToken
  Segmented: SegmentedToken
  Avatar: AvatarToken
  Empty: EmptyToken
  Badge: BadgeToken
  FloatingPanel: FloatingPanelToken
  Dialog: DialogToken
  Overlay: OverlayToken
  Popup: PopupToken
  Picker: PickerToken
  ActionSheet: ActionSheetToken
  Toast: ToastToken
  Loading: LoadingToken
  Skeleton: SkeletonToken
  Switch: SwitchToken
  Progress: ProgressToken
  Notify: NotifyToken
  Dropdown: DropdownToken
}

export type ComponentTokenName = keyof ComponentTokenMap

export type ComponentTokenFactory<Name extends ComponentTokenName> = (
  token: AliasToken,
) => ComponentTokenMap[Name]
