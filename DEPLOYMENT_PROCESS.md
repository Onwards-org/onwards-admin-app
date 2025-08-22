# Deployment Process and Development Environment Guide

# Hmmm
* `root`
* `ep0stArLaDS?`

## Overview
This document provides comprehensive guidance for managing the Onwards Admin Platform development environment, particularly in Windows/WSL2 environments where file system mounting and process management can be challenging.

## Critical Directory Structure

```
/mnt/c/Repos/Onwards-org/onwards-admin-app/  # PROJECT ROOT - ALWAYS WORK FROM HERE
├── src/
│   ├── client/          # Frontend Vue.js code
│   │   ├── pages/       # Vue pages
│   │   ├── components/  # Vue components
│   │   └── index.html   # Main HTML file
│   └── server/          # Backend Express.js code
├── scripts/             # Process management scripts
├── logs/                # Application logs
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## Windows/WSL2 Specific Issues and Solutions

### File System Mounting Issues
- **Problem**: WSL2 mounts Windows drives under `/mnt/c/` which can cause file watching issues
- **Solution**: Always work from the project root (`/mnt/c/Repos/Onwards-org/onwards-admin-app/`)
- **Critical**: Never run Vite from `src/client/` directory - this breaks path resolution

### File Watching Problems
- **Symptom**: Code changes don't appear in browser, hot reload doesn't work
- **Root Cause**: Vite's file watcher may not detect changes across WSL2/Windows file system boundary
- **Solution**: Restart development servers from project root

### Process Management Challenges
- **Issue**: Multiple Node.js processes can conflict and occupy ports
- **Solution**: Use systematic process cleanup before starting new instances

## Port Configuration

```
Frontend (Vite):  8080
Backend (Express): 3001
Database:         5432 (PostgreSQL remote)
```

## Environment Variables

Located in `.env` file:
```bash
DATABASE_URL=postgresql://onwards_admin:simba123@db.onwards.org.uk:5432/onwards_prod
JWT_SECRET=threep1g5
PORT=3001
FRONTEND_PORT=8080
NODE_ENV=development
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Development Server Management

### Method 1: Using Process Manager (Recommended)

```bash
# Start both servers
npm run dev

# Check status
npm run dev:health

# Stop all servers
npm run dev:stop

# Restart servers
npm run dev:restart
```

### Method 2: Manual Process Management (Troubleshooting)

#### Starting Servers Manually

```bash
# CRITICAL: Always run from project root
cd /mnt/c/Repos/Onwards-org/onwards-admin-app

# Start backend
tsx src/server/index.ts &

# Start frontend (from project root, NOT src/client!)
npx vite --host --port 8080 &
```

#### Stopping Servers

```bash
# Kill all related processes
pkill -f "tsx.*src/server" || true
pkill -f "vite.*--host" || true
pkill -f "onwards-admin-app" || true

# Or kill by PID if you know them
kill -9 <PID>
```

#### Finding Running Processes

```bash
# Find all Node.js processes related to the project
ps aux | grep -E "(tsx|vite|node.*onwards)" | grep -v grep

# Check what's using specific ports
ss -tlnp | grep -E "(3001|8080)"
```

## Troubleshooting Common Issues

### Issue 1: "Port Already in Use"

```bash
# Check what's using the port
ss -tlnp | grep 8080

# Kill process using specific port
fuser -k 8080/tcp

# Or find and kill by PID
lsof -ti:8080 | xargs kill -9
```

### Issue 2: Changes Not Appearing in Browser

**Symptoms**: Code changes don't show up in browser, hot reload broken

**Systematic Debugging Steps**:

1. **Verify Current Directory**:
   ```bash
   pwd
   # Should show: /mnt/c/Repos/Onwards-org/onwards-admin-app
   ```

2. **Check File Timestamps**:
   ```bash
   ls -la src/client/components/AdminNavigation.vue
   # Verify file was actually modified
   ```

3. **Test Simple HTML Change**:
   ```bash
   # Edit src/client/index.html title to test if changes appear
   curl -s http://localhost:8080/ | grep title
   ```

4. **Restart Development Servers**:
   ```bash
   # Kill all processes
   pkill -f "tsx.*src/server" || true
   pkill -f "vite.*--host" || true
   
   # Wait for cleanup
   sleep 3
   
   # Start from project root
   npx vite --host --port 8080 &
   tsx src/server/index.ts &
   ```

### Issue 3: Database Connection Issues

```bash
# Test database connection
curl -s http://localhost:3001/api/health

# Check if backend is running
ps aux | grep "tsx.*src/server"

# View backend logs
tail -f backend.log
```

