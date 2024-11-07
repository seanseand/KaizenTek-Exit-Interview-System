$projectPath = ".."

Write-Host "Checking MySQL server status..."
$mysqlStatus = Get-Service -Name "MySQL" -ErrorAction SilentlyContinue

if ($mysqlStatus.Status -ne 'Running') {
    Write-Host "MySQL server is not running. Starting MySQL server..."
    Start-Service -Name "MySQL"
} else {
    Write-Host "MySQL server is already running."
}

Set-Location $projectPath

Write-Host "Starting PHP built-in server..."
Start-Process "php" "-S localhost:8000" -NoNewWindow -Wait