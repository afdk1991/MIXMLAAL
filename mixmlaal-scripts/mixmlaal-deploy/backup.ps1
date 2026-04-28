#!/usr/bin/env pwsh
# ============================================
# MIXMLAAL 备份脚本
# 版本: 0.0.0.4
# 说明: 备份MIXMLAAL数据
# ============================================

param(
    [string]$BackupDir = "$env:USERPROFILE\mixmlaal_backups",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
$BACKUP_TIME = Get-Date -Format "yyyyMMdd_HHmmss"

function Write-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

Write-Status "============================================" "Cyan"
Write-Status "MIXMLAAL 数据备份" "Cyan"
Write-Status "============================================" "Cyan"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$backupPath = Join-Path $BackupDir "mixmlaal_backup_$BACKUP_TIME"
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

Write-Status "备份目录: $backupPath"

Write-Status "备份数据库..."
docker exec mixmlaal_mysql_1 mysqldump -u root -p$env:MYSQL_ROOT_PASSWORD mixmlaal > "$backupPath\database.sql" 2>$null
Write-Status "数据库备份完成" "Green"

Write-Status "备份Redis数据..."
docker exec mixmlaal_redis_1 redis-cli SAVE
docker cp mixmlaal_redis_1:/data/dump.rdb "$backupPath\redis_data.rdb" 2>$null
Write-Status "Redis备份完成" "Green"

Write-Status "备份配置..."
Copy-Item "$PROJECT_ROOT\.env.production" "$backupPath\env_backup.txt" -ErrorAction SilentlyContinue
Copy-Item "$PROJECT_ROOT\docker-compose.yml" "$backupPath\docker-compose_backup.yml" -ErrorAction SilentlyContinue
Write-Status "配置备份完成" "Green"

Write-Status "压缩备份文件..."
Compress-Archive -Path "$backupPath" -DestinationPath "$backupPath.zip" -Force
Remove-Item -Path "$backupPath" -Recurse -Force
Write-Status "备份压缩完成" "Green"

Write-Status "清理过期备份..."
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "mixmlaal_backup_*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
Write-Status "过期备份清理完成" "Green"

Write-Status ""
Write-Status "============================================" "Cyan"
Write-Status "备份完成！" "Green"
Write-Status "备份位置: $backupPath.zip" "Cyan"
Write-Status "============================================" "Cyan"
Write-Status ""