### Issue 4: Authentication Rate Limiting

```bash
# If you get "Too many login attempts"
# Wait 15 minutes or restart backend to reset rate limiter
pkill -f "tsx.*src/server"
tsx src/server/index.ts &
```

## File Watching Configuration

### Vite Configuration (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [vue()],
  root: 'src/client',  // This sets the root for Vite
  server: {
    port: 8080,
    host: true,
    strictPort: true,
    // ... proxy configuration
  }
})
```

**Critical**: Because `root: 'src/client'` is set, Vite treats `src/client` as its root directory. This is why you must run Vite from the project root, not from `src/client`.

## Process Management Scripts

### Available Scripts (package.json)

```json
{
  "dev": "node scripts/dev-server.js start",
  "dev:stop": "node scripts/dev-server.js stop",
  "dev:health": "node scripts/dev-server.js health",
  "dev:status": "node scripts/background-runner.js status"
}
```

### Custom Process Manager

The project includes custom process management scripts:

- `scripts/dev-server.js` - Main development server controller
- `scripts/process-manager.js` - Low-level process management
- `scripts/background-runner.js` - Background process management

## Authentication Testing

### Default Users
```
Username: tim
Password: simba123

Username: Lucy  
Password: simba123

Username: Molly
Password: simba123
```

### Testing Authentication
```bash
# Test login (will be rate limited after 5 attempts)
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tim","password":"simba123"}'
```

## Common Deployment Issues and Solutions

### 1. Debug Elements Still Showing

**Problem**: Yellow bars, debug boxes, or test elements still visible in browser

**Solution**:
```bash
# 1. Verify files were actually changed
head -70 src/client/components/AdminNavigation.vue | tail -20

# 2. Check if browser is caching
# - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# - Open developer tools and disable cache

# 3. Restart development servers
npm run dev:stop
npm run dev
```

### 2. WSL2 Performance Issues

**Optimization Tips**:
- Keep project files on WSL2 filesystem instead of Windows filesystem
- Use WSL2 version of Node.js, not Windows version
- Consider using `watchman` for better file watching:
  ```bash
  sudo apt-get update
  sudo apt-get install watchman
  ```

### 3. Database Connection Timeout

**Symptoms**: Backend fails to start, database connection errors

**Solution**:
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Test database connection manually
psql "postgresql://onwards_admin:simba123@db.onwards.org.uk:5432/onwards_prod" -c "SELECT 1;"
```

## Health Monitoring

### Automated Health Checks
```bash
# Check all services
npm run dev:health

# Manual health checks
curl -s http://localhost:3001/api/health  # Backend
curl -s http://localhost:8080/            # Frontend
```

### Log Monitoring
```bash
# View all logs
tail -f logs/backend.log logs/frontend.log

# View specific service logs
tail -f logs/frontend.log
```

## Git Workflow with Development

### Before Making Changes
```bash
# Check current status
git status

# Ensure development servers are running
npm run dev:health
```

### After Making Changes
```bash
# Test changes appear in browser
# If not, restart development servers

# Commit changes
git add .
git commit -m "Your commit message"
```

## Emergency Procedures

### Complete Process Cleanup
```bash
# Nuclear option - kill everything
pkill -f "tsx" || true
pkill -f "vite" || true
pkill -f "node.*onwards" || true
for port in 3001 8080 8081 8082; do
  fuser -k $port/tcp 2>/dev/null || true
done

# Wait for cleanup
sleep 5

# Restart everything
npm run dev
```

### Reset Development Environment
```bash
# 1. Clean all processes
npm run dev:stop

# 2. Clear logs
rm -f logs/*.log backend.log dev.log

# 3. Restart Node.js processes
npm run dev

# 4. Verify everything is working
npm run dev:health
```

## Important Notes for Future Development

1. **Always work from project root** (`/mnt/c/Repos/Onwards-org/onwards-admin-app/`)
2. **Never run Vite from `src/client/`** - this breaks path resolution
3. **WSL2 file watching can be fragile** - restart servers if changes don't appear
4. **Use process management scripts** rather than manual process handling when possible
5. **Check process conflicts** before starting new instances
6. **Rate limiting is active** - authentication attempts are limited to prevent abuse
7. **Database is remote PostgreSQL** - connection issues may require network troubleshooting

## Performance Optimization for WSL2

