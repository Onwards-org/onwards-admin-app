#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const execAsync = promisify(exec);

// Ensure we're in the correct directory
process.chdir(projectRoot);

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  const timestamp = new Date().toISOString();
  const coloredMessage = `${COLORS[color]}${message}${COLORS.reset}`;
  console.log(`[${timestamp}] ${coloredMessage}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function success(message) {
  log(`✅ SUCCESS: ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  INFO: ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  WARN: ${message}`, 'yellow');
}

async function killProcessesOnPort(port) {
  try {
    info(`Checking port ${port}...`);
    
    // Try multiple methods to find and kill processes
    const commands = [
      `lsof -ti:${port}`,
      `ss -tlnp | grep :${port} | grep -o 'pid=[0-9]*' | cut -d= -f2`,
      `netstat -tlnp 2>/dev/null | grep :${port} | awk '{print $7}' | cut -d/ -f1`
    ];

    for (const cmd of commands) {
      try {
        const { stdout } = await execAsync(cmd);
        if (stdout.trim()) {
          const pids = stdout.trim().split('\n').filter(Boolean);
          for (const pid of pids) {
            if (pid && !isNaN(pid)) {
              info(`Killing process ${pid} on port ${port}`);
              await execAsync(`kill -9 ${pid}`).catch(() => {});
            }
          }
        }
      } catch (e) {
        // Ignore errors, try next method
      }
    }

    // Force kill using fuser as last resort
    await execAsync(`fuser -k ${port}/tcp`).catch(() => {});
    
    success(`Port ${port} cleaned up`);
  } catch (e) {
    warn(`Could not clean port ${port}: ${e.message}`);
  }
}

async function killAllDevProcesses() {
  info('Killing all development processes...');
  
  const processPatterns = [
    'tsx.*src/server',
    'vite.*--host',
    'node.*onwards-admin-app',
    'npm.*dev'
  ];

  for (const pattern of processPatterns) {
    try {
      await execAsync(`pkill -9 -f "${pattern}"`);
      info(`Killed processes matching: ${pattern}`);
    } catch (e) {
      // Process might not exist, that's fine
    }
  }

  // Kill specific ports
  await killProcessesOnPort(3001);
  await killProcessesOnPort(8080);
  
  success('All processes killed');
}

async function waitForPort(port, maxWait = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}/ || echo "000"`);
      const statusCode = parseInt(stdout.trim());
      
      if (statusCode !== 0 && statusCode !== 7) { // 7 is connection refused
        return true;
      }
    } catch (e) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return false;
}

async function startBackend() {
  info('Starting backend server...');
  
  return new Promise((resolve, reject) => {
    info('Spawning backend process...');
    const backend = spawn('tsx', ['src/server/index.ts'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' },
      shell: false
    });

    let started = false;
    let allOutput = '';
    
    backend.stdout.on('data', (data) => {
      const output = data.toString();
      allOutput += output;
      
      // Log each line separately for better readability
      output.split('\n').forEach(line => {
        if (line.trim()) {
          info(`[BACKEND] ${line.trim()}`);
        }
      });
      
      if ((output.includes('Server running on port') || output.includes('Health check:')) && !started) {
        started = true;
        success('Backend started successfully');
        resolve(backend);
      }
    });

    backend.stderr.on('data', (data) => {
      const output = data.toString();
      allOutput += output;
      
      output.split('\n').forEach(line => {
        if (line.trim()) {
          if (line.includes('ERROR') || line.includes('EADDRINUSE')) {
            error(`[BACKEND] ${line.trim()}`);
          } else {
            warn(`[BACKEND] ${line.trim()}`);
          }
        }
      });
      
      if (output.includes('EADDRINUSE') && !started) {
        reject(new Error(`Backend port conflict: ${output}`));
      }
    });

    backend.on('error', (err) => {
      error(`Backend process error: ${err.message}`);
      if (!started) {
        reject(err);
      }
    });

    backend.on('exit', (code, signal) => {
      if (code !== 0 && signal !== 'SIGTERM') {
        error(`Backend exited with code ${code}, signal ${signal}`);
        if (!started) {
          error('Backend startup failed. Full output:');
          console.log(allOutput);
          reject(new Error(`Backend exited with code ${code}`));
        }
      }
    });

    // Timeout after 45 seconds
    setTimeout(() => {
      if (!started) {
        warn('Backend taking longer than expected, killing...');
        error('Backend startup timeout. Full output:');
        console.log(allOutput);
        backend.kill('SIGTERM');
        reject(new Error('Backend startup timeout'));
      }
    }, 45000);
  });
}

