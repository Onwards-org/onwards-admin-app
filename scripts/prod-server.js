#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const execAsync = promisify(exec);

// Ensure we're in the correct directory
process.chdir(projectRoot);

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function error(message) {
  console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`);
}

function success(message) {
  console.log(`[${new Date().toISOString()}] ✅ SUCCESS: ${message}`);
}

function info(message) {
  console.log(`[${new Date().toISOString()}] ℹ️  INFO: ${message}`);
}

async function killProductionProcesses() {
  info('Stopping production processes...');
  
  try {
    // Kill production processes
    const processPatterns = [
      'dist/server',
      'node.*server.*index.js',
      'onwards-admin-app.*dist'
    ];

    for (const pattern of processPatterns) {
      try {
        await execAsync(`pkill -f "${pattern}"`);
        info(`Killed processes matching: ${pattern}`);
      } catch (e) {
        // Process might not exist, that's fine
      }
    }

    // Kill specific ports used in production
    const ports = [3001, 8080, 80, 443];
    for (const port of ports) {
      try {
        const { stdout } = await execAsync(`lsof -ti:${port} || echo ""`);
        if (stdout.trim()) {
          const pids = stdout.trim().split('\n').filter(Boolean);
          for (const pid of pids) {
            if (pid && !isNaN(pid)) {
              await execAsync(`kill -TERM ${pid}`);
              info(`Gracefully terminated PID ${pid} on port ${port}`);
              
              // Wait 5 seconds, then force kill if still running
              setTimeout(async () => {
                try {
                  await execAsync(`kill -0 ${pid}`);
                  await execAsync(`kill -9 ${pid}`);
                  info(`Force killed PID ${pid}`);
                } catch (e) {
                  // Process already terminated
                }
              }, 5000);
            }
          }
        }
      } catch (e) {
        // Port might not be in use
      }
    }
    
    success('Production processes stopped');
  } catch (e) {
    error(`Error stopping processes: ${e.message}`);
  }
}

async function startProduction() {
  info('Starting production server...');
  
  // First ensure we have a built version
  try {
    await execAsync('npm run build');
    success('Build completed');
  } catch (e) {
    error('Build failed: ' + e.message);
    throw e;
  }

  return new Promise((resolve, reject) => {
    const server = spawn('node', ['dist/server/index.js'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3001'
      },
      detached: true // Run in background
    });

    let started = false;
    let startupOutput = '';
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      startupOutput += output;
      info(`[PROD-SERVER] ${output.trim()}`);
      
      if ((output.includes('Server running') || output.includes('listening on')) && !started) {
        started = true;
        success('Production server started successfully');
        
        // Write PID file for later management
        fs.writeFileSync(path.join(projectRoot, '.prod-server.pid'), server.pid.toString());
        
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      const output = data.toString();
      startupOutput += output;
      error(`[PROD-SERVER] ${output.trim()}`);
      
      if (output.includes('EADDRINUSE') && !started) {
        reject(new Error(`Production server port conflict: ${output}`));
      }
    });

    server.on('error', (err) => {
      error(`Production server process error: ${err.message}`);
      if (!started) {
        reject(err);
      }
    });

    server.on('exit', (code, signal) => {
      info(`Production server exited with code ${code}, signal ${signal}`);
      if (code !== 0 && signal !== 'SIGTERM' && !started) {
        error('Production server startup failed. Output:');
        console.log(startupOutput);
        reject(new Error(`Production server exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        error('Production server startup timeout. Output:');
        console.log(startupOutput);
        server.kill('SIGTERM');
        reject(new Error('Production server startup timeout'));
      }
    }, 30000);
  });
}

async function startProductionDetached() {
  info('Starting production server in background...');
  
  // Kill any existing processes first
  await killProductionProcesses();
  
  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const server = await startProduction();
  
  // Detach the process so it continues running
  server.unref();
  
  success(`Production server started with PID ${server.pid}`);
  success('Server is running in the background');
  success('Use "npm run prod:stop" to stop the server');
  success('Use "npm run prod:status" to check server status');
  
  // Don't keep the parent process alive
  process.exit(0);
}

