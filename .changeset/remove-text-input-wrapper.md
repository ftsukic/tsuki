---
'@ftsukic/tsuki': major
---

删除 TextInput 公共封装及 TextInputProps、TextInputInstance 导出，不保留兼容出口。需要基础输入时直接从 react-native 引入 TextInput；Input 和 FieldInput 改为直接使用原生组件与类型。移除对应文档、Fixture 和透传测试。
