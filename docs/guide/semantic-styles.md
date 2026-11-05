# 语义结构与样式

Tsuki 参照 Ant Design 的 Semantic DOM，为组件公开有明确视觉职责的语义槽。React Native 使用 `styles`，不提供 DOM、CSS 选择器或 `classNames`。组件的实际节点由布局、原生控件和动画需求决定；槽位名称尽量与对应的 Ant Design 组件保持一致。

## 使用方式

```tsx
<Button
  type="primary"
  style={{ marginTop: 12 }}
  styles={({ state }) => ({
    root: { borderRadius: 12 },
    content: { fontWeight: '600', opacity: state.loading ? 0.7 : 1 },
  })}
>
  保存
</Button>
```

`style` 与 `styles.root` 定制同一个公开根节点，`style` 优先级更高。各槽接受 `StyleProp<ViewStyle>` 或 `StyleProp<TextStyle>`，可以使用对象、数组和注册样式。`styles` 也可为接收 `{ props, state }` 的函数；state 的字段以各组件公开类型为准。

通常先应用 token 派生的默认样式，再合并语义样式，最后应用根 `style`。手势位移、动画过程中的 opacity/transform、命中区域等行为样式由组件管理。文本槽只负责组件自动生成的 Text；传入自定义 ReactNode 时，由调用方设置节点内部样式。

主题中的共享设计值使用 `ConfigProvider` 的 token；组件整体默认值使用 `theme.components`；某一个实例的节点定制使用 `styles`。不要用组件结构的样式覆盖替代受控值、事件或动画参数。

## 弹层结构

```text
root                 全屏根节点，style / styles.root
├── mask             遮罩
└── wrapper          面板定位层
    └── container    可见面板
        ├── header
        │   └── title
        ├── body
        └── footer
```

Popup 提供 root、mask、wrapper、container；Dialog 和 ActionSheet 在面板内增加内容槽。Toast 的 style / styles.root 直接定制提示气泡，styles.content 定制内容，不公开 wrapper / container 定位槽。Notify 使用 container 定制可见提示。Popup、Dialog、ActionSheet 的 ref 和透传 ViewProps 仍指向面板；根 `style` 的作用位置已经改为全屏根节点。

Popover 的 root 是底层原生弹出边界，reference 是触发区域，container 是内部内容容器，content 是自动生成的内容 Text；它不暴露底层引擎无法单独定制的箭头槽。

## 组合组件

```tsx
<DropdownItem
  options={[{ text: '全部', value: 'all' }]}
  styles={{
    root: { opacity: 0.9 },
    popup: {
      root: { backgroundColor: '#fff' },
      listItem: { minHeight: 48 },
      listItemLabel: { fontWeight: '600' },
      mask: { backgroundColor: 'rgba(0,0,0,0.2)' },
    },
  }}
/>

<FieldInput
  title="姓名"
  styles={{ title: { fontWeight: '600' }, control: { minHeight: 40 } }}
  cellProps={{ styles: { description: { color: '#666' } } }}
  inputProps={{ styles: { input: { color: '#222' } } }}
/>
```

Field 的 root、title、control 分别描述表单根节点、标题和控件区域；Picker 类适配器另外提供 feedback 容器、help 帮助文本和 error 错误文本。control 不包含反馈。下层组件通过 `cellProps`、`inputProps`、`switchProps`、`pickerProps` 定制，每个配置只开放该组件的 style/styles。下层组件的显式配置覆盖 Field 提供的布局默认值。

Picker 的 `styles.body` 包含完整滚轮区域及其遮罩、选中框和 Loading。`styles.toolbar` 是嵌套对象，包含 root、titleContainer、title、cancel、cancelContent、confirm、confirmContent；已有 item、itemContent 保留为通用按钮样式。独立 PickerToolbar 的 `styles` 使用同一结构。Dialog 的两个操作按钮通过 `confirmButtonProps`、`cancelButtonProps` 配置 Button 的 style/styles。

## 破坏性迁移

本次直接替换旧样式契约，不提供旧字段别名或兼容解析。调用方需要同步迁移；受控值、事件、ref 与动画生命周期的功能契约保持。

