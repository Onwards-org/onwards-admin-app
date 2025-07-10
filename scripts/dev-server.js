#!/usr/bin/env node

import ProcessManager from './process-manager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const manager = new ProcessManager();

async function startDevelopmentServers() {
  try {
    manager.info('Starting development servers...');
    
    // Start backend server
    await manager.startProcess('backend', 'tsx', ['watch', '--clear-screen=false', 'src/server/index.ts'], {
      cwd: projectRoot,
      verbose: true,
      timeout: 30000, // 30 second timeout for startup
      env: {
        NODE_ENV: 'development',
        DEBUG: 'true'
      }
    });

    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start frontend server
    await manager.startProcess('frontend', 'npx', ['vite', '--host'], {
      cwd: projectRoot,
      verbose: true,
      timeout: 30000, // 30 second timeout for startup
      env: {
        NODE_ENV: 'development'
      }
    });

    // Wait for services to be ready
    manager.info('Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Health check using environment variables
    const backendPort = process.env.PORT || 3001;
    const frontendPort = process.env.FRONTEND_PORT || 8080;
    
    const backendHealthy = await manager.healthCheck(`http://localhost:${backendPort}/api/health`);
    const frontendHealthy = await manager.healthCheck(`http://localhost:${frontendPort}`);

    manager.info('=== Development Server Status ===');
    manager.info(`Backend (Port ${backendPort}): ${backendHealthy ? '✓ HEALTHY' : '✗ UNHEALTHY'}`);
    manager.info(`Frontend (Port ${frontendPort}): ${frontendHealthy ? '✓ HEALTHY' : '✗ UNHEALTHY'}`);

    if (backendHealthy && frontendHealthy) {
      manager.success('All development servers are running successfully!');
      manager.info('Press Ctrl+C to stop all servers');
    } else {
      manager.warn('Some services may not be fully ready yet. Check logs for details.');
    }

    // Display status periodically
    setInterval(async () => {
      const status = await manager.getSystemStatus();
      manager.info(`Running processes: ${Object.keys(status.processes).length}`);
    }, 30000);

  } catch (error) {
    manager.error(`Failed to start development servers: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      await startDevelopmentServers();
      break;
    case 'stop':
      manager.info('Stopping all development servers...');
      await manager.killAllProcesses();
      process.exit(0);
      break;
    case 'status':
      const status = await manager.getSystemStatus();
      console.log(JSON.stringify(status, null, 2));
      process.exit(0);
      break;
    case 'health':
      const healthBackendPort = process.env.PORT || 3001;
      const healthFrontendPort = process.env.FRONTEND_PORT || 8080;
      
      const backendHealth = await manager.healthCheck(`http://localhost:${healthBackendPort}/api/health`);
      const frontendHealth = await manager.healthCheck(`http://localhost:${healthFrontendPort}`);
      
      manager.info(`Backend (Port ${healthBackendPort}): ${backendHealth ? '✓ HEALTHY' : '✗ UNHEALTHY'}`);
      manager.info(`Frontend (Port ${healthFrontendPort}): ${frontendHealth ? '✓ HEALTHY' : '✗ UNHEALTHY'}`);
      process.exit(backendHealth && frontendHealth ? 0 : 1);
      break;
    default:
      console.log('Usage: node dev-server.js [start|stop|status|health]');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});