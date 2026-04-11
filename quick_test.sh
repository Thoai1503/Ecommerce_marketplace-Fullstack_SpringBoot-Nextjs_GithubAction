#!/bin/bash

# ============================================================
# QUICK TEST - Copy and paste these commands directly
# ============================================================

echo "Testing with CORRECT format (Double Quotes)"
echo "==========================================="
echo ""

# CORRECT - Use this!
curl -X POST http://localhost:8007/api/logistics/shipments/277/status-history \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"IN_TRANSIT\",\"description\":\"Picked up\"}"

echo ""
echo ""
echo "==========================================="
echo "Response should show success with status: IN_TRANSIT"
echo "==========================================="
