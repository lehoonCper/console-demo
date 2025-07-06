# DataManager 模块架构说明

## 重构后的架构

### 组件层级
```
Main.vue (路由和状态管理)
├── LeftMenu.vue (菜单导航)
└── RepairData.vue (任务管理)
    ├── RepairForm.vue (任务表单)
    ├── RepairHistory.vue (历史记录)
    └── AddTask/ (添加/编辑任务)
```

### 职责分工

#### Main.vue - 主控制器
- **路由管理**：处理页面路由和导航
- **菜单配置**：获取和转换菜单数据
- **状态协调**：管理showAddTask等全局状态
- **页面分发**：根据路由决定显示哪个组件

#### RepairData.vue - 任务管理器
- **任务加载**：根据taskKey加载具体任务配置
- **表单提交**：处理任务表单的提交逻辑
- **任务操作**：编辑、删除任务
- **历史记录**：管理任务执行历史

#### RepairForm.vue - 表单组件
- **表单渲染**：根据任务配置动态生成表单
- **数据验证**：表单数据验证和格式化
- **权限控制**：基于用户权限控制操作按钮

### 数据流

#### 1. 初始化流程
```
Main.vue created
├── fetchMenuConfig() - 获取菜单配置
├── 设置 currentPath = $route.path
└── 传递 currentTaskKey 给 RepairData

RepairData.vue watch currentTaskKey
├── fetchRepairTaskConfigs() - 获取任务配置
└── loadCurrentTask(taskKey) - 加载具体任务
```

#### 2. 菜单选择流程
```
LeftMenu.vue handleSelect(index)
└── emit('select', index)

Main.vue handleMenuSelect(index)
├── currentPath = index
├── showAddTask = false
└── $router.replace(index)

RepairData.vue watch currentTaskKey
└── loadCurrentTask(newTaskKey)
```

#### 3. 任务提交流程
```
RepairForm.vue submitForm()
└── emit('submit-form', formData)

RepairData.vue handleSubmit(formData)
├── apiService.request('createRepairTask', formData)
├── 创建 newHistoryItem
└── 显示成功消息
```

### 优化点

#### 1. 移除的冗余逻辑
- ✅ 删除了 `getCurrentComponent` 计算属性的错误逻辑
- ✅ 移除了 `selectedCategory` 和 `currentSelectedPage` 等冗余状态
- ✅ 简化了 props 传递链
- ✅ 删除了 `prepareApiRequestData` 等未使用方法

#### 2. 简化的状态管理
- ✅ 使用 `currentTaskKey` 替代复杂的路径解析
- ✅ 直接在 RepairData 中管理任务配置和当前任务
- ✅ 减少了组件间的事件传递层级

#### 3. 清理的调试代码
- ✅ 移除了所有 console.log 调试语句
- ✅ 删除了临时的 debug 变量
- ✅ 清理了注释掉的代码

#### 4. 改进的错误处理
- ✅ 统一的错误消息处理
- ✅ 更好的加载状态管理
- ✅ 优雅的降级处理

### 性能优化

1. **减少不必要的 API 调用**：任务配置只在需要时加载
2. **优化组件渲染**：使用 v-if 条件渲染减少 DOM 节点
3. **简化数据流**：减少深层 props 传递和事件冒泡

### 维护性提升

1. **清晰的职责分工**：每个组件职责单一明确
2. **简化的数据流**：数据流向清晰可追踪
3. **更好的错误边界**：统一的错误处理机制
4. **类型安全**：明确的 props 类型定义 