# MIXMLAAL Local Deployment Script

# Create Nginx config directory
New-Item -ItemType Directory -Path "C:\nginx\conf\conf.d" -Force

# Copy Nginx config file
Copy-Item "f:\MIXMLAAL\mixmlaal-deploy-nginx\mixmlaal-conf-d\laal.top.conf" "C:\nginx\conf\conf.d\laal.top.conf" -Force

# Start Redis service
Write-Host "Starting Redis service..."
& "C:\Program Files\Redis\redis-server.exe" --service-start 2>&1

# Start MySQL service
Write-Host "Starting MySQL service..."
& "C:\xampp\mysql_start.bat"

# Wait for services to start
Start-Sleep -Seconds 10

# Initialize database
Write-Host "Initializing database..."
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS mixmlaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'mixmlaal'@'localhost' IDENTIFIED BY 'mixmlaal123'; GRANT ALL PRIVILEGES ON mixmlaal.* TO 'mixmlaal'@'localhost'; FLUSH PRIVILEGES;"

# Start API service
Write-Host "Starting API service..."
Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-api-node" -WindowStyle Minimized

# Start frontend service
Write-Host "Starting frontend service..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-frontend-vue" -WindowStyle Minimized

# Start admin service
Write-Host "Starting admin service..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-admin-vue" -WindowStyle Minimized

# Start Nginx
Write-Host "Starting Nginx..."
& "C:\nginx\nginx.exe"

# Configure hosts
Write-Host "Configuring hosts file..."
$hostsContent = Get-Content "C:\Windows\System32\drivers\etc\hosts"
if (-not ($hostsContent -match "127.0.0.1 laal.top")) {
    Add-Content "C:\Windows\System32\drivers\etc\hosts" "127.0.0.1 laal.top"
}

Write-Host "Deployment completed!"
Write-Host "Access addresses:"
Write-Host "  Main site: http://laal.top/"
Write-Host "  API: http://laal.top/api/"
Write-Host "  Admin: http://laal.top/admin/"
