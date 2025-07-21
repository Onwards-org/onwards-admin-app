#!/usr/bin/env node

import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

async function killExistingProcesses() {
  console.log('🧹 Cleaning up existing processes...');
  
  try {
    // Stop PM2 processes if they exist
    try {
      const { stdout } = await execAsync('pm2 list --no-format 2>/dev/null || echo ""');
      if (stdout.includes('onwards-admin')) {
        console.log('🔄 Stopping PM2 processes...');
        await execAsync('pm2 stop onwards-admin-server onwards-admin-client 2>/dev/null || true');
        await execAsync('pm2 delete onwards-admin-server onwards-admin-client 2>/dev/null || true');
        console.log('✅ PM2 processes cleaned');
      }
    } catch (e) {
      // PM2 might not be installed or have processes
    }
    
    // Kill processes by pattern - including production builds
    await execAsync('pkill -9 -f "tsx.*src/server" || true');
    await execAsync('pkill -9 -f "vite.*--host" || true');
    await execAsync('pkill -9 -f "onwards-admin-app" || true');
    await execAsync('pkill -9 -f "dist/server" || true');
    await execAsync('pkill -9 -f "node.*server.*index.js" || true');
    
    // Kill by port using multiple methods
    const ports = [3001, 8080];
    for (const port of ports) {
      console.log(`🔍 Cleaning port ${port}...`);
      // Method 1: fuser
      await execAsync(`fuser -k ${port}/tcp || true`);
      // Method 2: lsof + kill
      try {
        const { stdout } = await execAsync(`lsof -ti:${port} || echo ""`);
        if (stdout.trim()) {
          const pids = stdout.trim().split('\n');
          for (const pid of pids) {
            if (pid && !isNaN(pid)) {
              await execAsync(`kill -9 ${pid} || true`);
              console.log(`🔪 Killed PID ${pid} on port ${port}`);
            }
          }
        }
      } catch (e) {
        // Silent failure for lsof method
      }
      // Method 3: ss-based approach
      try {
        const { stdout } = await execAsync(`ss -tlnp | grep :${port} | grep -o 'pid=[0-9]*' | cut -d= -f2 || echo ""`);
        if (stdout.trim()) {
          const pids = stdout.trim().split('\n').filter(Boolean);
          for (const pid of pids) {
            if (pid && !isNaN(pid)) {
              await execAsync(`kill -9 ${pid} || true`);
              console.log(`🔪 Killed PID ${pid} on port ${port} (ss method)`);
            }
          }
        }
      } catch (e) {
        // Silent failure for ss method
      }
    }
    
    console.log('✅ Port cleanup complete');
    
    // Wait for processes to actually terminate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Cleanup complete');
  } catch (e) {
    console.log('⚠️  Some processes may not have been running');
  }
}

async function startServers() {
  console.log('🚀 Starting development servers...');
  
  // Start backend
  console.log('📡 Starting backend on port 3001...');
  const backend = spawn('tsx', ['src/server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  // Start frontend
  console.log('🌐 Starting frontend on port 8080...');
  const frontend = spawn('npx', ['vite', '--host', '--port', '8080'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    process.exit(0);
  });
  
  console.log('✅ Servers started! Press Ctrl+C to stop');
  console.log('🌐 Frontend: http://localhost:8080');
  console.log('📡 Backend: http://localhost:3001');
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'stop') {
    await killExistingProcesses();
    return;
  }
  
  await killExistingProcesses();
  await new Promise(resolve => setTimeout(resolve, 2000));
  await startServers();
}

main().catch(console.error);