# AddTask 组件架构

## 概述
`AddTask` 组件已被重构为模块化架构，将原来的单一大组件拆分为多个小组件，提高了可维护性和复用性。

## 目录结构

```
AddTask/
├── Main.vue                    # 主组件，负责整体逻辑和步骤控制
├── common/                     # 通用组件
│   ├── StepIndicator.vue      # 步骤指示器
│   └── StepControls.vue       # 步骤控制按钮
├── steps/                      # 步骤组件
│   ├── BasicInfoStep.vue      # 基本信息步骤
│   ├── AccessConfigStep.vue   # 访问配置步骤
│   └── ParamsConfigStep.vue   # 参数配置步骤
├── config/                     # 配置相关组件
│   ├── HttpConfig.vue         # HTTP配置
│   ├── GrpcConfig.vue         # GRPC配置
│   └── HeadersEditor.vue      # Headers编辑器
└── params/                     # 参数相关组件
    ├── ParamCard.vue          # 参数卡片
    └── SelectOptions.vue      # 选项配置
```

## 组件职责

### 主组件 (Main.vue)
- 管理整体表单数据
- 控制步骤流程
- 处理表单验证和提交
- 协调各子组件间的数据传递

### 通用组件 (common/)
- **StepIndicator**: 显示当前步骤进度
- **StepControls**: 提供上一步、下一步、提交、重置等操作

### 步骤组件 (steps/)
- **BasicInfoStep**: 处理任务基本信息输入
- **AccessConfigStep**: 处理访问配置，包含HTTP和GRPC配置
- **ParamsConfigStep**: 处理参数配置，管理参数列表

### 配置组件 (config/)
- **HttpConfig**: HTTP访问配置表单
- **GrpcConfig**: GRPC访问配置表单
- **HeadersEditor**: 可复用的Headers编辑器

### 参数组件 (params/)
- **ParamCard**: 单个参数配置卡片
- **SelectOptions**: 选择类型参数的选项配置

## 数据流

1. **向下传递**: 主组件通过 props 向子组件传递数据
2. **向上通信**: 子组件通过 emit 事件向父组件传递数据变更
3. **双向绑定**: 使用 v-model 实现父子组件间的数据同步

## 优势

1. **可维护性**: 每个组件职责单一，易于理解和修改
2. **可复用性**: 如 HeadersEditor、SelectOptions 等组件可在其他地方复用
3. **可测试性**: 小组件更容易进行单元测试
4. **代码组织**: 逻辑分离，主组件专注于流程控制
5. **性能优化**: 按需加载，减少单个组件的复杂度

## 使用方式

```vue
<template>
  <AddTask 
    :current-category="currentCategory"
    :is-new-category="isNewCategory"
    :edit-task-data="editTaskData"
    @task-added="handleTaskAdded"
    @cancel-edit="handleCancelEdit"
  />
</template>

<script>
import AddTask from './components/AddTask.vue'

export default {
  components: {
    AddTask
  }
  // ...
}
</script>
```

## 扩展指南

### 添加新的步骤
1. 在 `steps/` 目录下创建新的步骤组件
2. 在 `Main.vue` 中导入并注册组件
3. 在模板中添加对应的步骤条件渲染
4. 更新 `StepIndicator.vue` 中的步骤信息

### 添加新的配置类型
1. 在 `config/` 目录下创建新的配置组件
2. 在对应的步骤组件中导入并使用
3. 更新数据结构和验证规则

### 添加新的参数类型
1. 在 `params/` 目录下创建新的参数组件
2. 在 `ParamCard.vue` 中添加条件渲染
3. 更新参数类型选项 