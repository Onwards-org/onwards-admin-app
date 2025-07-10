#!/usr/bin/env node

import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

async function killExistingProcesses() {
  console.log('🧹 Cleaning up existing processes...');
  
  try {
    // Kill processes by pattern
    await execAsync('pkill -9 -f "tsx.*src/server" || true');
    await execAsync('pkill -9 -f "vite.*--host" || true');
    await execAsync('pkill -9 -f "onwards-admin-app" || true');
    
    // Kill by port
    await execAsync('fuser -k 3001/tcp || true');
    await execAsync('fuser -k 8080/tcp || true');
    
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