async function checkStatus() {
  info('Checking production server status...');
  
  try {
    // Check if PID file exists
    const pidFile = path.join(projectRoot, '.prod-server.pid');
    let pid = null;
    
    try {
      pid = fs.readFileSync(pidFile, 'utf8').trim();
    } catch (e) {
      info('No PID file found');
    }
    
    if (pid) {
      try {
        // Check if process is still running
        await execAsync(`kill -0 ${pid}`);
        success(`Production server is running (PID: ${pid})`);
      } catch (e) {
        error(`PID ${pid} is not running, cleaning up PID file`);
        fs.unlinkSync(pidFile);
      }
    }
    
    // Check ports
    const { stdout } = await execAsync('ss -tlnp | grep -E "(3001|8080)" || echo ""');
    if (stdout.trim()) {
      info('Active ports:');
      console.log(stdout);
    } else {
      info('No production ports active');
    }
    
    // Try to hit health endpoint
    try {
      const healthResponse = await execAsync('curl -s http://localhost:3001/api/health --connect-timeout 5');
      const healthData = JSON.parse(healthResponse.stdout);
      if (healthData.status === 'ok') {
        success('Health check passed');
      } else {
        error('Health check failed');
      }
    } catch (e) {
      error('Could not reach health endpoint');
    }
    
  } catch (e) {
    error(`Status check failed: ${e.message}`);
  }
}

async function viewLogs() {
  info('Viewing production server logs...');
  
  try {
    // Try to find log files
    const logPaths = [
      'logs/production.log',
      'production.log',
      'server.log'
    ];
    
    for (const logPath of logPaths) {
      try {
        const fullPath = path.join(projectRoot, logPath);
        const { stdout } = await execAsync(`tail -n 50 "${fullPath}" || echo ""`);
        if (stdout.trim()) {
          info(`Logs from ${logPath}:`);
          console.log(stdout);
          return;
        }
      } catch (e) {
        // Try next log file
      }
    }
    
    info('No log files found, showing systemd logs if available...');
    try {
      const { stdout } = await execAsync('journalctl -u onwards-admin-app --no-pager -n 50 || echo "No systemd service found"');
      console.log(stdout);
    } catch (e) {
      info('No logs available');
    }
    
  } catch (e) {
    error(`Could not view logs: ${e.message}`);
  }
}

async function main() {
  const command = process.argv[2];
  
  info(`Production server manager - Command: ${command || 'status'}`);
  info(`Working directory: ${process.cwd()}`);
  
  switch (command) {
    case 'start':
      await startProductionDetached();
      break;
    case 'stop':
      await killProductionProcesses();
      // Clean up PID file
      try {
        const pidFile = path.join(projectRoot, '.prod-server.pid');
        fs.unlinkSync(pidFile);
      } catch (e) {
        // PID file might not exist
      }
      break;
    case 'restart':
      await killProductionProcesses();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await startProductionDetached();
      break;
    case 'status':
      await checkStatus();
      break;
    case 'logs':
      await viewLogs();
      break;
    case 'build':
      try {
        await execAsync('npm run build');
        success('Build completed successfully');
      } catch (e) {
        error('Build failed: ' + e.message);
        process.exit(1);
      }
      break;
    default:
      console.log('Usage: node scripts/prod-server.js [start|stop|restart|status|logs|build]');
      console.log('');
      console.log('Commands:');
      console.log('  start   - Build and start production server in background');
      console.log('  stop    - Stop production server');
      console.log('  restart - Stop and start production server');
      console.log('  status  - Check if production server is running');
      console.log('  logs    - View production server logs');
      console.log('  build   - Build the application for production');
      process.exit(1);
  }
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});