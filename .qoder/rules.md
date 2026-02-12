# Web Tools 项目规则

## 项目概述
这是一个纯前端在线工具箱项目，包含多个独立的 HTML 工具页面，通过 iframe 嵌入到主页面中。

## 技术栈
- **前端**: 纯 HTML5 + CSS3 + JavaScript (Vanilla JS)
- **样式**: CSS 变量、Flexbox、Grid 布局
- **图标**: Font Awesome
- **无构建工具**: 直接编辑 HTML 文件，无需编译

## 项目结构
```
web-tools/
├── index.html              # 主页面，包含导航和 iframe 容器
├── README.md               # 项目说明
├── [工具名称].html         # 各工具页面（独立完整页面）
│   ├── JSON 格式化.html
│   ├── 文本加工.html
│   ├── 编码解码.html
│   ├── 加密解密.html
│   ├── 二维码生成器.html
│   ├── 文本对比.html
│   ├── 时间计算器.html
│   ├── 日期计算器.html
│   ├── 正则可视化.html
│   ├── Cron 表达式工具.html
│   ├── Nacos 服务管理.html
│   └── UUID生成器.html
└── .qoder/
    └── rules.md            # 本规则文件
```

## 开发规范

### 1. 文件命名
- 工具页面使用中文命名，如 `JSON 格式化.html`、`文本加工.html`
- 文件名应与导航菜单显示名称一致

### 2. 页面结构
每个工具页面必须是完整的独立 HTML 文件：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>工具名称</title>
    <!-- 样式和脚本 -->
</head>
<body>
    <!-- 工具内容 -->
</body>
</html>
```

### 3. CSS 规范
- 使用 CSS 变量定义主题色，便于统一修改
- 推荐变量命名：
  ```css
  :root {
    --primary-color: #4361ee;
    --primary-hover: #3a56d4;
    --bg-color: #f8fafc;
    --card-bg: #ffffff;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --radius: 10px;
    --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  ```
- 工具页面样式应独立，不依赖外部 CSS 文件
- 支持响应式设计，适配移动端

### 4. JavaScript 规范
- 使用原生 JavaScript，不依赖大型框架
- 可使用轻量级第三方库（如二维码生成、加密算法等）
- 代码应放在页面底部或 `DOMContentLoaded` 事件中
- 避免污染全局命名空间

### 5. 添加新工具流程
1. 创建新的 HTML 文件，命名格式：`[工具名称].html`
2. 实现工具功能，确保样式独立完整
3. 在 `index.html` 的菜单列表中添加导航项：
   ```html
   <li class="menu-item" data-keywords="关键词1 关键词2">
       <a href="#tool-id" data-id="tool-id" data-src="工具名称.html">
           <i class="fas fa-icon"></i>显示名称
       </a>
   </li>
   ```
4. 确保 `data-keywords` 包含搜索关键词，便于搜索功能

### 6. 主页面 (index.html) 修改注意事项
- 导航菜单在 `<ul class="menu-list">` 中
- 每个菜单项需要 `data-id`、`data-src` 和 `data-keywords` 属性
- 图标使用 Font Awesome 类名，如 `fas fa-code`

### 7. 第三方库使用
- 优先使用 CDN 引入，如 jsDelivr、cdnjs
- 常用库：
  - Font Awesome: 图标
  - QRCode.js: 二维码生成
  - crypto-js: 加密算法
  - particles.js: 背景特效

### 8. 浏览器兼容性
- 支持现代浏览器（Chrome、Firefox、Safari、Edge）
- 使用 `-webkit-`、`-moz-` 等前缀确保兼容性
- 移动端适配优先

## 注意事项
- 每个工具页面都是独立的，可以直接在浏览器中打开运行
- 不要修改 `.idea/` 目录下的文件（IDE 配置文件）
- 保持代码简洁，避免过度工程化
- 工具应实用、轻量、无广告
