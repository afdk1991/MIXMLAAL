# Git Auto Sync Script
param(
    [string]$Message = "",
    [switch]$Auto = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

# Get script directory and change to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
if (Test-Path "$ProjectRoot\.git") {
    Set-Location $ProjectRoot
}

function Write-Log {
    param([string]$Msg, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Msg"
}

function Test-GitRepository {
    if (-not (Test-Path ".git")) {
        Write-Log "Not a git repository" "ERROR"
        exit 1
    }
}

function Get-RemoteName {
    $remote = git remote | Select-Object -First 1
    if ($remote) {
        return $remote
    }
    return "origin"
}

function Get-UncommittedChanges {
    $status = git status --porcelain
    return $status.Count -gt 0
}

function Get-RemoteChanges {
    param([string]$RemoteName)
    git fetch $RemoteName 2>$null
    $localCommit = git rev-parse HEAD
    $remoteCommit = git rev-parse "$RemoteName/main" 2>$null
    if ($remoteCommit) {
        return $localCommit -ne $remoteCommit
    }
    return $false
}

function Commit-Changes {
    param([string]$commitMessage)

    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Auto update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }

    $added = (git status --porcelain | Where-Object { $_.StartsWith("??") }).Count
    $modified = (git status --porcelain | Where-Object { $_.Trim().StartsWith("M") -and -not $_.StartsWith("M ") }).Count

    if ($added -gt 0) {
        Write-Log "New files: $added"
    }
    if ($modified -gt 0) {
        Write-Log "Modified files: $modified"
    }

    if ($added -eq 0 -and $modified -eq 0) {
        $staged = (git status --porcelain | Where-Object { $_.StartsWith("M ") -or $_.StartsWith("A ") }).Count
        if ($staged -eq 0) {
            Write-Log "No changes to commit" "INFO"
            return $false
        }
    }

    git add -A
    git commit -m $commitMessage
    Write-Log "Committed: $commitMessage" "SUCCESS"
    return $true
}

function Pull-Remote {
    param([string]$RemoteName)
    Write-Log "Pulling remote changes..."
    $result = git pull $RemoteName main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Pull failed: $result" "WARN"
        return $false
    }
    Write-Log "Pull completed" "SUCCESS"
    return $true
}

function Push-ToRemote {
    param([string]$RemoteName)
    Write-Log "Pushing to remote..."
    $result = git push $RemoteName main 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Push failed: $result" "ERROR"
        return $false
    }
    Write-Log "Push completed" "SUCCESS"
    return $true
}

function Show-Status {
    Write-Log "===== Git Status =====" "INFO"
    git status

    Write-Log "===== Unstaged Changes =====" "INFO"
    git diff --stat

    Write-Log "===== Staged Changes =====" "INFO"
    git diff --cached --stat

    Write-Log "===== Recent Commits (5) =====" "INFO"
    git log --oneline -5
}

function Auto-Sync {
    param([string]$RemoteName)
    Write-Log "===== Auto Sync Started =====" "INFO"

    Test-GitRepository

    if (Get-UncommittedChanges) {
        if (Commit-Changes -commitMessage "Auto update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')") {
            Start-Sleep -Seconds 1
        }
    } else {
        Write-Log "No uncommitted changes, skipping commit" "INFO"
    }

    if (Get-RemoteChanges -RemoteName $RemoteName) {
        Write-Log "Remote has updates, pulling..." "INFO"
        Pull-Remote -RemoteName $RemoteName
    }

    Push-ToRemote -RemoteName $RemoteName

    Write-Log "===== Auto Sync Completed =====" "SUCCESS"
}

# Main logic
Test-GitRepository
$remoteName = Get-RemoteName
Write-Log "Remote: $remoteName" "INFO"

if ($Auto) {
    Auto-Sync -RemoteName $remoteName
} else {
    Show-Status

    if (Get-UncommittedChanges) {
        Write-Log "Uncommitted changes detected" "WARN"
        if ($Force -or (Read-Host "Commit changes? (Y/N)") -eq "Y") {
            $msg = if ([string]::IsNullOrWhiteSpace($Message)) { "Auto update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" } else { $Message }
            Commit-Changes -commitMessage $msg
            Push-ToRemote -RemoteName $remoteName
        }
    } else {
        Write-Log "No uncommitted changes" "INFO"
        Push-ToRemote -RemoteName $remoteName
    }
}

Write-Log "Done" "INFO"