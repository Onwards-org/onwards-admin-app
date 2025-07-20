#!/bin/bash

echo "Starting Onwards Admin Application..."

cd /root/Repos/onwards-admin-app

# Install pm2-server-monit for serving static files if not already installed
if ! pm2 list | grep -q "serve"; then
    echo "Installing PM2 serve module..."
    pm2 install pm2-server-monit
fi

# Start the application using PM2 ecosystem
pm2 start ecosystem.config.cjs

echo "Application started!"
echo "Backend API: http://localhost:3001"
echo "Frontend: http://localhost:8080"
echo ""
echo "Use 'pm2 status' to check application status"
echo "Use 'pm2 logs' to view logs"