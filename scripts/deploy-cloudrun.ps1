param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId,

    [string]$Region = "asia-southeast2",
    [string]$Repository = "cetak-struk",
    [string]$ImageName = "app",
    [string]$ServiceName = "cetak-struk",
    [Parameter(Mandatory = $true)]
    [string]$AppUrl,
    [Parameter(Mandatory = $true)]
    [string]$CloudSqlConnection,
    [string]$DbConnection = "mysql",
    [string]$DbDatabase = "cetak_struk",
    [string]$DbUsername = "app_user",
    [string]$AppKeySecret = "laravel-app-key",
    [string]$DbPasswordSecret = "cetak-struk-db-password"
)

$ErrorActionPreference = "Stop"

Write-Host "Deploying $ServiceName to Cloud Run in $Region..." -ForegroundColor Cyan

gcloud config set project $ProjectId

gcloud builds submit `
    --config cloudbuild.yaml `
    --substitutions "_REGION=$Region,_REPOSITORY=$Repository,_IMAGE_NAME=$ImageName,_SERVICE_NAME=$ServiceName,_APP_URL=$AppUrl,_DB_CONNECTION=$DbConnection,_DB_DATABASE=$DbDatabase,_DB_USERNAME=$DbUsername,_CLOUD_SQL_CONNECTION=$CloudSqlConnection,_APP_KEY_SECRET=$AppKeySecret,_DB_PASSWORD_SECRET=$DbPasswordSecret"

Write-Host "Cloud Build submit complete." -ForegroundColor Green
