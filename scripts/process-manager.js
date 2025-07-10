#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const LOG_DIR = path.join(__dirname, '..', 'logs');
const PID_DIR = path.join(__dirname, '..', 'pids');

// Ensure directories exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}
if (!fs.existsSync(PID_DIR)) {
  fs.mkdirSync(PID_DIR, { recursive: true });
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.logStreams = new Map();
    this.setupSignalHandlers();
  }

  log(message, color = 'white') {
    const timestamp = new Date().toISOString();
    const coloredMessage = `${COLORS[color]}${message}${COLORS.reset}`;
    console.log(`[${timestamp}] ${coloredMessage}`);
  }

  error(message) {
    this.log(`ERROR: ${message}`, 'red');
  }

  success(message) {
    this.log(`SUCCESS: ${message}`, 'green');
  }

  info(message) {
    this.log(`INFO: ${message}`, 'blue');
  }

  warn(message) {
    this.log(`WARN: ${message}`, 'yellow');
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => {
      this.log('Received SIGINT, cleaning up processes...', 'yellow');
      this.cleanup();
    });

    process.on('SIGTERM', () => {
      this.log('Received SIGTERM, cleaning up processes...', 'yellow');
      this.cleanup();
    });

    process.on('uncaughtException', (error) => {
      this.error(`Uncaught exception: ${error.message}`);
      this.cleanup();
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
      this.cleanup();
      process.exit(1);
    });
  }

  async startProcess(name, command, args = [], options = {}) {
    try {
      this.info(`Starting process: ${name}`);
      this.info(`Command: ${command} ${args.join(' ')}`);

      const logFile = path.join(LOG_DIR, `${name}.log`);
      const pidFile = path.join(PID_DIR, `${name}.pid`);

      // Create log stream
      const logStream = fs.createWriteStream(logFile, { flags: 'a' });
      this.logStreams.set(name, logStream);

      // Spawn process
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, ...options.env },
        cwd: options.cwd || process.cwd(),
        detached: options.detached || false
      });

      // Store process info
      this.processes.set(name, {
        process: child,
        pid: child.pid,
        command,
        args,
        startTime: Date.now(),
        logFile,
        pidFile
      });

      // Write PID file
      fs.writeFileSync(pidFile, child.pid.toString());

      // Set up logging
      const logWithPrefix = (data, prefix = '') => {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] ${prefix}${data.toString()}`;
        logStream.write(message);
        if (options.verbose) {
          process.stdout.write(`${COLORS.cyan}[${name}]${COLORS.reset} ${message}`);
        }
      };

      child.stdout.on('data', (data) => {
        logWithPrefix(data, 'STDOUT: ');
      });

      child.stderr.on('data', (data) => {
        logWithPrefix(data, 'STDERR: ');
      });

      child.on('spawn', () => {
        this.success(`Process ${name} started with PID ${child.pid}`);
      });

      child.on('error', (error) => {
        this.error(`Process ${name} error: ${error.message}`);
        this.cleanup(name);
      });

      child.on('exit', (code, signal) => {
        const message = signal 
          ? `Process ${name} killed with signal ${signal}`
          : `Process ${name} exited with code ${code}`;
        
        if (code === 0) {
          this.success(message);
        } else {
          this.error(message);
        }
        
        this.cleanup(name);
      });

      // Set up timeout if specified
      if (options.timeout) {
        setTimeout(() => {
          if (this.processes.has(name)) {
            this.warn(`Process ${name} timed out after ${options.timeout}ms`);
            this.killProcess(name);
          }
        }, options.timeout);
      }

      return child;
    } catch (error) {
      this.error(`Failed to start process ${name}: ${error.message}`);
      throw error;
    }
  }

  async killProcess(name) {
    if (!this.processes.has(name)) {
      this.warn(`Process ${name} not found`);
      return;
    }

    const processInfo = this.processes.get(name);
    const { process: child, pid } = processInfo;

    try {
      this.info(`Killing process ${name} (PID: ${pid})`);
      
      // Try graceful shutdown first
      child.kill('SIGTERM');
      
      // Wait a bit, then force kill if still running
      setTimeout(() => {
        if (!child.killed) {
          this.warn(`Force killing process ${name} (PID: ${pid})`);
          child.kill('SIGKILL');
        }
      }, 5000);

    } catch (error) {
      this.error(`Failed to kill process ${name}: ${error.message}`);
    }
  }

  async killAllProcesses() {
    const processNames = Array.from(this.processes.keys());
    this.info(`Killing all processes: ${processNames.join(', ')}`);
    
    for (const name of processNames) {
      await this.killProcess(name);
    }
  }

  async cleanup(specificProcess = null) {
    if (specificProcess) {
      // Clean up specific process
      if (this.processes.has(specificProcess)) {
        const processInfo = this.processes.get(specificProcess);
        
        // Close log stream
        if (this.logStreams.has(specificProcess)) {
          this.logStreams.get(specificProcess).end();
          this.logStreams.delete(specificProcess);
        }
        
        // Remove PID file
        try {
          fs.unlinkSync(processInfo.pidFile);
        } catch (error) {
          // Ignore errors when removing PID file
        }
        
        this.processes.delete(specificProcess);
      }
    } else {
      // Clean up all processes
      await this.killAllProcesses();
      
      // Close all log streams
      for (const [name, stream] of this.logStreams) {
        stream.end();
      }
      this.logStreams.clear();
      
      // Remove all PID files
      try {
        const pidFiles = fs.readdirSync(PID_DIR);
        for (const file of pidFiles) {
          if (file.endsWith('.pid')) {
            fs.unlinkSync(path.join(PID_DIR, file));
          }
        }
      } catch (error) {
        // Ignore errors when cleaning up PID files
      }
      
      this.processes.clear();
    }
  }

  getProcessStatus(name) {
    if (!this.processes.has(name)) {
      return { status: 'not_running', message: 'Process not found' };
    }

    const processInfo = this.processes.get(name);
    const { process: child, pid, startTime } = processInfo;

    if (child.killed) {
      return { status: 'killed', message: 'Process was killed' };
    }

    const uptime = Date.now() - startTime;
    return {
      status: 'running',
      pid,
      uptime,
      message: `Process running for ${Math.floor(uptime / 1000)}s`
    };
  }

  async getSystemStatus() {
    const status = {
      processes: {},
      ports: {}
    };

    // Get process status
    for (const [name] of this.processes) {
      status.processes[name] = this.getProcessStatus(name);
    }

    // Check ports
    const ports = [3001, 8080, 8081, 8082];
    for (const port of ports) {
      try {
        const { stdout } = await execAsync(`netstat -tlnp 2>/dev/null | grep :${port} || echo ""`);
        status.ports[port] = stdout.trim() ? 'in_use' : 'available';
      } catch (error) {
        status.ports[port] = 'unknown';
      }
    }

    return status;
  }

  async healthCheck(url, timeout = 5000) {
    try {
      const { stdout } = await execAsync(`timeout ${timeout / 1000} curl -s -o /dev/null -w "%{http_code}" ${url}`);
      const statusCode = parseInt(stdout.trim());
      return statusCode >= 200 && statusCode < 400;
    } catch (error) {
      return false;
    }
  }
}

export default ProcessManager;