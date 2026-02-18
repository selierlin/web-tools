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
        name: "下载文件",
        desc: "从 URL 下载文件到当前目录。",
        command: "curl -LO https://example.com/file.tar.gz",
        tags: ["linux", "debian", "centos", "macos", "下载", "curl", "wget"]
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
        name: "PostgreSQL 登录",
        desc: "连接 PostgreSQL 数据库。",
        command: "psql -h 127.0.0.1 -p 5432 -U postgres -d mydb",
        tags: ["postgres", "postgresql", "数据库", "登录"]
      },
      {
        category: "数据库",
        name: "Redis CLI",
        desc: "连接 Redis 并执行命令。",
        command: "redis-cli -h 127.0.0.1 -p 6379",
        tags: ["redis", "数据库", "缓存", "登录"]
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
        category: "Linux 服务",
        name: "查看服务日志（systemd）",
        desc: "查看指定服务最新日志并持续跟踪。",
        command: "journalctl -u nginx -n 100 -f",
        tags: ["linux", "debian", "centos", "服务", "日志", "systemd", "排查"]
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
        tags: ["linux", "debian", "debain", "centos", "macos", "proxy", "代理", "http_proxy", "https_proxy", "shell"]
      },
      {
        category: "常用工具",
        name: "取消代理环境变量",
        desc: "取消当前 shell 的代理设置。",
        command: "unset http_proxy https_proxy",
        tags: ["linux", "debian", "centos", "macos", "proxy", "代理", "unset", "shell"]
      }
    ];
