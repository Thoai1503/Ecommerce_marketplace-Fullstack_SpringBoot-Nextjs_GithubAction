# ============================================================
# QUICK TEST - Windows PowerShell (Easiest!)
# Just run this file: .\quick_test.ps1
# ============================================================

Write-Host "Testing Shipment Status History API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# CORRECT FORMAT - Copy this if you need to modify
$APIUrl = "http://localhost:8007/api/logistics/shipments/277/status-history"

$RequestBody = @{
    status = "IN_TRANSIT"
    description = "Package picked up from warehouse"
    location = "Warehouse A"
    updatedBy = "test_user"
} | ConvertTo-Json

Write-Host "Request URL: $APIUrl" -ForegroundColor Yellow
Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $RequestBody -ForegroundColor Green
Write-Host ""

Write-Host "Sending request..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $APIUrl `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $RequestBody -ErrorAction Stop
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Green
}
catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Error Response:" -ForegroundColor Red
        try {
            $errorBody | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Red
        }
        catch {
            Write-Host $errorBody -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
