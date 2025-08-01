# Remove duplicate JavaScript files where TypeScript equivalents exist
Write-Host "Removing duplicate JavaScript files..." -ForegroundColor Cyan

$projectRoot = "c:\Users\mwang\Desktop\Brenda-Cereals-1"
Set-Location $projectRoot

# List of duplicate JS files to delete (where TS equivalents exist)
$duplicates = @(
    "apps\web\src\middleware.js",
    "packages\types\index.js",
    "packages\utils\index.js", 
    "packages\utils\currency.js",
    "packages\utils\date.js",
    "packages\utils\location.js",
    "packages\utils\string.js",
    "packages\utils\validation.js",
    "packages\ui\index.js"
)

$deleted = 0
$notFound = 0

foreach ($file in $duplicates) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Green
            $deleted++
        }
        catch {
            Write-Host "❌ Failed to delete: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor Yellow
        $notFound++
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "   Deleted: $deleted files" -ForegroundColor Green
Write-Host "   Not found: $notFound files" -ForegroundColor Yellow

# Verify critical middleware file is gone
if (-not (Test-Path "apps\web\src\middleware.js")) {
    Write-Host "✅ Critical: middleware.js duplicate removed" -ForegroundColor Green
} else {
    Write-Host "❌ Critical: middleware.js still exists!" -ForegroundColor Red
}

Write-Host "`nJavaScript duplicate cleanup complete!" -ForegroundColor Cyan
