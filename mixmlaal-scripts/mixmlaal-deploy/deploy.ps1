#!/usr/bin/env pwsh
# ============================================
# MIXMLAAL 部署脚本
# 版本: 0.0.0.4
# 说明: 用于生产环境的自动化部署
# ============================================

param(
    [switch]$Development,
    [switch]$Production,
    [switch]$WithMonitoring,
    [switch]$SkipBuild,
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
$DEPLOY_TIME = Get-Date -Format "yyyyMMdd_HHmmss"
$LOG_FILE = "$PROJECT_ROOT\logs\deploy_$DEPLOY_TIME.log"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage -ErrorAction SilentlyContinue
}

function Show-Help {
    Write-Host @"
MIXMLAAL 部署脚本

用法: .\deploy.ps1 [选项]

选项:
  -Development    部署到开发环境
  -Production     部署到生产环境
  -WithMonitoring 启用监控组件
  -SkipBuild      跳过构建步骤
  -Help           显示此帮助信息

示例:
  .\deploy.ps1 -Production
  .\deploy.ps1 -Development -WithMonitoring
  .\deploy.ps1 -Production -SkipBuild

"@
}

if ($Help) {
    Show-Help
    exit 0
}

Write-Log "============================================"
Write-Log "MIXMLAAL 部署开始"
Write-Log "时间: $DEPLOY_TIME"
Write-Log "============================================"

$ENVIRONMENT = if ($Production) { "production" } elseif ($Development) { "development" } else { "production" }
Write-Log "部署环境: $ENVIRONMENT"

if (-not (Test-Path "$PROJECT_ROOT\logs")) {
    New-Item -ItemType Directory -Path "$PROJECT_ROOT\logs" -Force | Out-Null
}

Set-Location $PROJECT_ROOT

Write-Log "检查 Docker 环境..."
if (-not (docker ps 2>$null)) {
    Write-Log "Docker 未运行，正在启动..." "WARN"
    Start-Process "dockerd.exe" -WindowStyle Hidden
    Start-Sleep -Seconds 10
}

Write-Log "检查 Docker Compose..."
if (-not (docker-compose --version 2>$null)) {
    Write-Log "Docker Compose 未安装" "ERROR"
    exit 1
}

if (-not $SkipBuild) {
    Write-Log "开始构建项目..."

    Write-Log "安装依赖..."
    npm install 2>&1 | Out-Null

    Write-Log "构建 API 服务..."
    npm run build:api 2>&1 | Out-Null

    Write-Log "构建前端应用..."
    npm run build:frontend 2>&1 | Out-Null

    Write-Log "构建管理后台..."
    npm run build:admin 2>&1 | Out-Null

    Write-Log "项目构建完成"
} else {
    Write-Log "跳过构建步骤" "WARN"
}

Write-Log "停止现有容器..."
docker-compose down 2>&1 | Out-Null

Write-Log "拉取最新基础镜像..."
docker-compose pull 2>&1 | Out-Null

Write-Log "启动基础设施服务..."
docker-compose up -d consul nacos zookeeper kafka redis mysql mongodb 2>&1 | Out-Null

Write-Log "等待基础设施服务就绪..."
Start-Sleep -Seconds 30

Write-Log "检查基础设施服务状态..."
$services = @("consul", "nacos", "zookeeper", "kafka", "redis", "mysql", "mongodb")
foreach ($service in $services) {
    $healthy = docker inspect --format='{{.State.Health.Status}}' "${service}_${service}" 2>$null
    if ($healthy -ne "healthy") {
        Write-Log "$service 服务未就绪，等待中..." "WARN"
        Start-Sleep -Seconds 10
    } else {
        Write-Log "$service 服务已就绪" "INFO"
    }
}

Write-Log "启动应用服务..."
docker-compose up -d user-service ride-service ecommerce-service payment-service 2>&1 | Out-Null
docker-compose up -d order-service social-service portal-service food-service 2>&1 | Out-Null
docker-compose up -d errand-service common-service transaction-service 2>&1 | Out-Null
docker-compose up -d api-gateway 2>&1 | Out-Null

if ($WithMonitoring) {
    Write-Log "启动监控组件..."
    docker-compose up -d prometheus grafana 2>&1 | Out-Null
}

Write-Log "等待所有服务启动..."
Start-Sleep -Seconds 20

Write-Log "检查所有服务状态..."
$allHealthy = $true
$runningContainers = docker-compose ps --format json | ConvertFrom-Json
foreach ($container in $runningContainers) {
    if ($container.State -ne "running") {
        Write-Log "服务 $($container.Service) 未运行: $($container.State)" "ERROR"
        $allHealthy = $false
    } else {
        Write-Log "服务 $($container.Service) 运行正常" "INFO"
    }
}

if ($allHealthy) {
    Write-Log "所有服务启动成功" "INFO"
} else {
    Write-Log "部分服务启动失败，请检查日志" "WARN"
}

Write-Log "============================================"
Write-Log "MIXMLAAL 部署完成"
Write-Log "时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Log "============================================"

Write-Host ""
Write-Host "部署信息:" -ForegroundColor Cyan
Write-Host "  API Gateway: http://localhost:80" -ForegroundColor Green
Write-Host "  Consul:       http://localhost:8500" -ForegroundColor Green
Write-Host "  Nacos:        http://localhost:8848" -ForegroundColor Green
Write-Host "  Prometheus:   http://localhost:9090" -ForegroundColor $(if ($WithMonitoring) { "Green" } else { "DarkGray" })
Write-Host "  Grafana:      http://localhost:3000" -ForegroundColor $(if ($WithMonitoring) { "Green" } else { "DarkGray" })
Write-Host ""

if ($WithMonitoring) {
    Write-Host "监控凭据:" -ForegroundColor Cyan
    Write-Host "  用户名: admin" -ForegroundColor Green
    Write-Host "  密码:   admin123" -ForegroundColor Green
    Write-Host ""
}

Write-Host "查看服务日志: docker-compose logs -f [服务名]" -ForegroundColor Yellow
Write-Host "停止所有服务: docker-compose down" -ForegroundColor Yellow
Write-Host ""
