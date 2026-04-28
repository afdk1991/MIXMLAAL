#!/usr/bin/env pwsh
# ============================================
# MIXMLAAL 健康检查脚本
# 版本: 0.0.0.4
# 说明: 检查所有MIXMLAAL服务的健康状态
# ============================================

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" -ForegroundColor $Color
}

Write-Status "============================================" "Cyan"
Write-Status "MIXMLAAL 健康检查" "Cyan"
Write-Status "============================================" "Cyan"
Write-Status ""

$allHealthy = $true

$services = @(
    @{Name="API Gateway"; Url="http://localhost:80/api/v1/health"; Port=80},
    @{Name="Consul"; Url="http://localhost:8500"; Port=8500},
    @{Name="Nacos"; Url="http://localhost:8848/nacos/v1/console/health"; Port=8848},
    @{Name="Redis"; Url=""; Port=6379},
    @{Name="MySQL"; Url=""; Port=3306},
    @{Name="Kafka"; Url=""; Port=9092},
    @{Name="Prometheus"; Url="http://localhost:9090/-/healthy"; Port=9090},
    @{Name="Grafana"; Url="http://localhost:3000/api/health"; Port=3000}
)

foreach ($service in $services) {
    Write-Status "检查 $($service.Name)..." -NoNewline

    if ($service.Url) {
        try {
            $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Status " [OK]" "Green"
            } else {
                Write-Status " [WARN] Status: $($response.StatusCode)" "Yellow"
                $allHealthy = $false
            }
        } catch {
            Write-Status " [ERROR] $($_.Exception.Message)" "Red"
            $allHealthy = $false
        }
    } else {
        try {
            $tcpConnection = New-Object System.Net.Sockets.TcpClient
            $tcpConnection.Connect("localhost", $service.Port)
            $tcpConnection.Close()
            Write-Status " [OK]" "Green"
        } catch {
            Write-Status " [ERROR] 无法连接到端口 $($service.Port)" "Red"
            $allHealthy = $false
        }
    }
}

Write-Status ""
Write-Status "============================================" "Cyan"

if ($allHealthy) {
    Write-Status "所有服务健康" "Green"
} else {
    Write-Status "部分服务不健康，请检查" "Red"
}

Write-Status "============================================" "Cyan"
Write-Status ""

exit $(if ($allHealthy) { 0 } else { 1 })
