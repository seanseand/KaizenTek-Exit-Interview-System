$DB_NAME = "kaizentekmid"
$DB_USER = "root"
$DB_PASS = ""
$SQL_FILE = "../database/kaizentekmid.sql"

if (-Not (Test-Path $SQL_FILE)) {
    Write-Host "SQL file not found!"
    exit 1
}

Write-Host "Updating MySQL database..."
$command = "mysql -u $DB_USER -p$DB_PASS $DB_NAME < $SQL_FILE"
Invoke-Expression $command

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database updated successfully."
} else {
    Write-Host "Failed to update the database."
    exit 1
}