1. **File System Location**: Keep project in WSL2 filesystem (`/home/user/`) instead of Windows filesystem (`/mnt/c/`)
2. **Memory Allocation**: Increase WSL2 memory limit in `.wslconfig`
3. **Docker Integration**: If using Docker, ensure it's configured for WSL2 backend
4. **Windows Defender**: Exclude WSL2 directories from real-time scanning

## Monitoring and Debugging

### Real-time Monitoring
```bash
# Watch process status
watch -n 5 'ps aux | grep -E "(tsx|vite)" | grep -v grep'

# Monitor ports
watch -n 5 'ss -tlnp | grep -E "(3001|8080)"'
```

### Debug Mode
```bash
# Enable debug mode
export DEBUG=true
npm run dev
```

## Production Deployment and Process Management

### Production Server Management

The application includes comprehensive production server management scripts for running in production environments.

#### Production Commands

```bash
# Build and start production server in background
npm run prod:start

# Stop production server
npm run prod:stop

# Restart production server
npm run prod:restart

# Check production server status
npm run prod:status

# View production server logs
npm run prod:logs

# Build application for production
npm run prod:build
```

#### Production Deployment Process

1. **Prepare for Production**:
   ```bash
   # Ensure you're in the project root
   cd /root/Repos/onwards-admin-app
   
   # Stop any development servers
   npm run dev:stop
   
   # Build the application
   npm run prod:build
   ```

2. **Start Production Server**:
   ```bash
   # Start production server (runs in background)
   npm run prod:start
   ```

3. **Verify Deployment**:
   ```bash
   # Check server status
   npm run prod:status
   
   # Test health endpoint
   curl http://localhost:3001/api/health
   
   # Test frontend (if serving frontend from production)
   curl http://localhost:8080/
   ```

#### Production Server Features

- **Background Process**: Server runs detached from terminal
- **PID Management**: Automatic PID file creation for process tracking
- **Graceful Shutdown**: SIGTERM followed by SIGKILL if needed
- **Health Monitoring**: Built-in health check endpoints
- **Port Conflict Resolution**: Automatic cleanup of conflicting processes
- **Log Management**: Centralized logging with log viewing commands

#### Production Environment Variables

```bash
# Required for production
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://onwards_admin:simba123@db.onwards.org.uk:5432/onwards_prod
JWT_SECRET=threep1g5

# Optional
FRONTEND_PORT=8080
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Process Management Details

The production scripts handle:
- **Automatic Build**: Builds both client and server before starting
- **Port Cleanup**: Kills any processes using ports 3001, 8080, 80, 443
- **Process Patterns**: Identifies and manages production processes
- **Graceful Termination**: 5-second grace period before force kill
- **PID Tracking**: Creates `.prod-server.pid` file for process management

#### Monitoring Production

```bash
# Real-time status monitoring
watch -n 30 'npm run prod:status'

# View recent logs
npm run prod:logs

# Check port usage
ss -tlnp | grep -E "(3001|8080)"

# Process information
ps aux | grep "dist/server"
```

#### Troubleshooting Production

**Issue: Port Already in Use**
```bash
# Check what's using the port
ss -tlnp | grep 8080

# Force cleanup
npm run prod:stop
sleep 5
npm run prod:start
```

**Issue: Server Won't Start**
```bash
# Check build status
npm run prod:build

# Check logs for errors
npm run prod:logs

# Manual process cleanup
pkill -f "dist/server"
npm run prod:start
```

**Issue: Health Check Failing**
```bash
# Check server status
npm run prod:status

# Test database connection
curl http://localhost:3001/api/health

# Check if server is actually running
ps aux | grep "dist/server"
```

#### Production vs Development

| Aspect | Development | Production |
|--------|-------------|------------|
| Process Management | `npm run dev` | `npm run prod:start` |
| File Serving | Vite dev server (8080) | Built files |
| Backend | `tsx src/server/index.ts` | `node dist/server/index.js` |
| Environment | NODE_ENV=development | NODE_ENV=production |
| Process Type | Attached to terminal | Background/detached |
| Restart Behavior | Auto-restart on changes | Manual restart required |

#### Systemd Integration (Optional)

For better production management, consider creating a systemd service:

```bash
# Create service file
sudo tee /etc/systemd/system/onwards-admin-app.service > /dev/null <<EOF
[Unit]
Description=Onwards Admin App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/Repos/onwards-admin-app
ExecStart=/usr/bin/node dist/server/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable onwards-admin-app
sudo systemctl start onwards-admin-app

# Check status
sudo systemctl status onwards-admin-app
```


This comprehensive guide should help manage both development and production environments effectively, particularly in the challenging Windows/WSL2 context where file system and process management can be complex.
