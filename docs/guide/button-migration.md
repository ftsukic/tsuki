---
title: Button API 迁移
---

# Button API 迁移

Button 将常用外观与配色分开。`type` 支持 default、primary、dashed、text；`danger`、`success`、`warning` 是互斥的配色快捷属性，仅改变颜色。

| 旧用法                    | 新用法                      |
| ------------------------- | --------------------------- |
| type="success"            | type="primary" success      |
| type="warning"            | type="primary" warning      |
| type="danger"             | type="primary" danger       |
| variant="outline" / plain | variant="outlined"          |
| styles.label              | styles.content              |
| styles.contentContainer   | 使用 styles.root 定制根布局 |
| loadingText               | 使用 children 控制文案      |

Checkbox、Radio 和 FieldRadio 的 `buttonVariant="outline"` 同样改为 `buttonVariant="outlined"`。

显式 color 优先于快捷配色属性；显式 variant 优先于 Group variant，再由 type 推导。color 支持 default、primary、success、warning、danger 以及自定义 ColorValue。原先依赖自定义 color 的实心按钮应显式设置 variant="solid"。

```tsx | pure
<Button type="primary" success>完成</Button>
<Button danger>删除</Button>
<Button color="#7232DD" variant="solid">自定义颜色</Button>
<Button loading={loading}>{loading ? '提交中' : '提交'}</Button>
```

加载时保留 children，Loading 替换普通 icon，并遵循 iconPosition。文字按钮支持 block 占满父级宽度；圆形按钮保持固定尺寸。Button.Group block 显式使用零 flexBasis 分配宽度，长短文案不会改变分配基准。
