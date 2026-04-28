# MIXMLAAL 一键部署脚本 (Windows PowerShell)
# 域名: laal.top

param(
    [string]$Domain = "laal.top"
)

$ErrorActionPreference = "Stop"

function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIXMLAAL 一键部署脚本" -ForegroundColor Cyan
Write-Host "  域名: $Domain" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host ""
Write-Host "� 检查环境..." -ForegroundColor Yellow

$dockerCmd = $null
if (Test-Command "docker") {
    $dockerCmd = "docker"
    Write-Host "✅ Docker 已安装" -ForegroundColor Green
} elseif (Test-Command "docker.exe") {
    $dockerCmd = "docker.exe"
    Write-Host "✅ Docker 已安装" -ForegroundColor Green
} else {
    Write-Host "❌ Docker 未安装或未在 PATH 中" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

$composeCmd = $null
if (Test-Command "docker-compose") {
    $composeCmd = "docker-compose"
    Write-Host "✅ docker-compose 已安装" -ForegroundColor Green
} elseif (& $dockerCmd compose version 2>$null) {
    $composeCmd = "docker compose"
    Write-Host "✅ docker compose (V2) 已安装" -ForegroundColor Green
} else {
    Write-Host "❌ Docker Compose 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "请确保 Docker Desktop 已更新到最新版本" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 步骤 1: 生成 Nginx 路由配置..." -ForegroundColor Yellow

if (Test-Command "node") {
    & node ./mixmlaal-scripts/generate-routes.js
    $NginxConf = "./mixmlaal-conf-d/laal.top.auto.conf"
    Write-Host "✅ 自动路由配置已生成" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node.js 未安装，使用默认配置" -ForegroundColor Yellow
    Write-Host "   如需自动路由，请先安装 Node.js" -ForegroundColor Yellow
    $NginxConf = "./mixmlaal-conf-d/laal.top.conf"
}

Write-Host ""
Write-Host "🔧 步骤 2: 创建 Docker 网络..." -ForegroundColor Yellow
$networkResult = & $dockerCmd network create mixmlaal-network 2>&1
if ($LASTEXITCODE -eq 0 -or $networkResult -match "already exists") {
    Write-Host "✅ 网络已就绪" -ForegroundColor Green
} else {
    Write-Host "❌ 网络创建失败: $networkResult" -ForegroundColor Red
}

Write-Host ""
Write-Host "📥 步骤 3: 拉取基础镜像..." -ForegroundColor Yellow
$images = @("nginx:alpine", "mysql:8", "redis:7-alpine")
foreach ($img in $images) {
    Write-Host "   拉取 $img..." -NoNewline
    $pullResult = & $dockerCmd pull $img 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ⚠️" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🚀 步骤 4: 检查 docker-compose.yml..." -ForegroundColor Yellow
if (-not (Test-Path "./docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml 文件不存在" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 配置文件存在" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 步骤 5: 启动服务..." -ForegroundColor Yellow
Write-Host "   这可能需要几分钟时间..." -ForegroundColor Gray

if ($composeCmd -eq "docker-compose") {
    $upResult = & docker-compose up -d --build 2>&1
} else {
    $upResult = & docker compose up -d --build 2>&1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 服务启动成功" -ForegroundColor Green
} else {
    Write-Host "❌ 服务启动失败" -ForegroundColor Red
    Write-Host $upResult -ForegroundColor Red
}

Write-Host ""
Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "🔍 检查服务状态..." -ForegroundColor Yellow
if ($composeCmd -eq "docker-compose") {
    docker-compose ps
} else {
    docker compose ps
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 访问地址:" -ForegroundColor White
Write-Host "   主站:      http://$Domain/" -ForegroundColor White
Write-Host "   API:       http://$Domain/api/" -ForegroundColor White
Write-Host "   管理后台:  http://$Domain/admin/" -ForegroundColor White
Write-Host "   司机端:    http://$Domain/driver/" -ForegroundColor White
Write-Host "   商户端:    http://$Domain/merchant/" -ForegroundColor White
Write-Host "   H5移动端:  http://$Domain/h5/" -ForegroundColor White
Write-Host "   健康检查:  http://$Domain/health" -ForegroundColor White
Write-Host ""
Write-Host "📝 常用命令:" -ForegroundColor White
Write-Host "   查看日志:  docker compose logs -f" -ForegroundColor White
Write-Host "   停止服务:  docker compose down" -ForegroundColor White
Write-Host "   重启服务:  docker compose restart" -ForegroundColor White
Write-Host "   重新构建:  docker compose up -d --build" -ForegroundColor White
Write-Host ""
