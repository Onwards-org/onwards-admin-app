#!/bin/bash

echo "=== Onwards Admin Application Logs ==="
echo ""

cd /root/Repos/onwards-admin-app

# Show live logs from PM2
echo "Showing live logs (press Ctrl+C to exit)..."
echo ""

pm2 logs