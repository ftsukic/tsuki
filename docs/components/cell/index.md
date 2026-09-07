---
title: Cell
nav:
  title: 组件
group:
  title: 基础组件
  order: 1
---

# Cell

<code src="../../../src/cell/__fixtures__/basic.tsx"></code>

Cell 用于列表中的信息展示和导航操作。

```text
import { Cell, Icon } from '@ftsukic/tsuki';

<Cell
  icon={<Icon name="UserOutlined" />}
  title="账号"
  label="已绑定"
  value="查看"
  isLink
  required
  onPress={openAccount}
/>;
```

Cell 使用 Vant 语义：`icon`、`title`、`label`、`value`、`extra`、`center`、`isLink`、`clickable`、`border`、`required`、`arrowDirection` 和 `size`。`size` 为 `large | normal`。

Semantic slots：

```text
<Cell
  title="通知"
  value="开启"
  styles={{
    root: { paddingHorizontal: 20 },
    title: { color: '#111' },
    value: { color: '#1989FA' },
    suffix: { width: 24 },
  }}
/>
```

`Cell.Group` 支持 `title`、`extra`、`inset`、`border`、`style` 和 `styles`：

```text
<Cell.Group title="账户" extra="编辑" inset>
  <Cell title="昵称" value="Altron" />
</Cell.Group>
```

首轮不实现 `Cell.Swipe`，因此不会引入 Gesture Handler 或 Reanimated。
