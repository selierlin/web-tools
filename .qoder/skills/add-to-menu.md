# 添加工具到菜单技能

## 技能描述
将新创建的工具页面注册到主页面导航菜单中。

## 使用场景
- 新工具开发完成后添加到主页面
- 修改工具在菜单中的显示信息
- 调整菜单排序

## 执行步骤

### 1. 确定工具信息
- **显示名称**: 菜单上显示的文字
- **工具 ID**: 唯一标识，用于 URL hash
- **文件名**: 对应的 HTML 文件
- **图标类名**: Font Awesome 图标
- **关键词**: 用于搜索功能

### 2. 编辑 index.html
在 `<ul class="menu-list">` 中添加菜单项：

```html
<li class="menu-item" data-keywords="关键词1 关键词2 关键词3">
    <a href="#tool-id" data-id="tool-id" data-src="工具文件名.html">
        <i class="fas fa-icon-name"></i>显示名称
    </a>
</li>
```

### 3. 参数说明

| 属性 | 说明 | 示例 |
|------|------|------|
| `data-keywords` | 搜索关键词，空格分隔 | `"json 格式化 美化"` |
| `href` | URL hash，以 # 开头 | `"#json-formatter"` |
| `data-id` | 工具唯一 ID | `"json-formatter"` |
| `data-src` | HTML 文件名 | `"JSON 格式化.html"` |
| `class` | Font Awesome 图标类 | `"fas fa-code"` |

### 4. 常用图标参考

| 工具类型 | 图标类名 |
|---------|---------|
| 文本处理 | `fa-file-alt` |
| 代码/JSON | `fa-code` |
| 加密安全 | `fa-shield-alt` |
| 二维码 | `fa-qrcode` |
| 时间日期 | `fa-clock` / `fa-calendar-alt` |
| 计算 | `fa-calculator` |
| 网络/服务器 | `fa-server` |
| 终端/命令 | `fa-terminal` |
| 图表 | `fa-chart-bar` |
| 设置 | `fa-cog` |

### 5. 完整示例

添加一个"颜色选择器"工具：

```html
<li class="menu-item" data-keywords="颜色 选择器 取色 color picker">
    <a href="#color-picker" data-id="color-picker" data-src="颜色选择器.html">
        <i class="fas fa-palette"></i>颜色选择器
    </a>
</li>
```

## 注意事项
- `data-id` 必须唯一，不能与其他工具重复
- `data-src` 必须与文件名完全一致（包括空格）
- 关键词要覆盖用户可能搜索的词汇
- 图标要直观反映工具功能
