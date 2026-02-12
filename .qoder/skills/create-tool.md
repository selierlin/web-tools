# 创建新工具技能

## 技能描述
协助用户在 Web Tools 项目中创建新的在线工具页面。

## 使用场景
- 用户需要添加新的工具功能
- 扩展现有工具集
- 复制/修改现有工具

## 执行步骤

### 1. 需求分析
- 了解工具的功能需求
- 确定输入和输出
- 明确用户交互方式

### 2. 选择模板风格
根据工具类型选择合适的视觉风格：
- **浅色主题**: 数据展示类工具（JSON 格式化、文本加工）
- **深色主题**: 开发者工具（加密解密、编码解码）
- **渐变背景**: 视觉效果类工具（二维码生成器）

### 3. 创建工具文件
- 文件名格式：`[工具名称].html`
- 使用中文命名
- 确保文件编码为 UTF-8

### 4. 实现工具功能
- HTML 结构清晰
- CSS 使用变量，响应式设计
- JavaScript 功能完整，有错误处理
- 添加必要的注释

### 5. 注册到主页面
在 `index.html` 的菜单列表中添加：
```html
<li class="menu-item" data-keywords="关键词1 关键词2">
    <a href="#tool-id" data-id="tool-id" data-src="工具名称.html">
        <i class="fas fa-icon"></i>显示名称
    </a>
</li>
```

## 代码规范检查清单
- [ ] 文件使用 UTF-8 编码
- [ ] 包含完整的 HTML 结构
- [ ] 使用 CSS 变量定义主题色
- [ ] 响应式设计，支持移动端
- [ ] JavaScript 放在页面底部或 DOMContentLoaded 中
- [ ] 有基本的错误处理
- [ ] 代码注释清晰

## 示例

### 创建一个简单的计算器工具

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简单计算器</title>
    <style>
        :root {
            --primary-color: #4361ee;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #1e293b;
            --radius: 10px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: var(--bg-color);
            padding: 20px;
            font-family: "Inter", sans-serif;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            background: var(--card-bg);
            padding: 24px;
            border-radius: var(--radius);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        input, button {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
        }
        button {
            background: var(--primary-color);
            color: white;
            border: none;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>简单计算器</h2>
        <input type="number" id="num1" placeholder="数字1">
        <input type="number" id="num2" placeholder="数字2">
        <button onclick="calculate()">计算</button>
        <div id="result"></div>
    </div>
    <script>
        function calculate() {
            const n1 = parseFloat(document.getElementById('num1').value);
            const n2 = parseFloat(document.getElementById('num2').value);
            document.getElementById('result').textContent = '结果: ' + (n1 + n2);
        }
    </script>
</body>
</html>
```
