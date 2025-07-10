#!/usr/bin/env node

import ProcessManager from './process-manager.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const DETACH_LOG = path.join(projectRoot, 'detached.log');
const DETACH_PID = path.join(projectRoot, 'detached.pid');

async function startDetached() {
  try {
    // Clean up old detached processes
    await cleanupOldProcesses();
    
    console.log('Starting development servers in background...');
    
    // Use simple spawn for detached processes with proper stdout/stderr redirection
    const { spawn } = await import('child_process');
    
    // Create log files
    const backendLog = path.join(projectRoot, 'logs', 'backend.log');
    const frontendLog = path.join(projectRoot, 'logs', 'frontend.log');
    
    // Ensure log directory exists
    const logDir = path.dirname(backendLog);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Start backend with proper stdio redirection
    const backendLogFd = fs.openSync(backendLog, 'a');
    const backend = spawn('tsx', ['watch', '--clear-screen=false', 'src/server/index.ts'], {
      cwd: projectRoot,
      detached: true,
      stdio: ['ignore', backendLogFd, backendLogFd],
      env: {
        ...process.env,
        NODE_ENV: 'development',
        DEBUG: 'true'
      }
    });

    // Start frontend with proper stdio redirection
    const frontendLogFd = fs.openSync(frontendLog, 'a');
    const frontend = spawn('npx', ['vite', '--host'], {
      cwd: projectRoot,
      detached: true,
      stdio: ['ignore', frontendLogFd, frontendLogFd],
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    // Write detached PID info
    const detachedInfo = {
      timestamp: new Date().toISOString(),
      backend_pid: backend.pid,
      frontend_pid: frontend.pid,
      backend_log: backendLog,
      frontend_log: frontendLog
    };

    fs.writeFileSync(DETACH_PID, JSON.stringify(detachedInfo, null, 2));

    console.log(`✓ Backend started (PID: ${backend.pid})`);
    console.log(`✓ Frontend started (PID: ${frontend.pid})`);
    console.log(`✓ Backend logs: ${backendLog}`);
    console.log(`✓ Frontend logs: ${frontendLog}`);
    console.log(`✓ Status: npm run dev:status`);
    console.log(`✓ Stop: npm run dev:stop`);

    // Detach from parent
    if (backend.pid && frontend.pid) {
      backend.unref();
      frontend.unref();
      
      // Wait a bit to ensure processes are stable
      setTimeout(() => {
        console.log('Servers running in background. Use npm run dev:status to check status.');
        process.exit(0);
      }, 3000);
    }

  } catch (error) {
    console.error('Failed to start detached servers:', error.message);
    process.exit(1);
  }
}

async function stopDetached() {
  try {
    console.log('Stopping detached development servers...');
    
    if (fs.existsSync(DETACH_PID)) {
      const detachedInfo = JSON.parse(fs.readFileSync(DETACH_PID, 'utf8'));
      
      // Kill processes
      if (detachedInfo.backend_pid) {
        try {
          process.kill(detachedInfo.backend_pid, 'SIGTERM');
          console.log(`✓ Killed backend (PID: ${detachedInfo.backend_pid})`);
        } catch (error) {
          console.log(`Backend process ${detachedInfo.backend_pid} not found`);
        }
      }
      
      if (detachedInfo.frontend_pid) {
        try {
          process.kill(detachedInfo.frontend_pid, 'SIGTERM');
          console.log(`✓ Killed frontend (PID: ${detachedInfo.frontend_pid})`);
        } catch (error) {
          console.log(`Frontend process ${detachedInfo.frontend_pid} not found`);
        }
      }
      
      // Clean up files
      fs.unlinkSync(DETACH_PID);
    }

    // Force cleanup any remaining processes
    await cleanupOldProcesses();
    
    console.log('✓ Detached servers stopped');
    
  } catch (error) {
    console.error('Error stopping detached servers:', error.message);
    process.exit(1);
  }
}

async function getDetachedStatus() {
  try {
    if (!fs.existsSync(DETACH_PID)) {
      console.log('No detached servers running');
      return;
    }

    const detachedInfo = JSON.parse(fs.readFileSync(DETACH_PID, 'utf8'));
    console.log('=== Detached Server Status ===');
    console.log(`Started: ${detachedInfo.timestamp}`);
    
    // Check if processes are still running
    const checkProcess = (pid, name) => {
      try {
        process.kill(pid, 0); // Signal 0 checks if process exists
        return '✓ Running';
      } catch (error) {
        return '✗ Not running';
      }
    };

    console.log(`Backend (PID ${detachedInfo.backend_pid}): ${checkProcess(detachedInfo.backend_pid, 'backend')}`);
    console.log(`Frontend (PID ${detachedInfo.frontend_pid}): ${checkProcess(detachedInfo.frontend_pid, 'frontend')}`);
    
    // Show recent backend logs
    if (detachedInfo.backend_log && fs.existsSync(detachedInfo.backend_log)) {
      console.log('\n=== Recent Backend Logs ===');
      const logs = fs.readFileSync(detachedInfo.backend_log, 'utf8').split('\n').slice(-5);
      logs.forEach(line => line && console.log(line));
    }

    // Show recent frontend logs
    if (detachedInfo.frontend_log && fs.existsSync(detachedInfo.frontend_log)) {
      console.log('\n=== Recent Frontend Logs ===');
      const logs = fs.readFileSync(detachedInfo.frontend_log, 'utf8').split('\n').slice(-5);
      logs.forEach(line => line && console.log(line));
    }

  } catch (error) {
    console.error('Error getting detached status:', error.message);
  }
}

async function cleanupOldProcesses() {
  try {
    // Kill any existing development processes
    const { execSync } = await import('child_process');
    
    const commands = [
      'pkill -f "tsx.*src/server" 2>/dev/null || true',
      'pkill -f "vite.*--host" 2>/dev/null || true',
      'pkill -f "onwards-admin-app.*npm run dev" 2>/dev/null || true'
    ];

    for (const cmd of commands) {
      try {
        execSync(cmd, { stdio: 'pipe' });
      } catch (error) {
        // Ignore errors - process might not exist
      }
    }

    // Clean up ports
    const ports = [3001, 8080, 8081, 8082];
    for (const port of ports) {
      try {
        execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { stdio: 'pipe' });
      } catch (error) {
        // Ignore errors - port might not be in use
      }
    }

  } catch (error) {
    console.log('Note: Some cleanup operations may have failed (this is usually okay)');
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      await startDetached();
      break;
    case 'stop':
      await stopDetached();
      break;
    case 'status':
      await getDetachedStatus();
      break;
    case 'cleanup':
      await cleanupOldProcesses();
      console.log('✓ Cleanup completed');
      break;
    default:
      console.log('Usage: node background-runner.js [start|stop|status|cleanup]');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});