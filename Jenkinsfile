// web-tools 的 Jenkins 流水线：静态页面 + 拨测后端
//
// 依赖共享库 lmb-shared-library 中的 NodeBackendBuild（通用 Node 后端方案）
// Job 名称需符合 {类型}_{项目名}_{环境} 规范，例如：Test_web-tools_test
//   → 项目名 web-tools，环境 test，分支默认取 Job 名后缀 test，可在构建参数 branch 覆盖
@Library('lmb-shared-library') _

def map = [:]

// ========== 代码来源：公开仓库，不需要凭据 ==========
map.put('gitLibUrl', 'https://github.com/selierlin/web-tools')
map.put('gitCredentialsId', '')
map.put('projectDir', '.')
map.put('defaultBranch', 'main')

// ========== 目标服务器：内网测试机，构建时可勾选/输入其他 IP ==========
map.put('buildServerIp', '192.168.1.8')

// ========== 静态页面：仓库根整体同步，排除后端与依赖 ==========
map.put('staticSrcDir', '.')
map.put('staticDestDir', '/opt/webapps/web-tools')
// server 必须排除，否则后端源码会被推到 nginx 根目录
// 部署脚本含服务器地址，同样不能出现在公开站点
map.put('staticExcludes', 'server,node_modules,.git,data,deploy,.idea,.qoder,.DS_Store,Jenkinsfile,deploy.sh,deploy-private.sh,deploy-server.sh')

// ========== 拨测后端（容器） ==========
map.put('dockerfilePath', 'server/Dockerfile')
map.put('dockerContext', 'server')
map.put('imageName', 'web-tools/boce')
map.put('dockerName', 'web-tools-boce')
map.put('serverPort', '8899')
// 以下两项在目标机上预置，不进仓库也不进镜像（含 BOCE_SECRET）
map.put('envFile', '/opt/webapps/web-tools-data/boce/.env')
map.put('volumePaths', '/opt/webapps/web-tools-data/boce:/data')
map.put('envVars', [BOCE_DATA_DIR: '/data', PORT: '8899'])
map.put('networkMode', 'host')
map.put('healthPath', '/api/health')

NodeBackendBuild(map)
