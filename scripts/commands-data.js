window.COMMANDS_DATA = [
      {
        category: "Linux 文件",
        name: "按名称查找文件",
        desc: "在指定目录递归查找文件名。",
        command: "find /path/to/dir -type f -name \"*.log\"",
        tags: ["linux", "debian", "centos", "macos", "查文件", "搜索文件", "find", "文件名"]
      },
      {
        category: "Linux 文件",
        name: "按内容搜索文本",
        desc: "在目录内递归搜索文本内容。",
        command: "grep -Rin \"关键字\" /path/to/dir",
        tags: ["linux", "debian", "centos", "macos", "文本搜索", "grep", "关键字", "日志"]
      },
      {
        category: "Linux 文件",
        name: "快速查找文件路径",
        desc: "使用数据库快速查找，先更新索引。",
        command: "sudo updatedb && locate nginx.conf",
        tags: ["linux", "locate", "路径", "搜索文件"]
      },
      {
        category: "Linux 文件",
        name: "查看目录大小",
        desc: "统计目录及子目录占用。",
        command: "du -h --max-depth=1 /path/to/dir",
        tags: ["linux", "debian", "centos", "macos", "磁盘", "目录大小", "du"]
      },
      {
        category: "Linux 文件",
        name: "排序查看大文件",
        desc: "找出当前目录下最大的文件。",
        command: "find . -type f -exec du -h {} + | sort -rh | head -n 20",
        tags: ["linux", "debian", "centos", "macos", "大文件", "排查", "磁盘满"]
      },
      {
        category: "Linux 进程",
        name: "查看进程",
        desc: "查看所有进程并过滤关键字。",
        command: "ps -ef | grep nginx",
        tags: ["linux", "debian", "centos", "macos", "进程", "ps", "grep"]
      },
      {
        category: "Linux 进程",
        name: "按端口查进程",
        desc: "查看某端口被哪个进程占用（Linux/macOS/Debian 通用）。",
        command: "lsof -i :8080",
        tags: ["linux", "debian", "centos", "macos", "端口占用", "lsof", "查端口"]
      },
      {
        category: "Linux 进程",
        name: "结束进程",
        desc: "优雅或强制结束目标进程。",
        command: "kill -15 <pid>    # 强制可用 kill -9 <pid>",
        tags: ["linux", "debian", "centos", "macos", "杀进程", "kill", "结束程序"]
      },
      {
        category: "Linux 进程",
        name: "实时资源监控",
        desc: "查看 CPU/内存实时占用。",
        command: "top    # 或 htop",
        tags: ["linux", "debian", "centos", "macos", "监控", "cpu", "内存", "top"]
      },
      {
        category: "Linux 网络",
        name: "查看本机 IP",
        desc: "查看网络接口地址。",
        command: "ip addr",
        tags: ["linux", "centos", "ip", "网络", "地址"]
      },
      {
        category: "Linux 网络",
        name: "测试网络连通",
        desc: "测试域名或主机是否可达。",
        command: "ping -c 4 example.com",
        tags: ["linux", "debian", "centos", "macos", "ping", "连通性", "网络诊断"]
      },
      {
        category: "Linux 网络",
        name: "查看监听端口",
        desc: "列出所有监听状态端口。",
        command: "ss -lntp",
        tags: ["linux", "centos", "端口", "监听", "ss"]
      },
      {
        category: "Linux 网络",
        name: "下载文件（curl/wget）",
        desc: "从 URL 下载文件，提供 curl 与 wget 两种写法。",
        command: "curl -LO https://example.com/file.tar.gz\n# 或\nwget https://example.com/file.tar.gz",
        tags: ["linux", "debian", "centos", "macos", "下载", "curl", "wget", "网络"]
      },
      {
        category: "Linux 系统",
        name: "查看系统版本",
        desc: "显示 Linux 发行版信息。",
        command: "cat /etc/os-release",
        tags: ["linux", "centos", "系统信息", "版本"]
      },
      {
        category: "Linux 系统",
        name: "查看磁盘空间",
        desc: "查看各分区使用率。",
        command: "df -h",
        tags: ["linux", "debian", "centos", "macos", "磁盘", "空间", "df"]
      },
      {
        category: "Linux 系统",
        name: "查看内存使用",
        desc: "查看内存和 swap 使用情况。",
        command: "free -h",
        tags: ["linux", "centos", "内存", "free", "系统状态"]
      },
      {
        category: "Linux 权限",
        name: "修改文件权限",
        desc: "设置可读写执行权限。",
        command: "chmod 755 script.sh",
        tags: ["linux", "debian", "centos", "macos", "权限", "chmod"]
      },
      {
        category: "Linux 权限",
        name: "递归修改目录权限",
        desc: "递归设置目录及其子文件的权限。",
        command: "chmod -R 755 /path/to/dir",
        tags: ["linux", "debian", "centos", "macos", "权限", "chmod", "递归"]
      },
      {
        category: "Linux 权限",
        name: "修改文件归属",
        desc: "设置文件所属用户和组。",
        command: "chown user:group file.txt",
        tags: ["linux", "debian", "centos", "macos", "权限", "chown", "用户组"]
      },
      {
        category: "Linux 服务",
        name: "查看服务状态",
        desc: "查看 systemd 服务运行情况。",
        command: "systemctl status nginx",
        tags: ["linux", "centos", "服务", "systemctl", "状态"]
      },
      {
        category: "Linux 服务",
        name: "重启服务",
        desc: "重启指定服务并应用新配置。",
        command: "sudo systemctl restart nginx",
        tags: ["linux", "debian", "centos", "服务", "重启", "systemctl"]
      },
      {
        category: "macOS",
        name: "打开当前文件夹",
        desc: "在 Finder 中打开当前终端所在目录。",
        command: "open .",
        tags: ["macos", "finder", "打开目录", "open", "当前文件夹"]
      },
      {
        category: "macOS",
        name: "打开文件或网址",
        desc: "使用系统默认应用打开文件、目录或 URL。",
        command: "open <file_or_url>",
        tags: ["macos", "open", "打开文件", "打开网址"]
      },
      {
        category: "macOS",
        name: "查询端口监听进程（macOS）",
        desc: "精确查看某端口 LISTEN 状态进程。",
        command: "lsof -nP -iTCP:8080 -sTCP:LISTEN",
        tags: ["macos", "查端口", "端口占用", "lsof", "监听"]
      },
      {
        category: "macOS",
        name: "查看本机 IP（macOS）",
        desc: "查看 Wi-Fi 网卡 IPv4 地址。",
        command: "ipconfig getifaddr en0",
        tags: ["macos", "ip", "本机ip", "网络"]
      },
      {
        category: "Debian",
        name: "更新软件源索引",
        desc: "同步 APT 仓库索引。",
        command: "sudo apt update",
        tags: ["debian", "apt", "更新", "软件源", "linux"]
      },
      {
        category: "Debian",
        name: "安装软件包",
        desc: "通过 APT 安装软件。",
        command: "sudo apt install <package_name>",
        tags: ["debian", "apt", "安装", "软件", "linux"]
      },
      {
        category: "Debian",
        name: "卸载软件包（含配置）",
        desc: "删除软件并清理配置文件。",
        command: "sudo apt remove --purge <package_name>",
        tags: ["debian", "apt", "卸载", "删除软件", "linux"]
      },
      {
        category: "Debian",
        name: "搜索可安装软件",
        desc: "在仓库中搜索软件包。",
        command: "apt search <keyword>",
        tags: ["debian", "apt", "搜索软件", "包管理", "linux"]
      },
      {
        category: "Debian",
        name: "安装本地 .deb 包",
        desc: "安装本地 deb 文件并修复依赖。",
        command: "sudo dpkg -i app.deb && sudo apt -f install",
        tags: ["debian", "dpkg", "deb", "安装", "依赖修复"]
      },
      {
        category: "Debian",
        name: "查看 Debian 版本",
        desc: "查看系统发行版与版本信息。",
        command: "lsb_release -a    # 或 cat /etc/debian_version",
        tags: ["debian", "版本", "系统信息", "linux"]
      },
      {
        category: "CentOS",
        name: "查看 CentOS 版本",
        desc: "查看 CentOS/RHEL 发行版版本信息。",
        command: "cat /etc/centos-release    # 或 cat /etc/redhat-release",
        tags: ["centos", "rhel", "版本", "系统信息", "linux"]
      },
      {
        category: "CentOS",
        name: "更新软件源缓存（yum）",
        desc: "刷新 yum 元数据缓存。",
        command: "sudo yum makecache",
        tags: ["centos", "yum", "更新", "软件源", "linux"]
      },
      {
        category: "CentOS",
        name: "安装软件包（yum）",
        desc: "在 CentOS 7 常用 yum 安装软件。",
        command: "sudo yum install -y <package_name>",
        tags: ["centos", "yum", "安装", "软件", "linux"]
      },
      {
        category: "CentOS",
        name: "安装软件包（dnf）",
        desc: "在 CentOS Stream/RHEL 新版本常用 dnf。",
        command: "sudo dnf install -y <package_name>",
        tags: ["centos", "dnf", "安装", "软件", "linux"]
      },
      {
        category: "CentOS",
        name: "查看已安装 RPM 包",
        desc: "列出 RPM 包并按关键字过滤。",
        command: "rpm -qa | grep <keyword>",
        tags: ["centos", "rpm", "查询", "软件包", "linux"]
      },
      {
        category: "CentOS",
        name: "开放端口（firewalld）",
        desc: "永久开放端口并重载防火墙规则。",
        command: "sudo firewall-cmd --permanent --add-port=8080/tcp && sudo firewall-cmd --reload",
        tags: ["centos", "firewalld", "防火墙", "端口", "linux"]
      },
      {
        category: "CentOS",
        name: "查看 SELinux 状态",
        desc: "检查 SELinux 当前模式（Enforcing/Permissive）。",
        command: "sestatus",
        tags: ["centos", "selinux", "安全", "状态", "linux"]
      },
      {
        category: "CentOS",
        name: "临时切换 SELinux 到宽容模式",
        desc: "临时生效，重启后恢复（仅排障时使用）。",
        command: "sudo setenforce 0",
        tags: ["centos", "selinux", "排障", "安全", "linux"]
      },
      {
        category: "Docker",
        name: "启动容器（后台）",
        desc: "通过镜像启动一个容器。",
        command: "docker run -d --name web -p 8080:80 nginx",
        tags: ["docker", "启动", "run", "容器", "后台"]
      },
      {
        category: "Docker",
        name: "查看运行中的容器",
        desc: "仅显示运行态容器。",
        command: "docker ps",
        tags: ["docker", "查看", "容器", "ps"]
      },
      {
        category: "Docker",
        name: "查看所有容器",
        desc: "包含已停止容器。",
        command: "docker ps -a",
        tags: ["docker", "容器", "列表", "全部"]
      },
      {
        category: "Docker",
        name: "停止容器",
        desc: "优雅停止容器。",
        command: "docker stop <container_name_or_id>",
        tags: ["docker", "停止", "容器", "stop"]
      },
      {
        category: "Docker",
        name: "启动已停止容器",
        desc: "重新启动一个已有容器。",
        command: "docker start <container_name_or_id>",
        tags: ["docker", "启动", "start", "容器"]
      },
      {
        category: "Docker",
        name: "重启容器",
        desc: "快速重启目标容器。",
        command: "docker restart <container_name_or_id>",
        tags: ["docker", "重启", "restart", "容器"]
      },
      {
        category: "Docker",
        name: "进入容器终端",
        desc: "进入容器交互式 shell。",
        command: "docker exec -it <container_name_or_id> sh",
        tags: ["docker", "进入容器", "exec", "shell"]
      },
      {
        category: "Docker",
        name: "查看容器日志",
        desc: "实时跟踪输出日志。",
        command: "docker logs -f <container_name_or_id>",
        tags: ["docker", "日志", "log", "排查"]
      },
      {
        category: "Docker",
        name: "在主机与容器间复制文件",
        desc: "支持主机到容器、容器到主机双向复制。",
        command: "docker cp ./local-file.txt <container_name_or_id>:/tmp/local-file.txt\ndocker cp <container_name_or_id>:/var/log/app.log ./app.log",
        tags: ["docker", "cp", "docker cp", "复制文件", "容器", "主机"]
      },
      {
        category: "Docker",
        name: "删除容器",
        desc: "删除停止状态容器。",
        command: "docker rm <container_name_or_id>",
        tags: ["docker", "删除容器", "rm", "清理"]
      },
      {
        category: "Docker",
        name: "删除镜像",
        desc: "删除本地镜像。",
        command: "docker rmi <image_name_or_id>",
        tags: ["docker", "删除镜像", "rmi", "清理"]
      },
      {
        category: "Docker",
        name: "构建镜像",
        desc: "根据 Dockerfile 构建镜像。",
        command: "docker build -t myapp:latest .",
        tags: ["docker", "构建", "build", "镜像"]
      },
      {
        category: "Docker Compose",
        name: "启动 compose 服务",
        desc: "按 docker-compose.yml 后台启动。",
        command: "docker compose up -d",
        tags: ["docker", "compose", "启动", "多容器"]
      },
      {
        category: "Docker Compose",
        name: "停止 compose 服务",
        desc: "停止并移除 compose 创建的容器。",
        command: "docker compose down",
        tags: ["docker", "compose", "停止", "down"]
      },
      {
        category: "Git",
        name: "查看状态",
        desc: "查看工作区与暂存区状态。",
        command: "git status",
        tags: ["git", "状态", "改动"]
      },
      {
        category: "Git",
        name: "查看提交历史",
        desc: "以简洁图形方式展示历史。",
        command: "git log --oneline --graph --decorate -n 20",
        tags: ["git", "log", "历史", "提交"]
      },
      {
        category: "Git",
        name: "创建并切换分支",
        desc: "创建新分支并切换过去。",
        command: "git checkout -b feature/my-task",
        tags: ["git", "分支", "checkout", "新建"]
      },
      {
        category: "Git",
        name: "克隆远程仓库",
        desc: "把远程仓库下载到本地目录。",
        command: "git clone https://github.com/<owner>/<repo>.git\n# 或\ngit clone git@github.com:<owner>/<repo>.git",
        tags: ["git", "clone", "克隆", "远程仓库", "下载代码"]
      },
      {
        category: "Git",
        name: "浅克隆仓库（仅最近提交）",
        desc: "仅拉取最近提交，速度更快但历史不完整。",
        command: "git clone --depth 1 <repository_url>",
        tags: ["git", "clone", "浅克隆", "depth", "下载代码", "性能优化"]
      },
      {
        category: "Git",
        name: "拉取远程更新",
        desc: "获取并合并远程分支变更。",
        command: "git pull origin main",
        tags: ["git", "拉取", "pull", "更新"]
      },
      {
        category: "Git",
        name: "提交代码",
        desc: "把暂存区改动提交到本地仓库。",
        command: "git add . && git commit -m \"feat: update\"",
        tags: ["git", "提交", "commit", "add"]
      },
      {
        category: "Git",
        name: "回退到某次提交",
        desc: "将当前分支回到指定 commit（谨慎）。",
        command: "git reset --hard <commit_id>",
        tags: ["git", "回退", "reset", "版本恢复"]
      },
      {
        category: "Git",
        name: "撤销工作区文件修改",
        desc: "丢弃某个文件未暂存改动。",
        command: "git checkout -- <file>",
        tags: ["git", "撤销", "恢复", "checkout"]
      },
      {
        category: "Kubernetes",
        name: "查看 Pod 列表",
        desc: "查看当前命名空间的 Pod。",
        command: "kubectl get pods",
        tags: ["k8s", "kubernetes", "pod", "查看"]
      },
      {
        category: "Kubernetes",
        name: "查看 Pod 详情",
        desc: "排查 Pod 事件、状态、容器信息。",
        command: "kubectl describe pod <pod_name>",
        tags: ["k8s", "describe", "排查", "pod"]
      },
      {
        category: "Kubernetes",
        name: "查看 Pod 日志",
        desc: "实时查看容器日志输出。",
        command: "kubectl logs -f <pod_name>",
        tags: ["k8s", "日志", "log", "pod"]
      },
      {
        category: "Kubernetes",
        name: "进入 Pod",
        desc: "进入容器进行调试。",
        command: "kubectl exec -it <pod_name> -- sh",
        tags: ["k8s", "exec", "进入", "调试"]
      },
      {
        category: "数据库",
        name: "MySQL 登录",
        desc: "使用用户名和密码登录 MySQL。",
        command: "mysql -h 127.0.0.1 -P 3306 -u root -p",
        tags: ["mysql", "数据库", "登录", "sql"]
      },
      {
        category: "数据库",
        name: "MySQL 查看数据库列表",
        desc: "列出当前实例中的所有数据库（在 MySQL 客户端中执行）。",
        command: "SHOW DATABASES;",
        tags: ["mysql", "数据库", "show databases", "sql", "查询"]
      },
      {
        category: "数据库",
        name: "MySQL 创建数据库",
        desc: "创建新数据库并指定字符集（在 MySQL 客户端中执行）。",
        command: "CREATE DATABASE app_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
        tags: ["mysql", "建库", "create database", "sql"]
      },
      {
        category: "数据库",
        name: "MySQL 切换数据库",
        desc: "切换到目标数据库执行后续 SQL（在 MySQL 客户端中执行）。",
        command: "USE app_db;",
        tags: ["mysql", "use", "切库", "sql"]
      },
      {
        category: "数据库",
        name: "MySQL 创建数据表",
        desc: "创建带主键和时间字段的示例表（在 MySQL 客户端中执行）。",
        command: "CREATE TABLE users (\n  id BIGINT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(150) NOT NULL UNIQUE,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        tags: ["mysql", "建表", "create table", "sql", "innodb"]
      },
      {
        category: "数据库",
        name: "MySQL 查看表结构",
        desc: "快速查看字段、类型、索引信息（在 MySQL 客户端中执行）。",
        command: "DESC users;",
        tags: ["mysql", "表结构", "desc", "字段", "sql"]
      },
      {
        category: "数据库",
        name: "MySQL 插入数据",
        desc: "向表中插入一条记录（在 MySQL 客户端中执行）。",
        command: "INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');",
        tags: ["mysql", "插入", "insert into", "sql", "写入"]
      },
      {
        category: "数据库",
        name: "MySQL INSERT SELECT 批量写入",
        desc: "将查询结果批量插入到目标表（在 MySQL 客户端中执行）。",
        command: "INSERT INTO users_backup (id, name, email)\nSELECT id, name, email FROM users WHERE id > 1000;",
        tags: ["mysql", "insert select", "批量插入", "数据迁移", "sql"]
      },
      {
        category: "数据库",
        name: "MySQL 更新数据",
        desc: "按条件更新字段值（在 MySQL 客户端中执行）。",
        command: "UPDATE users SET email = 'alice_new@example.com' WHERE id = 1;",
        tags: ["mysql", "更新", "update", "sql", "修改"]
      },
      {
        category: "数据库",
        name: "MySQL 条件查询",
        desc: "按条件筛选并按时间倒序查看（在 MySQL 客户端中执行）。",
        command: "SELECT id, name, email FROM users WHERE id > 0 ORDER BY id DESC LIMIT 20;",
        tags: ["mysql", "查询", "select", "where", "sql"]
      },
      {
        category: "数据库",
        name: "MySQL 删除数据",
        desc: "按条件删除记录（在 MySQL 客户端中执行，执行前先确认条件）。",
        command: "DELETE FROM users WHERE id = 1;",
        tags: ["mysql", "删除", "delete", "sql", "谨慎操作"]
      },
      {
        category: "数据库",
        name: "MySQL 查看当前连接与进程",
        desc: "查看当前会话和正在执行的 SQL（在 MySQL 客户端中执行）。",
        command: "SHOW FULL PROCESSLIST;",
        tags: ["mysql", "进程", "processlist", "连接", "sql", "排查"]
      },
      {
        category: "数据库",
        name: "MySQL 终止慢查询连接",
        desc: "通过连接 ID 终止异常会话（在 MySQL 客户端中执行）。",
        command: "KILL <process_id>;",
        tags: ["mysql", "kill", "进程", "慢查询", "排查", "谨慎操作"]
      },
      {
        category: "数据库",
        name: "MySQL 创建普通索引",
        desc: "为高频过滤字段添加索引提升查询速度（在 MySQL 客户端中执行）。",
        command: "CREATE INDEX idx_users_email ON users(email);",
        tags: ["mysql", "索引", "create index", "性能优化", "sql"]
      },
      {
        category: "数据库",
        name: "PostgreSQL 登录",
        desc: "连接 PostgreSQL 数据库。",
        command: "psql -h 127.0.0.1 -p 5432 -U postgres -d mydb",
        tags: ["postgres", "postgresql", "数据库", "登录"]
      },
      {
        category: "数据库",
        name: "连接 Redis",
        desc: "连接 Redis 并执行命令。",
        command: "redis-cli -h 127.0.0.1 -p 6379",
        tags: ["redis", "redis-cli", "数据库", "缓存", "连接"]
      },
      {
        category: "数据库",
        name: "Redis 连通性检查",
        desc: "检查 Redis 服务是否正常响应。",
        command: "redis-cli -h 127.0.0.1 -p 6379 ping",
        tags: ["redis", "redis-cli", "ping", "连通性", "排查"]
      },
      {
        category: "数据库",
        name: "Redis 设置字符串",
        desc: "写入一个字符串键值（在 redis-cli 中执行）。",
        command: "SET user:1:name \"Alice\"",
        tags: ["redis", "set", "string", "写入", "缓存"]
      },
      {
        category: "数据库",
        name: "Redis 读取字符串",
        desc: "读取指定 key 的字符串值（在 redis-cli 中执行）。",
        command: "GET user:1:name",
        tags: ["redis", "get", "string", "读取", "缓存"]
      },
      {
        category: "数据库",
        name: "Redis 查看键是否存在",
        desc: "判断 key 是否存在（返回 1/0，在 redis-cli 中执行）。",
        command: "EXISTS user:1:name",
        tags: ["redis", "exists", "key", "检查", "排查"]
      },
      {
        category: "数据库",
        name: "Redis 设置过期时间",
        desc: "为 key 设置过期秒数（在 redis-cli 中执行）。",
        command: "EXPIRE user:1:name 3600",
        tags: ["redis", "expire", "ttl", "过期", "缓存"]
      },
      {
        category: "数据库",
        name: "Redis 查看剩余过期时间",
        desc: "查看 key 的 TTL（秒，在 redis-cli 中执行）。",
        command: "TTL user:1:name",
        tags: ["redis", "ttl", "expire", "过期", "排查"]
      },
      {
        category: "数据库",
        name: "Redis 删除键",
        desc: "删除一个或多个 key（在 redis-cli 中执行）。",
        command: "DEL user:1:name",
        tags: ["redis", "del", "删除", "key", "谨慎操作"]
      },
      {
        category: "数据库",
        name: "Redis 批量扫描键",
        desc: "按模式扫描键（在 redis-cli 中执行，生产环境优先用 SCAN 而非 KEYS）。",
        command: "SCAN 0 MATCH user:* COUNT 100",
        tags: ["redis", "scan", "键扫描", "排查", "性能友好"]
      },
      {
        category: "数据库",
        name: "Redis 查看键类型",
        desc: "查看 key 的数据类型（在 redis-cli 中执行）。",
        command: "TYPE user:1:name",
        tags: ["redis", "type", "key", "数据类型", "排查"]
      },
      {
        category: "数据库",
        name: "Redis 列表左侧入队",
        desc: "向列表头部插入元素（在 redis-cli 中执行）。",
        command: "LPUSH queue:jobs \"job-1\" \"job-2\"",
        tags: ["redis", "list", "lpush", "队列", "写入"]
      },
      {
        category: "数据库",
        name: "Redis 列表右侧出队",
        desc: "从列表尾部弹出一个元素（在 redis-cli 中执行）。",
        command: "RPOP queue:jobs",
        tags: ["redis", "list", "rpop", "队列", "消费"]
      },
      {
        category: "数据库",
        name: "Redis 哈希写入字段",
        desc: "向哈希类型写入多个字段（在 redis-cli 中执行）。",
        command: "HSET user:1 name \"Alice\" email \"alice@example.com\"",
        tags: ["redis", "hash", "hset", "写入", "对象"]
      },
      {
        category: "数据库",
        name: "Redis 哈希读取字段",
        desc: "读取哈希中的指定字段（在 redis-cli 中执行）。",
        command: "HGET user:1 email",
        tags: ["redis", "hash", "hget", "读取", "对象"]
      },
      {
        category: "数据库",
        name: "Redis 集合添加成员",
        desc: "向集合中添加一个或多个成员（在 redis-cli 中执行）。",
        command: "SADD online_users 1001 1002 1003",
        tags: ["redis", "set", "sadd", "集合", "写入"]
      },
      {
        category: "数据库",
        name: "Redis 集合查看成员",
        desc: "查看集合中的全部成员（在 redis-cli 中执行）。",
        command: "SMEMBERS online_users",
        tags: ["redis", "set", "smembers", "集合", "读取"]
      },
      {
        category: "数据库",
        name: "Redis 计数器自增",
        desc: "对数值型 key 执行原子自增（在 redis-cli 中执行）。",
        command: "INCR page:view:home",
        tags: ["redis", "incr", "计数器", "原子操作", "统计"]
      },
      {
        category: "数据库",
        name: "Redis 批量设置键值",
        desc: "一次写入多个字符串键值（在 redis-cli 中执行）。",
        command: "MSET user:1:name \"Alice\" user:1:city \"Shanghai\"",
        tags: ["redis", "mset", "批量写入", "string", "性能优化"]
      },
      {
        category: "数据库",
        name: "Redis 批量读取键值",
        desc: "一次读取多个字符串 key（在 redis-cli 中执行）。",
        command: "MGET user:1:name user:1:city",
        tags: ["redis", "mget", "批量读取", "string", "性能优化"]
      },
      {
        category: "数据库",
        name: "Redis 有序集合写入成员",
        desc: "向 ZSET 写入分数与成员（在 redis-cli 中执行）。",
        command: "ZADD leaderboard 100 user_1001 88 user_1002",
        tags: ["redis", "zset", "zadd", "排行榜", "有序集合"]
      },
      {
        category: "数据库",
        name: "Redis 读取有序集合区间",
        desc: "按排名区间读取成员（含分值，在 redis-cli 中执行）。",
        command: "ZRANGE leaderboard 0 9 WITHSCORES",
        tags: ["redis", "zset", "zrange", "排行榜", "查询"]
      },
      {
        category: "数据库",
        name: "Redis Stream 追加消息",
        desc: "向 Stream 追加一条事件消息（在 redis-cli 中执行）。",
        command: "XADD orders * order_id 10001 status created",
        tags: ["redis", "stream", "xadd", "消息队列", "事件"]
      },
      {
        category: "数据库",
        name: "Redis Stream 读取消息",
        desc: "从 Stream 最早消息开始读取（在 redis-cli 中执行）。",
        command: "XREAD COUNT 10 STREAMS orders 0-0",
        tags: ["redis", "stream", "xread", "消息队列", "消费"]
      },
      {
        category: "数据库",
        name: "Redis 查看运行信息",
        desc: "查看服务器内存、连接、命令统计等（在 redis-cli 中执行）。",
        command: "INFO",
        tags: ["redis", "info", "运行状态", "监控", "排查"]
      },
      {
        category: "数据库",
        name: "Redis 查看慢查询日志",
        desc: "查看最近慢查询记录（在 redis-cli 中执行）。",
        command: "SLOWLOG GET 20",
        tags: ["redis", "slowlog", "慢查询", "性能分析", "排查"]
      },
      {
        category: "常用工具",
        name: "解压 tar.gz",
        desc: "解压缩 tar.gz 包。",
        command: "tar -zxvf package.tar.gz",
        tags: ["解压", "tar", "压缩包"]
      },
      {
        category: "常用工具",
        name: "压缩目录",
        desc: "把目录打包为 tar.gz。",
        command: "tar -zcvf backup.tar.gz /path/to/dir",
        tags: ["压缩", "打包", "tar"]
      },
      {
        category: "常用工具",
        name: "查看命令帮助",
        desc: "查看命令参数和说明文档。",
        command: "man find    # 或 find --help",
        tags: ["帮助", "man", "文档", "参数"]
      },
      {
        category: "常用工具",
        name: "定时任务编辑",
        desc: "编辑当前用户 crontab。",
        command: "crontab -e",
        tags: ["定时任务", "cron", "crontab"]
      },
      {
        category: "常用工具",
        name: "查看环境变量",
        desc: "列出当前 shell 环境变量。",
        command: "printenv",
        tags: ["环境变量", "env", "shell"]
      },
      {
        category: "常用工具",
        name: "查看历史命令",
        desc: "查看当前 shell 的历史命令记录。",
        command: "history",
        tags: ["linux", "debian", "centos", "macos", "history", "历史命令", "shell", "排查"]
      },
      {
        category: "常用工具",
        name: "查看文件内容",
        desc: "直接输出文件内容到终端。",
        command: "cat /path/to/file",
        tags: ["linux", "debian", "centos", "macos", "cat", "查看文件", "文本"]
      },
      {
        category: "常用工具",
        name: "带行号查看文件",
        desc: "输出文件内容并显示行号。",
        command: "cat -n /path/to/file",
        tags: ["linux", "debian", "centos", "macos", "cat", "行号", "排查"]
      },
      {
        category: "常用工具",
        name: "查看日志末尾",
        desc: "查看文件最后 N 行内容。",
        command: "tail -n 100 /var/log/nginx/error.log",
        tags: ["linux", "debian", "centos", "macos", "tail", "日志", "查看日志"]
      },
      {
        category: "常用工具",
        name: "实时追踪日志",
        desc: "持续跟踪日志新增内容。",
        command: "tail -f /var/log/nginx/access.log",
        tags: ["linux", "debian", "centos", "macos", "tail", "日志", "实时"]
      },
      {
        category: "常用工具",
        name: "切换目录",
        desc: "进入目标目录。",
        command: "cd /path/to/dir",
        tags: ["linux", "debian", "centos", "macos", "cd", "目录", "路径"]
      },
      {
        category: "常用工具",
        name: "返回上级目录",
        desc: "回到当前目录的上一级。",
        command: "cd ..",
        tags: ["linux", "debian", "centos", "macos", "cd", "上级目录", "目录"]
      },
      {
        category: "常用工具",
        name: "nano 编辑文件",
        desc: "使用 nano 打开并编辑文本文件。",
        command: "nano /path/to/file",
        tags: ["linux", "debian", "centos", "macos", "nano", "编辑器", "文本编辑"]
      },
      {
        category: "常用工具",
        name: "vim 编辑文件",
        desc: "使用 vim 打开并编辑文本文件。",
        command: "vim /path/to/file",
        tags: ["linux", "debian", "centos", "macos", "vim", "编辑器", "文本编辑"]
      },
      {
        category: "常用工具",
        name: "VIM 保存文件",
        desc: "在 Vim 普通模式下执行，保存当前文件。",
        command: ":w",
        tags: ["linux", "debian", "centos", "macos", "vim", "保存", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 退出编辑器",
        desc: "在 Vim 普通模式下执行，退出编辑器。",
        command: ":q",
        tags: ["linux", "debian", "centos", "macos", "vim", "退出", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 保存并退出",
        desc: "在 Vim 普通模式下执行，保存并退出。",
        command: ":wq",
        tags: ["linux", "debian", "centos", "macos", "vim", "保存退出", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 强制退出不保存",
        desc: "在 Vim 普通模式下执行，丢弃改动并退出（谨慎）。",
        command: ":q!",
        tags: ["linux", "debian", "centos", "macos", "vim", "强制退出", "不保存", "谨慎操作"]
      },
      {
        category: "常用工具",
        name: "VIM 搜索关键字",
        desc: "在 Vim 中执行，向下搜索关键字。",
        command: "/keyword",
        tags: ["linux", "debian", "centos", "macos", "vim", "搜索", "关键字", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 全文替换",
        desc: "在 Vim 中执行，替换全文件中所有匹配内容。",
        command: ":%s/old/new/g",
        tags: ["linux", "debian", "centos", "macos", "vim", "替换", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 显示行号",
        desc: "在 Vim 中执行，开启行号显示便于定位。",
        command: ":set number",
        tags: ["linux", "debian", "centos", "macos", "vim", "行号", "set number", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 跳到首行/末行",
        desc: "在 Vim 普通模式下执行，快速跳转到文件开头或结尾。",
        command: "gg    # 跳到首行\nG     # 跳到末行",
        tags: ["linux", "debian", "centos", "macos", "vim", "跳转", "首行", "末行"]
      },
      {
        category: "常用工具",
        name: "VIM 删除当前行",
        desc: "在 Vim 普通模式下执行，删除光标所在整行。",
        command: "dd",
        tags: ["linux", "debian", "centos", "macos", "vim", "删除行", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 撤销与重做",
        desc: "在 Vim 普通模式下执行，撤销上一步操作或重做。",
        command: "u         # 撤销\nCtrl+r    # 重做",
        tags: ["linux", "debian", "centos", "macos", "vim", "撤销", "重做", "快捷键"]
      },
      {
        category: "常用工具",
        name: "VIM 复制当前行",
        desc: "在 Vim 普通模式下执行，复制光标所在整行到寄存器。",
        command: "yy",
        tags: ["linux", "debian", "centos", "macos", "vim", "复制", "yank", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 可视模式复制",
        desc: "在 Vim 中执行，进入可视模式选择文本后复制。",
        command: "v         # 进入可视模式\nh/j/k/l   # 选择文本\ny         # 复制所选内容",
        tags: ["linux", "debian", "centos", "macos", "vim", "复制", "可视模式", "选择文本"]
      },
      {
        category: "常用工具",
        name: "VIM 在下方粘贴",
        desc: "在 Vim 普通模式下执行，将复制内容粘贴到当前光标后或下一行。",
        command: "p",
        tags: ["linux", "debian", "centos", "macos", "vim", "粘贴", "paste", "编辑器"]
      },
      {
        category: "常用工具",
        name: "VIM 在上方粘贴",
        desc: "在 Vim 普通模式下执行，将复制内容粘贴到当前光标前或上一行。",
        command: "P",
        tags: ["linux", "debian", "centos", "macos", "vim", "粘贴", "上方粘贴", "编辑器"]
      },
      {
        category: "常用工具",
        name: "PM2 启动应用",
        desc: "把 Node 应用交给 PM2 守护进程管理。",
        command: "pm2 start app.js --name myapp",
        tags: ["pm2", "node", "服务", "启动", "进程管理"]
      },
      {
        category: "常用工具",
        name: "PM2 查看进程",
        desc: "查看 PM2 管理的应用列表和状态。",
        command: "pm2 list",
        tags: ["pm2", "node", "服务", "进程", "状态"]
      },
      {
        category: "常用工具",
        name: "PM2 查看日志",
        desc: "实时查看某个应用日志。",
        command: "pm2 logs myapp",
        tags: ["pm2", "node", "日志", "服务", "排查"]
      },
      {
        category: "常用工具",
        name: "PM2 重启应用",
        desc: "重启 PM2 中的目标应用。",
        command: "pm2 restart myapp",
        tags: ["pm2", "node", "服务", "重启", "部署"]
      },
      {
        category: "常用工具",
        name: "列出目录文件",
        desc: "显示当前目录文件（含权限和隐藏文件）。",
        command: "ls -al",
        tags: ["linux", "debian", "centos", "macos", "ls", "目录", "文件列表"]
      },
      {
        category: "常用工具",
        name: "显示当前路径",
        desc: "输出当前工作目录绝对路径。",
        command: "pwd",
        tags: ["linux", "debian", "centos", "macos", "pwd", "路径", "目录"]
      },
      {
        category: "常用工具",
        name: "创建目录",
        desc: "递归创建目录，不存在的父目录也会创建。",
        command: "mkdir -p /path/to/new-dir",
        tags: ["linux", "debian", "centos", "macos", "mkdir", "目录", "创建"]
      },
      {
        category: "常用工具",
        name: "复制文件或目录",
        desc: "递归复制目录，保留结构。",
        command: "cp -r source_dir target_dir",
        tags: ["linux", "debian", "centos", "macos", "cp", "复制", "目录"]
      },
      {
        category: "常用工具",
        name: "移动或重命名",
        desc: "移动文件，或在同目录下改名。",
        command: "mv old_name new_name",
        tags: ["linux", "debian", "centos", "macos", "mv", "移动", "重命名"]
      },
      {
        category: "常用工具",
        name: "创建空文件",
        desc: "创建新文件或更新文件时间戳。",
        command: "touch new_file.txt",
        tags: ["linux", "debian", "centos", "macos", "touch", "文件", "创建"]
      },
      {
        category: "常用工具",
        name: "删除文件（rm）",
        desc: "删除单个文件（可加 -i 交互确认）。",
        command: "rm -i file.txt",
        tags: ["linux", "debian", "centos", "macos", "rm", "删除文件", "文件操作", "谨慎操作"]
      },
      {
        category: "常用工具",
        name: "递归删除目录（rm -r）",
        desc: "递归删除目录及其内容。",
        command: "rm -r /path/to/dir",
        tags: ["linux", "debian", "centos", "macos", "rm", "删除目录", "递归", "文件操作", "谨慎操作"]
      },
      {
        category: "常用工具",
        name: "强制删除目录（rm -rf）",
        desc: "不提示直接删除，风险高，执行前务必确认路径。",
        command: "rm -rf /path/to/dir",
        tags: ["linux", "debian", "centos", "macos", "rm", "rm -rf", "强制删除", "高风险", "谨慎操作"]
      },
      {
        category: "常用工具",
        name: "移到回收站（trash）",
        desc: "优先使用回收站删除，避免误删后无法恢复。",
        command: "trash file.txt    # 需先安装 trash-cli\n# macOS 可用\nmv file.txt ~/.Trash/",
        tags: ["linux", "debian", "centos", "macos", "trash", "回收站", "删除文件", "安全删除"]
      },
      {
        category: "常用工具",
        name: "分页查看文件",
        desc: "适合查看大文件，支持上下翻页。",
        command: "less /path/to/file",
        tags: ["linux", "debian", "centos", "macos", "less", "查看文件", "分页"]
      },
      {
        category: "常用工具",
        name: "查看文件前几行",
        desc: "快速看文件开头内容。",
        command: "head -n 50 /path/to/file",
        tags: ["linux", "debian", "centos", "macos", "head", "查看文件", "日志"]
      },
      {
        category: "常用工具",
        name: "按名称查命令路径",
        desc: "查某个命令实际执行路径。",
        command: "which nginx",
        tags: ["linux", "debian", "centos", "macos", "which", "命令路径", "排查"]
      },
      {
        category: "常用工具",
        name: "查看命令完整位置",
        desc: "显示可执行路径和别名信息。",
        command: "type -a python3",
        tags: ["linux", "debian", "centos", "macos", "type", "命令路径", "别名"]
      },
      {
        category: "常用工具",
        name: "重新加载 shell 配置（source）",
        desc: "修改配置文件后立即生效（bash/zsh）。",
        command: "source ~/.zshrc    # bash 可用 source ~/.bashrc",
        tags: ["linux", "debian", "centos", "macos", "source", "shell", "环境变量", "配置生效"]
      },
      {
        category: "常用工具",
        name: "测试 TCP 端口连通（telnet）",
        desc: "快速验证目标主机端口是否可连接。",
        command: "telnet 127.0.0.1 6379",
        tags: ["linux", "debian", "centos", "macos", "telnet", "网络", "端口连通", "排查"]
      },
      {
        category: "常用工具",
        name: "查看当前登录用户（whoami）",
        desc: "输出当前 shell 会话的用户名。",
        command: "whoami",
        tags: ["linux", "debian", "centos", "macos", "whoami", "用户", "身份", "系统信息"]
      },
      {
        category: "常用工具",
        name: "查找命令二进制与手册位置（whereis）",
        desc: "查看命令的二进制路径、源码路径和 man 路径。",
        command: "whereis nginx",
        tags: ["linux", "debian", "centos", "macos", "whereis", "命令路径", "man", "排查"]
      },
      {
        category: "常用工具",
        name: "查看命令所有匹配路径（which -a）",
        desc: "显示 PATH 中所有同名可执行文件位置。",
        command: "which -a python3",
        tags: ["linux", "debian", "centos", "macos", "which", "路径查找", "命令路径", "排查"]
      },
      {
        category: "常用工具",
        name: "显示物理路径（pwd -P）",
        desc: "输出解析软链接后的真实目录路径。",
        command: "pwd -P",
        tags: ["linux", "debian", "centos", "macos", "pwd", "路径", "软链接", "目录"]
      },
      {
        category: "常用工具",
        name: "NVM 安装并切换 Node 版本",
        desc: "安装指定 Node 版本并切换到该版本。",
        command: "nvm install 20\nnvm use 20",
        tags: ["nvm", "node", "版本管理", "安装", "切换版本"]
      },
      {
        category: "常用工具",
        name: "NVM 查看已安装版本",
        desc: "列出本机已安装的 Node 版本。",
        command: "nvm ls",
        tags: ["nvm", "node", "版本管理", "列表", "排查"]
      },
      {
        category: "常用工具",
        name: "jenv 初始化到 shell",
        desc: "初始化 jenv 并立即在当前会话生效。",
        command: "echo 'export PATH=\"$HOME/.jenv/bin:$PATH\"' >> ~/.zshrc\necho 'eval \"$(jenv init -)\"' >> ~/.zshrc\nsource ~/.zshrc",
        tags: ["jenv", "java", "版本管理", "shell", "初始化"]
      },
      {
        category: "常用工具",
        name: "jenv 添加本机 JDK",
        desc: "把指定 JDK 路径加入 jenv 管理。",
        command: "jenv add /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home",
        tags: ["jenv", "java", "jdk", "版本管理", "添加版本"]
      },
      {
        category: "常用工具",
        name: "jenv 设置全局 Java 版本",
        desc: "设置默认 Java 版本（影响全部目录）。",
        command: "jenv global 17",
        tags: ["jenv", "java", "jdk", "global", "版本切换"]
      },
      {
        category: "常用工具",
        name: "jenv 设置项目 Java 版本",
        desc: "在当前项目目录设置本地 Java 版本。",
        command: "jenv local 17",
        tags: ["jenv", "java", "jdk", "local", "项目配置"]
      },
      {
        category: "常用工具",
        name: "jenv 查看当前版本状态",
        desc: "查看当前生效 Java 版本和来源。",
        command: "jenv versions\njenv version",
        tags: ["jenv", "java", "版本管理", "状态检查", "排查"]
      },
      {
        category: "Linux 服务",
        name: "查看服务日志（systemd）",
        desc: "查看指定服务最新日志并持续跟踪。",
        command: "journalctl -u nginx -n 100 -f",
        tags: ["linux", "debian", "centos", "服务", "日志", "systemd", "排查"]
      },
      {
        category: "Linux 服务",
        name: "检查 Nginx 配置是否正确",
        desc: "在重载前先校验配置语法。",
        command: "sudo nginx -t",
        tags: ["linux", "debian", "centos", "nginx", "配置检查", "语法检查", "服务"]
      },
      {
        category: "Linux 服务",
        name: "平滑重载 Nginx",
        desc: "不中断连接重新加载配置。",
        command: "sudo systemctl reload nginx",
        tags: ["linux", "debian", "centos", "nginx", "reload", "重载配置", "服务"]
      },
      {
        category: "Docker",
        name: "查看容器资源占用",
        desc: "实时查看容器 CPU/内存等资源。",
        command: "docker stats",
        tags: ["docker", "监控", "资源", "容器", "排查"]
      },
      {
        category: "Docker",
        name: "查看容器详细信息",
        desc: "输出容器配置、网络、挂载等信息。",
        command: "docker inspect <container_name_or_id>",
        tags: ["docker", "inspect", "详情", "容器", "排查"]
      },
      {
        category: "Docker",
        name: "清理未使用资源",
        desc: "删除未使用的容器/网络/镜像缓存。",
        command: "docker system prune -f",
        tags: ["docker", "清理", "磁盘", "prune", "维护"]
      },
      {
        category: "Git",
        name: "临时保存改动",
        desc: "把当前改动暂存起来，稍后恢复。",
        command: "git stash push -m \"wip\"",
        tags: ["git", "stash", "暂存", "改动"]
      },
      {
        category: "Git",
        name: "恢复暂存改动",
        desc: "恢复最近一次 stash 到工作区。",
        command: "git stash pop",
        tags: ["git", "stash", "恢复", "改动"]
      },
      {
        category: "Git",
        name: "查看文件差异",
        desc: "查看未暂存改动的具体差异。",
        command: "git diff",
        tags: ["git", "diff", "差异", "改动"]
      },
      {
        category: "Git",
        name: "批量删除已合并本地分支（保留主分支）",
        desc: "清理已合并分支，自动排除当前分支与常见主分支。",
        command: "git branch --merged | grep -vE '^\\*|main$|master$|develop$|dev$' | xargs git branch -d",
        tags: ["git", "branch", "清理分支", "删除分支", "merged", "谨慎操作"]
      },
      {
        category: "常用工具",
        name: "SSH 远程登录",
        desc: "通过默认 22 端口登录远程主机。",
        command: "ssh user@server_ip",
        tags: ["ssh", "远程登录", "连接服务器", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "SSH 指定端口登录",
        desc: "当远程主机 SSH 端口不是 22 时使用。",
        command: "ssh -p 2222 user@server_ip",
        tags: ["ssh", "远程登录", "端口", "连接服务器", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "SSH 指定私钥登录",
        desc: "使用指定私钥文件进行认证。",
        command: "ssh -i ~/.ssh/id_rsa user@server_ip",
        tags: ["ssh", "私钥", "免密", "远程登录", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "生成 SSH 密钥",
        desc: "生成 ed25519 密钥对用于免密登录。",
        command: "ssh-keygen -t ed25519 -C \"your_email@example.com\"",
        tags: ["ssh", "密钥", "免密登录", "ssh-keygen", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "分发公钥到服务器",
        desc: "把本机公钥写入远程 authorized_keys。",
        command: "ssh-copy-id user@server_ip",
        tags: ["ssh", "公钥分发", "免密登录", "ssh-copy-id", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "SCP 上传文件",
        desc: "把本地文件上传到远程服务器。",
        command: "scp local_file user@server_ip:/remote/path/",
        tags: ["ssh", "scp", "上传", "文件传输", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "SCP 下载文件",
        desc: "把远程文件下载到本地。",
        command: "scp user@server_ip:/remote/file ./",
        tags: ["ssh", "scp", "下载", "文件传输", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "RSYNC 增量同步目录",
        desc: "适合大目录同步，支持增量和压缩。",
        command: "rsync -avz ./local_dir/ user@server_ip:/remote/dir/",
        tags: ["ssh", "rsync", "同步", "备份", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "SSH 本地端口转发",
        desc: "把远程服务映射到本地端口，常用于数据库访问。",
        command: "ssh -L 3307:127.0.0.1:3306 user@server_ip",
        tags: ["ssh", "隧道", "端口转发", "数据库", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "测试 SSH 连通",
        desc: "快速检查 SSH 服务是否可连接。",
        command: "ssh -v user@server_ip",
        tags: ["ssh", "诊断", "连通性", "调试", "linux", "debian", "macos"]
      },
      {
        category: "常用工具",
        name: "TMUX 新建会话",
        desc: "创建并进入一个新的 tmux 会话。",
        command: "tmux new -s work",
        tags: ["tmux", "会话", "新建", "终端复用", "linux", "debian", "centos", "macos"]
      },
      {
        category: "常用工具",
        name: "TMUX 查看会话列表",
        desc: "列出当前所有 tmux 会话。",
        command: "tmux ls",
        tags: ["tmux", "会话", "列表", "终端复用", "linux", "debian", "centos", "macos"]
      },
      {
        category: "常用工具",
        name: "TMUX 连接已有会话",
        desc: "附着到指定会话继续工作。",
        command: "tmux attach -t work",
        tags: ["tmux", "attach", "会话", "恢复会话", "linux", "debian", "centos", "macos"]
      },
      {
        category: "常用工具",
        name: "TMUX 分离当前会话",
        desc: "在 tmux 会话内按该快捷键，从会话退出但保持进程在后台运行。",
        command: "Ctrl+b d",
        tags: ["tmux", "分离", "detach", "后台运行", "快捷键", "linux", "debian", "centos", "macos"]
      },
      {
        category: "常用工具",
        name: "Homebrew 安装软件",
        desc: "使用 brew 安装软件包（macOS 常用）。",
        command: "brew install <formula>",
        tags: ["brew", "homebrew", "macos", "安装", "包管理", "依赖"]
      },
      {
        category: "常用工具",
        name: "Homebrew 搜索软件",
        desc: "搜索可安装的 formula 或 cask。",
        command: "brew search <keyword>",
        tags: ["brew", "homebrew", "macos", "搜索", "包管理"]
      },
      {
        category: "常用工具",
        name: "Homebrew 更新索引",
        desc: "更新 Homebrew 仓库索引。",
        command: "brew update",
        tags: ["brew", "homebrew", "macos", "更新", "包管理"]
      },
      {
        category: "常用工具",
        name: "Homebrew 升级已安装包",
        desc: "升级本机全部已安装 formula。",
        command: "brew upgrade",
        tags: ["brew", "homebrew", "macos", "升级", "包管理"]
      },
      {
        category: "常用工具",
        name: "Homebrew 查看已安装包",
        desc: "列出当前安装的软件包。",
        command: "brew list",
        tags: ["brew", "homebrew", "macos", "列表", "包管理"]
      },
      {
        category: "常用工具",
        name: "Homebrew 卸载软件",
        desc: "卸载已安装的软件包。",
        command: "brew uninstall <formula>",
        tags: ["brew", "homebrew", "macos", "卸载", "包管理"]
      },
      {
        category: "常用工具",
        name: "NPM 初始化项目",
        desc: "快速生成 package.json。",
        command: "npm init -y",
        tags: ["npm", "node", "初始化", "package.json", "依赖"]
      },
      {
        category: "常用工具",
        name: "NPM 安装依赖",
        desc: "安装生产依赖到项目。",
        command: "npm install <package_name>",
        tags: ["npm", "node", "安装依赖", "包管理", "依赖"]
      },
      {
        category: "常用工具",
        name: "NPM 安装开发依赖",
        desc: "安装开发环境依赖。",
        command: "npm install -D <package_name>",
        tags: ["npm", "node", "devDependencies", "安装依赖", "开发依赖"]
      },
      {
        category: "常用工具",
        name: "NPM 运行脚本",
        desc: "执行 package.json 中定义的脚本。",
        command: "npm run <script_name>",
        tags: ["npm", "node", "脚本", "run", "构建", "启动"]
      },
      {
        category: "常用工具",
        name: "NPM 更新依赖",
        desc: "更新项目中已安装依赖版本。",
        command: "npm update",
        tags: ["npm", "node", "更新依赖", "包管理", "依赖"]
      },
      {
        category: "常用工具",
        name: "NPM 卸载依赖",
        desc: "移除项目中的依赖包。",
        command: "npm uninstall <package_name>",
        tags: ["npm", "node", "卸载依赖", "包管理", "依赖"]
      },
      {
        category: "常用工具",
        name: "NPM 查看过期依赖",
        desc: "检查哪些依赖存在新版本。",
        command: "npm outdated",
        tags: ["npm", "node", "依赖检查", "过期", "包管理"]
      },
      {
        category: "常用工具",
        name: "PIP 安装 Python 包",
        desc: "为当前 Python 环境安装包。",
        command: "python3 -m pip install <package_name>",
        tags: ["pip", "python", "安装依赖", "包管理", "python3"]
      },
      {
        category: "常用工具",
        name: "PIP 从 requirements 安装依赖",
        desc: "根据 requirements.txt 批量安装依赖。",
        command: "python3 -m pip install -r requirements.txt",
        tags: ["pip", "python", "requirements", "安装依赖", "包管理"]
      },
      {
        category: "常用工具",
        name: "NPX 临时执行包",
        desc: "不全局安装，直接执行 npm 包命令。",
        command: "npx <package_command>",
        tags: ["npm", "npx", "node", "临时执行", "脚手架"]
      },
      {
        category: "常用工具",
        name: "Docker 通过 config.json 设置代理",
        desc: "在 Docker 客户端配置代理（按需替换端口）。",
        command: "mkdir -p ~/.docker && cat > ~/.docker/config.json <<'JSON'\n{\n  \"proxies\": {\n    \"default\": {\n      \"httpProxy\": \"http://127.0.0.1:7890\",\n      \"httpsProxy\": \"http://127.0.0.1:7890\",\n      \"noProxy\": \"localhost,127.0.0.1\"\n    }\n  }\n}\nJSON",
        tags: ["docker", "proxy", "代理", "config.json", "http_proxy", "https_proxy", "linux", "debian", "centos", "macos"]
      },
      {
        category: "常用工具",
        name: "NPM 设置 HTTP/HTTPS 代理",
        desc: "同时为 npm 设置 HTTP 和 HTTPS 代理地址。",
        command: "npm config set proxy http://127.0.0.1:7890\nnpm config set https-proxy http://127.0.0.1:7890",
        tags: ["npm", "node", "proxy", "代理", "http_proxy", "https_proxy", "包管理", "依赖"]
      },
      {
        category: "常用工具",
        name: "Windows CMD 设置代理",
        desc: "当前 CMD 会话设置 HTTP/HTTPS 代理。",
        command: "set http_proxy=http://127.0.0.1:7890\nset https_proxy=http://127.0.0.1:7890",
        tags: ["windows", "cmd", "proxy", "代理", "http_proxy", "https_proxy"]
      },
      {
        category: "常用工具",
        name: "Linux/macOS 设置代理环境变量",
        desc: "适用于 Linux、Debian、CentOS、macOS 当前 shell 会话。",
        command: "export http_proxy=http://127.0.0.1:7890\nexport https_proxy=http://127.0.0.1:7890",
        tags: ["linux", "debian", "centos", "macos", "proxy", "代理", "http_proxy", "https_proxy", "shell"]
      },
      {
        category: "常用工具",
        name: "取消代理环境变量",
        desc: "取消当前 shell 的代理设置。",
        command: "unset http_proxy https_proxy",
        tags: ["linux", "debian", "centos", "macos", "proxy", "代理", "unset", "shell"]
      },
      {
        category: "Linux 服务",
        name: "开机自启并立即启动服务",
        desc: "设置服务开机自启，并立刻启动。",
        command: "sudo systemctl enable --now nginx",
        tags: ["linux", "debian", "centos", "服务", "systemctl", "开机自启", "启动"]
      },
      {
        category: "Linux 服务",
        name: "重载 systemd 配置",
        desc: "修改 service 文件后重新加载 systemd。",
        command: "sudo systemctl daemon-reload",
        tags: ["linux", "debian", "centos", "服务", "systemctl", "daemon-reload", "配置更新"]
      },
      {
        category: "Linux 服务",
        name: "列出运行中的服务",
        desc: "查看当前运行状态的 systemd 服务。",
        command: "systemctl list-units --type=service --state=running",
        tags: ["linux", "debian", "centos", "服务", "systemctl", "状态", "排查"]
      },
      {
        category: "Linux 网络",
        name: "查询 DNS 解析记录（dig）",
        desc: "快速查看域名解析到的 IP。",
        command: "dig +short example.com",
        tags: ["linux", "debian", "centos", "macos", "dns", "dig", "网络诊断"]
      },
      {
        category: "Linux 网络",
        name: "查询 DNS 解析记录（nslookup）",
        desc: "使用 nslookup 查询域名解析结果。",
        command: "nslookup example.com",
        tags: ["linux", "debian", "centos", "macos", "dns", "nslookup", "网络诊断"]
      },
      {
        category: "Linux 网络",
        name: "追踪网络路由",
        desc: "查看到目标主机的网络路径。",
        command: "traceroute example.com",
        tags: ["linux", "debian", "centos", "macos", "路由", "traceroute", "网络诊断"]
      },
      {
        category: "Linux 网络",
        name: "测试端口连通性",
        desc: "检查目标主机端口是否可访问。",
        command: "nc -zv 127.0.0.1 3306",
        tags: ["linux", "debian", "centos", "macos", "端口", "连通性", "nc", "网络诊断"]
      },
      {
        category: "Linux 网络",
        name: "查看 HTTP 响应头",
        desc: "仅请求并显示响应头信息。",
        command: "curl -I https://example.com",
        tags: ["linux", "debian", "centos", "macos", "curl", "http", "响应头", "网络诊断"]
      },
      {
        category: "Linux 网络",
        name: "查看路由表",
        desc: "查看本机网络路由与默认网关。",
        command: "ip route",
        tags: ["linux", "debian", "centos", "路由", "网关", "网络", "排查"]
      },
      {
        category: "Docker",
        name: "查看 Docker 网络列表",
        desc: "列出当前主机上的 Docker 网络。",
        command: "docker network ls",
        tags: ["docker", "network", "网络", "排查", "列表"]
      },
      {
        category: "Docker",
        name: "查看 Docker 数据卷列表",
        desc: "列出当前主机上的 Docker 卷。",
        command: "docker volume ls",
        tags: ["docker", "volume", "数据卷", "存储", "列表"]
      },
      {
        category: "Docker Compose",
        name: "查看 compose 服务状态",
        desc: "查看 compose 项目下各服务运行状态。",
        command: "docker compose ps",
        tags: ["docker", "compose", "ps", "状态", "服务"]
      },
      {
        category: "Docker Compose",
        name: "查看 compose 服务日志",
        desc: "持续跟踪指定服务日志输出。",
        command: "docker compose logs -f <service_name>",
        tags: ["docker", "compose", "日志", "排查", "服务"]
      },
      {
        category: "Docker Compose",
        name: "构建并后台启动 compose 服务",
        desc: "重新构建镜像后启动服务。",
        command: "docker compose up -d --build",
        tags: ["docker", "compose", "build", "启动", "部署"]
      },
      {
        category: "Docker Compose",
        name: "停止并删除 compose 资源（含卷）",
        desc: "停止服务并删除容器、网络和匿名卷。",
        command: "docker compose down -v",
        tags: ["docker", "compose", "down", "清理", "volume"]
      },
      {
        category: "Docker",
        name: "查看本地镜像列表",
        desc: "列出本地所有镜像及标签。",
        command: "docker images",
        tags: ["docker", "image", "images", "镜像", "列表"]
      },
      {
        category: "Docker",
        name: "拉取镜像",
        desc: "从镜像仓库拉取指定镜像版本。",
        command: "docker pull nginx:latest",
        tags: ["docker", "pull", "镜像", "下载", "仓库"]
      },
      {
        category: "Docker",
        name: "给镜像打标签",
        desc: "为已有镜像添加新标签。",
        command: "docker tag myapp:latest registry.example.com/myapp:1.0.0",
        tags: ["docker", "tag", "镜像", "版本", "发布"]
      },
      {
        category: "Docker",
        name: "推送镜像到仓库",
        desc: "将本地镜像推送到远程仓库。",
        command: "docker push registry.example.com/myapp:1.0.0",
        tags: ["docker", "push", "镜像", "仓库", "发布"]
      },
      {
        category: "Docker",
        name: "查看 Docker 网络详情",
        desc: "检查网络内连接的容器和网段信息。",
        command: "docker network inspect bridge",
        tags: ["docker", "network", "inspect", "网络排查", "容器"]
      },
      {
        category: "Docker",
        name: "查看 Docker 数据卷详情",
        desc: "查看数据卷挂载路径和元数据。",
        command: "docker volume inspect <volume_name>",
        tags: ["docker", "volume", "inspect", "数据卷", "排查"]
      },
      {
        category: "Docker",
        name: "清理悬空镜像",
        desc: "删除未被引用的 dangling 镜像层。",
        command: "docker image prune -f",
        tags: ["docker", "image", "prune", "清理", "磁盘"]
      },
      {
        category: "Docker Compose",
        name: "在 compose 服务内执行命令",
        desc: "进入指定服务容器执行交互命令。",
        command: "docker compose exec <service_name> sh",
        tags: ["docker", "compose", "exec", "调试", "服务"]
      },
      {
        category: "Docker Compose",
        name: "查看 compose 最终配置",
        desc: "展开变量与合并结果，检查配置是否符合预期。",
        command: "docker compose config",
        tags: ["docker", "compose", "config", "配置检查", "排查"]
      },
      {
        category: "Docker Compose",
        name: "拉取 compose 依赖镜像",
        desc: "提前拉取 docker-compose.yml 中定义的镜像。",
        command: "docker compose pull",
        tags: ["docker", "compose", "pull", "镜像", "部署准备"]
      },
      {
        category: "Docker Compose",
        name: "重启 compose 服务",
        desc: "重启全部服务或指定服务。",
        command: "docker compose restart\n# 或\ndocker compose restart <service_name>",
        tags: ["docker", "compose", "restart", "服务", "重启"]
      },
      {
        category: "Docker Compose",
        name: "只重建单个服务并启动",
        desc: "变更某个服务后仅重建该服务，避免全量重启。",
        command: "docker compose up -d --build <service_name>",
        tags: ["docker", "compose", "build", "服务", "部署"]
      },
      {
        category: "Git",
        name: "获取并清理远程分支引用",
        desc: "抓取所有远程更新并删除失效引用。",
        command: "git fetch --all --prune",
        tags: ["git", "fetch", "远程分支", "同步", "清理"]
      },
      {
        category: "Git",
        name: "查看远程仓库地址",
        desc: "检查当前仓库关联的远程地址。",
        command: "git remote -v",
        tags: ["git", "remote", "origin", "仓库地址", "排查"]
      },
      {
        category: "Git",
        name: "交互式整理最近提交",
        desc: "对最近提交进行压缩、改序或修改信息。",
        command: "git rebase -i HEAD~3",
        tags: ["git", "rebase", "提交整理", "历史", "高级"]
      },
      {
        category: "Git",
        name: "挑选提交到当前分支",
        desc: "将指定提交拣选到当前分支。",
        command: "git cherry-pick <commit_id>",
        tags: ["git", "cherry-pick", "拣选提交", "分支", "合并"]
      },
      {
        category: "Git",
        name: "生成反向提交撤销改动",
        desc: "通过新提交撤销目标提交，不改写历史。",
        command: "git revert <commit_id>",
        tags: ["git", "revert", "撤销提交", "安全回滚", "历史保留"]
      },
      {
        category: "Git",
        name: "软回退到上一个提交",
        desc: "回退提交但保留改动在暂存区。",
        command: "git reset --soft HEAD~1",
        tags: ["git", "reset", "soft", "回退", "暂存区"]
      },
      {
        category: "Git",
        name: "查看代码行最后修改者",
        desc: "定位某文件每一行最后的提交来源。",
        command: "git blame <file>",
        tags: ["git", "blame", "追踪修改", "排查", "历史"]
      },
      {
        category: "Kubernetes",
        name: "查看服务列表",
        desc: "查看当前命名空间的 Service 资源。",
        command: "kubectl get svc",
        tags: ["k8s", "kubernetes", "service", "svc", "查看"]
      },
      {
        category: "Kubernetes",
        name: "按时间查看集群事件",
        desc: "按时间排序查看最近事件，便于排障。",
        command: "kubectl get events --sort-by=.lastTimestamp",
        tags: ["k8s", "kubernetes", "events", "排查", "故障定位"]
      },
      {
        category: "Kubernetes",
        name: "本地转发到集群服务",
        desc: "把本地端口转发到集群内 Service。",
        command: "kubectl port-forward svc/<service_name> 8080:80",
        tags: ["k8s", "kubernetes", "port-forward", "调试", "服务"]
      },
      {
        category: "Kubernetes",
        name: "应用资源清单",
        desc: "根据 YAML 清单创建或更新资源。",
        command: "kubectl apply -f k8s.yaml",
        tags: ["k8s", "kubernetes", "apply", "部署", "yaml"]
      },
      {
        category: "Kubernetes",
        name: "查看 Deployment 发布状态",
        desc: "跟踪 Deployment 滚动发布进度。",
        command: "kubectl rollout status deploy/<deploy_name>",
        tags: ["k8s", "kubernetes", "rollout", "deployment", "发布"]
      },
      {
        category: "数据库",
        name: "MySQL 备份数据库",
        desc: "导出指定数据库到 SQL 文件。",
        command: "mysqldump -h 127.0.0.1 -P 3306 -u root -p app_db > app_db.sql",
        tags: ["mysql", "mysqldump", "备份", "导出", "数据库"]
      },
      {
        category: "数据库",
        name: "PostgreSQL 备份数据库",
        desc: "导出指定 PostgreSQL 数据库。",
        command: "pg_dump -h 127.0.0.1 -p 5432 -U postgres app_db > app_db.sql",
        tags: ["postgresql", "pg_dump", "备份", "导出", "数据库"]
      },
      {
        category: "常用工具",
        name: "NPM 按锁文件安装依赖",
        desc: "严格按 lock 文件安装，常用于 CI 环境。",
        command: "npm ci",
        tags: ["npm", "node", "ci", "依赖安装", "构建"]
      },
      {
        category: "常用工具",
        name: "创建 Python 虚拟环境",
        desc: "在当前目录创建独立 Python 环境。",
        command: "python3 -m venv .venv",
        tags: ["python", "venv", "虚拟环境", "环境隔离", "python3"]
      },
      {
        category: "常用工具",
        name: "查看过期 Python 包",
        desc: "列出当前环境可升级的 Python 依赖。",
        command: "python3 -m pip list --outdated",
        tags: ["pip", "python", "依赖检查", "过期", "包管理"]
      },
      {
        category: "常用工具",
        name: "查看 Homebrew 后台服务",
        desc: "查看通过 brew 管理的服务状态。",
        command: "brew services list",
        tags: ["homebrew", "brew", "services", "macos", "服务管理"]
      }
    ];
