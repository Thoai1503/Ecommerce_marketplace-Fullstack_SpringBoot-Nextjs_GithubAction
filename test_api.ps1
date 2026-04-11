# API Test Script for Shipment Status History (PowerShell)
# Usage: .\test_api.ps1

$API_BASE = "http://localhost:8007/api/logistics"
$SHIPMENT_ID = 277

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Shipment Status History API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create status history with full details
Write-Host "Test 1: Create Status History (Full Details)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$body = @{
    status = "IN_TRANSIT"
    description = "Package picked up from warehouse"
    location = "Warehouse A"
    updatedBy = "webhook_test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/shipments/$SHIPMENT_ID/status-history" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body -ErrorAction Stop
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: Create status history with minimal details
Write-Host "Test 2: Create Status History (Minimal Details)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$body = @{
    status = "PICKED_UP"
    description = "Item picked up"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/shipments/$SHIPMENT_ID/status-history" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body -ErrorAction Stop
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 3: Invalid status (should fail gracefully)
Write-Host "Test 3: Invalid Status (Expected to Fail)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$body = @{
    status = "INVALID_STATUS"
    description = "Test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/shipments/$SHIPMENT_ID/status-history" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body -ErrorAction Stop
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-Host $errorBody | ConvertFrom-Json | ConvertTo-Json -Depth 10
}

Write-Host ""
Write-Host ""

# Test 4: Non-existent shipment (should fail gracefully)
Write-Host "Test 4: Non-existent Shipment (Expected to Fail)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$body = @{
    status = "IN_TRANSIT"
    description = "Test non-existent shipment"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/shipments/99999/status-history" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body -ErrorAction Stop
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Error (Expected): $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-Host $errorBody | ConvertFrom-Json | ConvertTo-Json -Depth 10
}

Write-Host ""
Write-Host ""

# Test 5: Valid statuses
Write-Host "Test 5: Test All Valid Statuses" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Yellow

$statuses = @("PENDING", "CONFIRMED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED")

foreach ($status in $statuses) {
    Write-Host "Creating history with status: $status" -ForegroundColor Cyan
    
    $body = @{
        status = $status
        description = "Test $status status"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE/shipments/$SHIPMENT_ID/status-history" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body -ErrorAction Stop
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host "  Status: $($jsonResponse.status)" -ForegroundColor Green
        Write-Host "  Message: $($jsonResponse.message)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
