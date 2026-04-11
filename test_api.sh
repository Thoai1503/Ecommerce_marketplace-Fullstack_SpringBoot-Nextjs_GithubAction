#!/bin/bash

# API Test Script for Shipment Status History
# Usage: bash test_api.sh

API_BASE="http://localhost:8007/api/logistics"
SHIPMENT_ID=277

echo "=========================================="
echo "Testing Shipment Status History API"
echo "=========================================="
echo ""

# Test 1: Create status history with full details
echo "Test 1: Create Status History (Full Details)"
echo "---"
curl -X POST "$API_BASE/shipments/$SHIPMENT_ID/status-history" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT",
    "description": "Package picked up from warehouse",
    "location": "Warehouse A",
    "updatedBy": "webhook_test"
  }' | jq .
echo ""
echo ""

# Test 2: Create status history with minimal details
echo "Test 2: Create Status History (Minimal Details)"
echo "---"
curl -X POST "$API_BASE/shipments/$SHIPMENT_ID/status-history" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PICKED_UP",
    "description": "Item picked up"
  }' | jq .
echo ""
echo ""

# Test 3: Invalid status (should fail gracefully)
echo "Test 3: Invalid Status (Expected to Fail)"
echo "---"
curl -X POST "$API_BASE/shipments/$SHIPMENT_ID/status-history" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INVALID_STATUS",
    "description": "Test"
  }' | jq .
echo ""
echo ""

# Test 4: Non-existent shipment (should fail gracefully)
echo "Test 4: Non-existent Shipment (Expected to Fail)"
echo "---"
curl -X POST "$API_BASE/shipments/99999/status-history" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_TRANSIT",
    "description": "Test non-existent shipment"
  }' | jq .
echo ""
echo ""

# Test 5: Valid statuses
echo "Test 5: Test All Valid Statuses"
echo "---"
STATUSES=("PENDING" "CONFIRMED" "PICKED_UP" "IN_TRANSIT" "OUT_FOR_DELIVERY" "DELIVERED")

for status in "${STATUSES[@]}"; do
  echo "Creating history with status: $status"
  curl -s -X POST "$API_BASE/shipments/$SHIPMENT_ID/status-history" \
    -H "Content-Type: application/json" \
    -d "{
      \"status\": \"$status\",
      \"description\": \"Test $status status\"
    }" | jq '.status, .message'
  echo ""
done

echo ""
echo "=========================================="
echo "All tests completed!"
echo "=========================================="