| 原入口 | 新入口 |
| --- | --- |
| Button.plain | 删除，使用 variant="outlined" |
| Button.round / square / circle | 删除，使用 shape="round" / "square" / "circle" |
| Button.styles.label | Button.styles.content（文字） |
| Button.styles.contentContainer | 取消公开内部布局层，使用 root 定制根布局 |
| Badge.count / overflowCount | content / max |
| Badge.styles.dot | indicator；status 模式的 indicator 指向状态点 |
| Badge.styles.text（数字文字） | content；text 仅用于状态说明 |
| Tag.styles.label | Tag.styles.content（文字）；原 content 容器槽删除 |
| Input.styles.shell | Input.styles.container（输入外壳）；root 负责包含 addon 的整体布局 |
| Input.styles.wordLimit | Input.styles.count |
| Segmented.styles.option | Segmented.styles.item |
| Segmented.styles.selectedBackground | 删除内部动画层槽，使用组件 token |
| Tabs.styles.nav / tab | header / item |
| Tabs 原外层 content | body；content 改为每个内容页 |
| Tab.titleStyle | Tab.styles.label |
| Popup.styles.panel / overlay | container / mask |
| 弹层 overlayStyle | styles.mask |
| Dialog / ActionSheet 原面板 root、style | styles.container；根 style 改为外层根节点 |
| Toast.styles.container / wrapper | 删除；气泡使用 style / styles.root，定位使用 position |
| Dialog.styles.cancel / confirm | cancelButtonProps / confirmButtonProps 的 style/styles |
| Toast.styles.message | content |
| Notify.textStyle | styles.content |
| Cell.styles.header / body / content / icon / extra / actions | titleContainer / valueContainer / value / leading / trailing / arrow |
| Checkbox / Radio.styles.indicator | icon |
| Switch.styles.thumb | indicator |
| Progress.styles.track / portion / circle / circleLabel / pivot | rail / track / body / indicator / indicatorContainer |
| Skeleton.styles.content / rows | section / paragraph；placeholder 删除，avatar 增加 header 容器 |
| DropdownItem.styles.content / option / optionText / optionIcon / overlay | popup.root / popup.listItem / popup.listItemLabel / popup.listItemIcon / popup.mask |
| DropdownItem.contentStyle | styles.popup.root |
| SwipeCell.contentStyle / actionStyle | styles.content / actions |
| Field.cellStyles / inputStyle(s) / pickerStyle(s) / switchStyle(s) | cellProps.styles / inputProps / pickerProps / switchProps |
| Field.styles.label / content / help（容器）/ extra / helpItem | title / control / feedback / help（文本）/ error |
| Picker.styles.container | 删除 root 同节点别名，使用 root |
| Picker.styles.columns / itemLabel | body / itemContent |
| PickerToolbar.titleStyle / buttonStyle / buttonLabelStyle | styles.title / item / itemContent |
| Popover.styles.content（容器） / actions / action / actionIcon / actionText | container / list / item / itemIcon / itemContent |
| ImagePreview.styles.overlay / closeButton / closeLabel | mask / close / closeContent |
| 公共 Input.embedded / PickerColumn export | 删除；组件内部直接使用私有实现 |

没有对应 Ant Design 组件、或存在原生独有节点时，保留可描述实际职责的槽，例如 progress.indicatorContainer、tabs.label、image-preview.pager。未参与此次重构的组件以各自文档和类型为准。

参考 [Ant Design 的组件通用属性](https://ant.design/docs/react/common-props-cn/) 与 [Semantic DOM 定制方式](https://ant.design/docs/react/customize-theme-cn/)；具体槽位以对应组件文档为准。

Cell 的 leading / titleExtraContainer / valueExtraContainer / trailingContainer 负责自定义 ReactNode 外层布局；title / description / value / titleExtra / valueExtra / trailing 只定制自动生成文字。container 负责内容行内边距；内部 main / titleRow 不公开。showArrow 仅展示箭头，反馈由事件或 clickable 决定。
