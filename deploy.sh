#!/bin/bash

# Hostinger Node.js Deployment Script
# This script is designed to run on Hostinger's Node.js hosting environment

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build the application
echo "Building application..."
npm run build

# Create necessary directories
echo "Creating required directories..."
mkdir -p uploads/profile-pictures
mkdir -p logs
mkdir -p pids

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 dist/
chmod -R 777 uploads/
chmod -R 755 logs/

# Display build information
echo "Build completed successfully!"
echo "Server entry point: dist/server/index.js"
echo "Static files: dist/client/"
echo "Node.js version required: $(cat .nvmrc)"

echo "Deployment ready!"