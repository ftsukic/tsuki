# Snack examples

这里保留未来的 Expo Snack 示例源码约定，当前文档不使用 Snack。

建议按组件和场景组织：

```text
examples/snack/
└── button/
    ├── basic.tsx
    ├── disabled.tsx
    └── loading.tsx
```

`0.0.1` 只建立目录约定，不创建具体组件 demo，也不生成 saved Snack。当前交互 demo 位于 `packages/ui/src/<component>/__fixtures__`，由 Dumi H5 文档直接加载。
