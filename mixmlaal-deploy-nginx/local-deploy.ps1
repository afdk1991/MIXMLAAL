# MIXMLAAL 本地部署脚本

# 创建 Nginx 配置目录
New-Item -ItemType Directory -Path "C:\nginx\conf\conf.d" -Force

# 复制 Nginx 配置文件
Copy-Item "f:\MIXMLAAL\mixmlaal-deploy-nginx\mixmlaal-conf-d\laal.top.conf" "C:\nginx\conf\conf.d\laal.top.conf" -Force

# 启动 Redis 服务
Write-Host "启动 Redis 服务..."
& "C:\Program Files\Redis\redis-server.exe" --service-start 2>&1

# 启动 MySQL 服务
Write-Host "启动 MySQL 服务..."
& "C:\xampp\mysql_start.bat"

# 等待服务启动
Start-Sleep -Seconds 10

# 初始化数据库
Write-Host "初始化数据库..."
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS mixmlaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'mixmlaal'@'localhost' IDENTIFIED BY 'mixmlaal123'; GRANT ALL PRIVILEGES ON mixmlaal.* TO 'mixmlaal'@'localhost'; FLUSH PRIVILEGES;"

# 启动 API 服务
Write-Host "启动 API 服务..."
Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-api-node" -WindowStyle Minimized

# 启动前端服务
Write-Host "启动前端服务..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-frontend-vue" -WindowStyle Minimized

# 启动管理后台
Write-Host "启动管理后台..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-admin-vue" -WindowStyle Minimized

# 启动 Nginx
Write-Host "启动 Nginx..."
& "C:\nginx\nginx.exe"

# 配置 hosts
Write-Host "配置 hosts 文件..."
$hostsContent = Get-Content "C:\Windows\System32\drivers\etc\hosts"
if (-not ($hostsContent -match "127.0.0.1 laal.top")) {
    Add-Content "C:\Windows\System32\drivers\etc\hosts" "127.0.0.1 laal.top"
}

Write-Host "部署完成！"
Write-Host "访问地址:"
Write-Host "  主站: http://laal.top/"
Write-Host "  API: http://laal.top/api/"
Write-Host "  管理后台: http://laal.top/admin/"