async function startFrontend() {
  info('Starting frontend server...');
  
  return new Promise((resolve, reject) => {
    const frontend = spawn('npx', ['vite', '--host', '--port', '8080'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    });

    let started = false;
    
    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      info(`[FRONTEND] ${output.trim()}`);
      
      if (output.includes('ready in') && !started) {
        started = true;
        success('Frontend started successfully');
        resolve(frontend);
      }
    });

    frontend.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('ERROR') || output.includes('EADDRINUSE')) {
        error(`[FRONTEND] ${output.trim()}`);
        if (!started) {
          reject(new Error(`Frontend failed to start: ${output}`));
        }
      } else {
        warn(`[FRONTEND] ${output.trim()}`);
      }
    });

    frontend.on('error', (err) => {
      error(`Frontend process error: ${err.message}`);
      if (!started) {
        reject(err);
      }
    });

    frontend.on('exit', (code) => {
      if (code !== 0) {
        error(`Frontend exited with code ${code}`);
        if (!started) {
          reject(new Error(`Frontend exited with code ${code}`));
        }
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        frontend.kill('SIGTERM');
        reject(new Error('Frontend startup timeout'));
      }
    }, 30000);
  });
}

async function healthCheck() {
  try {
    info('Performing health checks...');
    
    // Check backend
    const backendResponse = await execAsync('curl -s http://localhost:3001/api/health');
    const backendData = JSON.parse(backendResponse.stdout);
    if (backendData.status === 'ok') {
      success('Backend health check passed');
    } else {
      throw new Error('Backend health check failed');
    }

    // Check frontend
    const frontendResponse = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/');
    const statusCode = parseInt(frontendResponse.stdout.trim());
    if (statusCode === 200) {
      success('Frontend health check passed');
    } else {
      throw new Error(`Frontend returned status ${statusCode}`);
    }

    return true;
  } catch (e) {
    error(`Health check failed: ${e.message}`);
    return false;
  }
}

async function startServers() {
  try {
    info('🚀 Starting development servers...');
    info(`Working directory: ${process.cwd()}`);
    
    // Clean up any existing processes
    await killAllDevProcesses();
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start backend first
    const backendProcess = await startBackend();
    
    // Wait for backend to be ready
    info('Waiting for backend to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start frontend
    const frontendProcess = await startFrontend();
    
    // Wait for frontend to be ready
    info('Waiting for frontend to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Health check
    const healthy = await healthCheck();
    
    if (healthy) {
      success('🎉 All servers started successfully!');
      success('🌐 Frontend: http://localhost:8080');
      success('🔧 Backend: http://localhost:3001');
      success('❤️  Health: http://localhost:3001/api/health');
      
      // Keep processes alive and log periodically
      setInterval(() => {
        info('Servers still running...');
      }, 30000);
      
      // Handle cleanup on exit
      process.on('SIGINT', async () => {
        warn('Received SIGINT, cleaning up...');
        backendProcess.kill('SIGTERM');
        frontendProcess.kill('SIGTERM');
        await killAllDevProcesses();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        warn('Received SIGTERM, cleaning up...');
        backendProcess.kill('SIGTERM');
        frontendProcess.kill('SIGTERM');
        await killAllDevProcesses();
        process.exit(0);
      });
      
    } else {
      throw new Error('Health checks failed');
    }
    
  } catch (e) {
    error(`Failed to start servers: ${e.message}`);
    await killAllDevProcesses();
    process.exit(1);
  }
}

async function stopServers() {
  info('🛑 Stopping all development servers...');
  await killAllDevProcesses();
  success('All servers stopped');
}

async function statusCheck() {
  try {
    info('📊 Checking server status...');
    
    const healthy = await healthCheck();
    
    if (healthy) {
      success('All servers are running and healthy');
    } else {
      error('One or more servers are not responding');
    }
    
    // Show process info
    try {
      const { stdout } = await execAsync('ps aux | grep -E "(tsx|vite|node.*onwards)" | grep -v grep');
      if (stdout.trim()) {
        info('Running processes:');
        console.log(stdout);
      } else {
        warn('No development processes found');
      }
    } catch (e) {
      warn('Could not get process information');
    }
    
    // Show port info
    try {
      const { stdout } = await execAsync('ss -tlnp | grep -E "(3001|8080)"');
      if (stdout.trim()) {
        info('Port usage:');
        console.log(stdout);
      } else {
        warn('No processes using development ports');
      }
    } catch (e) {
      warn('Could not get port information');
    }
    
  } catch (e) {
    error(`Status check failed: ${e.message}`);
  }
}

async function main() {
  const command = process.argv[2];
  
  info(`Command: ${command || 'start'}`);
  info(`Working directory: ${process.cwd()}`);
  
  switch (command) {
    case 'start':
      await startServers();
      break;
    case 'stop':
      await stopServers();
      break;
    case 'status':
      await statusCheck();
      break;
    case 'restart':
      await stopServers();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await startServers();
      break;
    default:
      error('Usage: node robust-dev.js [start|stop|status|restart]');
      process.exit(1);
  }
}

main().catch(error => {
  error(`Fatal error: ${error.message}`);
  process.exit(1);
});