#!/bin/bash

echo "Restarting Onwards Admin Application..."

cd /root/Repos/onwards-admin-app

# Restart all PM2 processes
pm2 restart all

echo "Application restarted!"
echo "Backend API: http://localhost:3001"
echo "Frontend: http://localhost:8080"
echo ""
echo "Use 'pm2 status' to check application status"