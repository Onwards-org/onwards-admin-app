#!/bin/bash

echo "=== Onwards Admin Application Status ==="
echo ""

cd /root/Repos/onwards-admin-app

# Show PM2 status
pm2 status

echo ""
echo "=== Port Usage ==="
ss -tlnp | grep -E ":(3001|8080)" || echo "No application ports in use"

echo ""
echo "=== Recent Log Entries ==="
if [ -f logs/server-combined.log ]; then
    echo "--- Server Logs (last 5 lines) ---"
    tail -5 logs/server-combined.log
fi

if [ -f logs/client-combined.log ]; then
    echo "--- Client Logs (last 5 lines) ---"
    tail -5 logs/client-combined.log
fi