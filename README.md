# web-tools
前端工具箱

## 项目介绍

这是一个在线工具箱项目。绝大多数工具是纯前端、在浏览器中运行；唯一需要后端的是「拨测」（`boce/` + `server/`），因为它要代持账号、直连 boce 协议。

## 功能列表

### 文本处理工具
- 文本加工：支持文本的大小写转换、去重、排序等功能
- 文本对比：提供文本差异对比功能，高亮显示差异部分
- JSON格式化：JSON格式验证、美化、折叠展开等功能

### 编码解码工具
- 编码解码：支持Base64、URL编码/解码、HTML实体转义等
- Base64图片转换：图片与Base64编码互转

### 安全工具
- 加密解密：支持MD5、SHA、AES等常见加密算法

### 实用工具
- 二维码生成器：支持自定义样式、尺寸的二维码生成
- UUID生成器：生成标准UUID/GUID
- 时间计算器：时间戳与日期相互转换及计算
- 日期计算器：日期计算、间隔计算等

### 开发工具
- 正则可视化：正则表达式可视化展示
- Cron表达式工具：Cron表达式生成和解析
- Nacos服务管理：Nacos配置和服务管理工具

### 实用工具
- 颜色转换：支持多种颜色格式转换（HEX/RGB/HSL/CMYK等）、颜色拾取、渐变生成、对比度检测

## 技术特点

- 除拨测外均为纯前端实现，无需后端支持
- 响应式设计，支持移动端访问
- 界面美观，采用现代化设计风格
- 功能实用，覆盖开发常用场景
- 代码开源，易于扩展和定制

## 使用方法

直接打开 index.html 文件即可使用所有工具（拨测需先启动后端，见下节）。

## 拨测（boce）

全国 31 省 × 三网共 92 节点的 HTTP 拨测，支持多账号轮换、额度监控、历史对比与 CSV 导出。

```
boce/            前端静态页，输入访问口令后进入
server/          后端，Express + WebSocket，代持账号并直连 boce 协议
server/scripts/migrate-legacy.js  旧版单池数据迁入指定口令的空间
deploy/          nginx 片段与部署说明
```

### 访问口令即空间

没有注册流程。输入任意 ≥8 位的口令，服务端用 scrypt 派生出一个稳定的空间 ID，
首次输入即创建空间，之后同一口令回到同一空间——**口令丢失等于数据丢失，无法找回**。
不同口令之间完全隔离，互相看不到账号与历史。

### 本地运行

```bash
cd server
npm install
cp .env.example .env      # 至少改掉 BOCE_SECRET
npm start                 # 默认 http://127.0.0.1:8899
```

打开 `http://127.0.0.1:8899/` 即可（后端同时托管 `boce/` 静态页）。

### 部署

静态页与后端分开部署，数据目录独立在代码目录之外，避免 `rsync --delete` 清掉账号。

**zzw（手动脚本，前后端目录平级）**

| 内容 | 服务器路径 | 部署命令 |
| --- | --- | --- |
| 静态页 | `/usr/Projects/web-tools/` | `./deploy-private.sh` |
| 后端代码 | `/usr/Projects/web-tools-server/` | `./deploy-server.sh` |
| 数据与 `.env` | `/usr/Projects/web-tools-data/boce/` | 手动维护，脚本不碰 |

**内网（Jenkins `Test_web-tools_test`，同一个项目目录下 fe/be 分家）**

| 内容 | 服务器路径 | 说明 |
| --- | --- | --- |
| 前端静态 | `/opt/webapps/web-tools/fe/` | nginx root，`rsync --delete` 覆盖 |
| 后端数据 | `/opt/webapps/web-tools/be/` | 挂载到容器 `/data`，`.env` 也在这里，同步不碰 |

流水线模板在共享库 `WebTools_Jenkinsfile.groovy`，后端代码不打到目标机（内含镜像），
目标机只需 Docker、数据目录和 `.env`。

nginx 片段见 `deploy/nginx-boce.conf`，要点：`/boce/` 走静态，`/boce/api/` 反代到 `127.0.0.1:8899`，
并挡掉站点根下的 `/server/` 源码目录。

### 迁移旧版数据

旧版（独立 `boce-tool` 仓库）是全局单池，按下述命令迁入指定口令的空间：

```bash
BOCE_SECRET=<线上同一个值> BOCE_DATA_DIR=<生产数据目录> \
  node server/scripts/migrate-legacy.js <旧 boce-tool/data 路径> '<访问口令>'
```

## 更新记录页面

项目已增加“更新记录”页面（`更新记录.html`），用于展示仓库的 Git 提交历史。

- 数据来源：`json/更新记录.json`
- 生成脚本：`scripts/generate-updates-json.mjs`
- 脚本作用：读取本地 `git log`，提取提交哈希、时间、作者、提交说明，并写入 `json/更新记录.json`

每次有新提交后，执行以下命令刷新页面数据：

```bash
node scripts/generate-updates-json.mjs 120
```

说明：
- `120` 表示最多生成最近 120 条提交记录，可按需调整
- `index.html` 已提供“更新记录”入口菜单

## 扩展新工具

如需添加新工具，请参考项目规则文档 [.qoder/rules.md](.qoder/rules.md)，按照规范创建新的HTML文件并在index.html中添加相应的菜单项。
