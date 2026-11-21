# Tsuki v2 Interaction Lab

Interaction Lab 是 Playground 中独立的交互实验区，用于直接操作 Tsuki v2 的 Motion、Pressable、Gesture 和 Overlay Runtime。它不属于组件 Fixture Catalog，也不会增加 `@ftsukic/tsuki` 的公共 API。

## 打开 Lab

在仓库根目录运行 Playground：

```bash
pnpm --dir apps/playground start
```

从首页进入 **Interaction Lab**，再选择 Motion、Pressable、Gesture 或 Overlay。Playground 根节点已提供 `GestureHandlerRootView`；其他应用使用 Gesture Handler 时仍需由宿主应用配置根节点。

## 实验页面

### Motion

在 Timing、Spring、Decay、Preset、Interruption、Motion Policy 和 Shared Value 实验中播放或重置动画。参数变化会传给私有 v2 Motion Runtime；动画进度由 Reanimated SharedValue 与 animated style 驱动。

### Pressable

切换 `opacity`、`scale`、`background`、`overlay` 和 `none` 五种反馈，观察按压事件顺序、禁用状态与 `testOnly_pressed`。样式冲突实验可检查 `className`、`styles.root`、`style` 和 pressed feedback 的优先级。

### Gesture

- **Pan**：切换横向、纵向或自动方向锁；调节激活/失败偏移、边界、距离限制、阻尼和回弹弹簧。拖动开始后，页面滚动会暂时让位给 Pan。
- **Swipe**：左右拖动到两个或三个吸附位置；对比阈值、速度投影、Spring 与 Decay + Spring，并可程序化开合。
- **Resistance**：比较固定阻尼和可调阻尼，拖动超过边界后松手观察回弹。
- **Snap**：比较单吸附点和多吸附点，调节速度投影及弹簧；吸附过程中可以再次拖动。
- **Nested Scroll**：在纵向滚动区域中横向拖动，比较 `requireToFail` 与 simultaneous 协调，并检查拖动与点按竞争时只有点按触发的行为。

数值面板只在方向改变、手势生命周期变化或手势结束时更新。连续位移由 UI Thread 上的 SharedValue 驱动。

### Overlay

Overlay Lab 使用 Playground 根 `TsukiProvider` 持有的 Registry 和 Host。Transitions 面板可以单独选择 Mask 与 Content 的预设、Timing / Spring、时长和弹簧参数，并验证进入中关闭、退出中重开、快速连续切换、多 Entry、Back 顺序和 Reduced Motion。进度调试以每 10% 为步长通过现有 Motion SharedValue 汇报，不按每帧触发 React state 更新。

同一 Overlay 页面还提供 Stack、Back、Theme 和 Touch 面板，用于检查稳定层级、三种 Back 行为、Theme Bridge 与底层触摸穿透。

## 实现边界

Playground 使用私有 `@tsuki-v2/*` Metro / TypeScript alias 访问 `packages/tsuki/src/`。不要把该 alias 当成应用 API，也不要从 package root 导出 Motion、Pressable 或 Gesture Runtime。
