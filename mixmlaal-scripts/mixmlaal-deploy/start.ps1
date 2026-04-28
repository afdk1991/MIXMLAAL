#!/usr/bin/env pwsh
# ============================================
# MIXMLAAL 启动脚本
# 版本: 0.0.0.4
# 说明: 启动所有MIXMLAAL服务
# ============================================

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

function Write-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

Write-Status "============================================" "Cyan"
Write-Status "MIXMLAAL 服务启动中..." "Cyan"
Write-Status "============================================" "Cyan"

Set-Location $PROJECT_ROOT

Write-Status "检查 Docker 环境..."
if (-not (docker ps 2>$null)) {
    Write-Status "Docker 未运行，正在启动..." "Yellow"
    Start-Process "dockerd.exe" -WindowStyle Hidden
    Start-Sleep -Seconds 10
}

Write-Status "启动所有服务..."
docker-compose up -d

Write-Status "等待服务启动..."
Start-Sleep -Seconds 15

Write-Status "检查服务状态..."
docker-compose ps

Write-Status ""
Write-Status "============================================" "Cyan"
Write-Status "MIXMLAAL 服务已启动" "Cyan"
Write-Status "============================================" "Cyan"
Write-Status ""
Write-Status "服务访问地址:" "Cyan"
Write-Status "  API Gateway:  http://localhost:80" "Green"
Write-Status "  Consul:       http://localhost:8500" "Green"
Write-Status "  Nacos:        http://localhost:8848" "Green"
Write-Status "  Redis:        localhost:6379" "Green"
Write-Status "  MySQL:        localhost:3306" "Green"
Write-Status "  Kafka:        localhost:9092" "Green"
Write-Status ""
Write-Status "查看日志: docker-compose logs -f" "Yellow"
Write-Status "停止服务: .\stop.ps1" "Yellow"
Write-Status ""
