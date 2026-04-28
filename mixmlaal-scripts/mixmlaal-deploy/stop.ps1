#!/usr/bin/env pwsh
# ============================================
# MIXMLAAL 停止脚本
# 版本: 0.0.0.4
# 说明: 停止所有MIXMLAAL服务
# ============================================

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

function Write-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

Write-Status "============================================" "Yellow"
Write-Status "MIXMLAAL 服务停止中..." "Yellow"
Write-Status "============================================" "Yellow"

Set-Location $PROJECT_ROOT

Write-Status "停止所有服务..."
docker-compose stop

Write-Status ""
Write-Status "============================================" "Yellow"
Write-Status "MIXMLAAL 服务已停止" "Yellow"
Write-Status "============================================" "Yellow"
Write-Status ""
Write-Status "重新启动: .\start.ps1" "Cyan"
Write-Status "完全移除: docker-compose down" "Cyan"
Write-Status ""
