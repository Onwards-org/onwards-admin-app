#!/bin/bash

echo "Stopping Onwards Admin Application..."

cd /root/Repos/onwards-admin-app

# Stop all PM2 processes
pm2 stop all

echo "Application stopped!"
echo "Use './start.sh' to restart the application"