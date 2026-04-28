# MIXMLAAL Simplified Local Deployment

Write-Host "========================================"
Write-Host "  MIXMLAAL Local Deployment"
Write-Host "  Domain: laal.top"
Write-Host "========================================"

# Create project directories
New-Item -ItemType Directory -Path "f:\MIXMLAAL\mixmlaal-deploy-nginx\logs" -Force
New-Item -ItemType Directory -Path "f:\MIXMLAAL\mixmlaal-deploy-nginx\temp" -Force

# Configure hosts file
Write-Host "Configuring hosts file..."
try {
    $hostsContent = Get-Content "C:\Windows\System32\drivers\etc\hosts"
    if (-not ($hostsContent -match "127.0.0.1 laal.top")) {
        Add-Content "C:\Windows\System32\drivers\etc\hosts" "127.0.0.1 laal.top"
        Write-Host "  ✅ Hosts file updated"
    } else {
        Write-Host "  ⚠️ Hosts file already configured"
    }
} catch {
    Write-Host "  ⚠️ Cannot update hosts file (permission denied)"
    Write-Host "  Please manually add: 127.0.0.1 laal.top"
}

# Start API service
Write-Host "Starting API service..."
try {
    Start-Process -FilePath "node" -ArgumentList "src/index.js" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-api-node" -WindowStyle Minimized
    Write-Host "  ✅ API service started on port 8080"
} catch {
    Write-Host "  ⚠️ API service failed to start"
}

# Start frontend service
Write-Host "Starting frontend service..."
try {
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-frontend-vue" -WindowStyle Minimized
    Write-Host "  ✅ Frontend service started on port 3000"
} catch {
    Write-Host "  ⚠️ Frontend service failed to start"
}

# Start admin service
Write-Host "Starting admin service..."
try {
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-admin-vue" -WindowStyle Minimized
    Write-Host "  ✅ Admin service started on port 3001"
} catch {
    Write-Host "  ⚠️ Admin service failed to start"
}

# Start driver service
Write-Host "Starting driver service..."
try {
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-driver-vue" -WindowStyle Minimized
    Write-Host "  ✅ Driver service started on port 3003"
} catch {
    Write-Host "  ⚠️ Driver service failed to start"
}

# Start merchant service
Write-Host "Starting merchant service..."
try {
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-merchant-vue" -WindowStyle Minimized
    Write-Host "  ✅ Merchant service started on port 3004"
} catch {
    Write-Host "  ⚠️ Merchant service failed to start"
}

# Start H5 service
Write-Host "Starting H5 service..."
try {
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "f:\MIXMLAAL\mixmlaal-apps\mixmlaal-h5-vue" -WindowStyle Minimized
    Write-Host "  ✅ H5 service started on port 3005"
} catch {
    Write-Host "  ⚠️ H5 service failed to start"
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Deployment completed!"
Write-Host "========================================"
Write-Host ""
Write-Host "📍 Access addresses:"
Write-Host "   Main site: http://laal.top:3000/"
Write-Host "   API: http://laal.top:8080/"
Write-Host "   Admin: http://laal.top:3001/"
Write-Host "   Driver: http://laal.top:3003/"
Write-Host "   Merchant: http://laal.top:3004/"
Write-Host "   H5: http://laal.top:3005/"
Write-Host ""
Write-Host "📝 Notes:"
Write-Host "   - Make sure to run 'npm install' in each app directory first"
Write-Host "   - If services fail to start, check port availability"
Write-Host "   - For database, use MySQL Workbench or phpMyAdmin"
