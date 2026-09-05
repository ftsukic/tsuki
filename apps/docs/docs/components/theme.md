---
title: Theme
order: 1
---

# Theme

Theme 使用 `SeedToken → MappingAlgorithm → MapToken → AliasToken` 四层模型。Provider 只负责全局 token、algorithm 和组件 overrides；组件自己的 token 派生函数位于组件目录内。

```text
import { Button, ConfigProvider, darkAlgorithm } from '@ftsukic/react-native-ui';

export function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        token: { colorPrimary: '#1989FA' },
        components: { Button: { borderRadius: 20 } },
      }}
    >
      <Button type="primary">保存</Button>
    </ConfigProvider>
  );
}
```

默认移动基线包括：

| Token                         | 默认值              |
| ----------------------------- | ------------------- |
| `colorPrimary`                | `#1989FA`           |
| `colorSuccess`                | `#07C160`           |
| `colorWarning`                | `#FF976A`           |
| `colorError`                  | `#EE0A24`           |
| `fontSizeXS / SM / / LG`      | `10 / 12 / 14 / 16` |
| `controlHeightXS / SM / / LG` | `24 / 32 / 44 / 50` |
| `borderRadiusXS / SM / / LG`  | `1 / 2 / 4 / 8`     |

公开 API：

```ts
useToken();
useComponentToken('Button', getButtonToken);
getDesignToken({ token, algorithm, components, inherit });
```

`ThemeConfig.token` 使用 `Partial<AliasToken>`。嵌套 `ConfigProvider` 默认继承父级，设置 `inherit: false` 后从默认 seed 开始解析。`useToken` 必须在 `ConfigProvider` 内使用。Theme 不包含业务主题或平台专用 token。
