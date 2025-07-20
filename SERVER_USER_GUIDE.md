# Onwards Admin App - Server User Guide

## Overview

This guide covers the operation and management of the Onwards Admin App running in production on your Ubuntu VPS. The application consists of a Vue.js frontend and Node.js/Express backend, managed by PM2 process manager.

## Architecture

- **Frontend**: Vue.js application served on port 8080
- **Backend**: Node.js/Express API running on port 3000  
- **Database**: PostgreSQL (external)
- **Process Manager**: PM2 for reliability and monitoring
- **Web Server**: Static file serving via PM2's serve module

## Server Location

- **Application Directory**: `/root/Repos/onwards-admin-app/`
- **Log Files**: `/root/Repos/onwards-admin-app/logs/`
- **Configuration**: `/root/Repos/onwards-admin-app/.env` (contains sensitive data)

## Service Management

### Quick Commands

Navigate to the application directory first:
```bash
cd /root/Repos/onwards-admin-app/
```

Then use these scripts:

| Command | Description |
|---------|-------------|
| `./start.sh` | Start all services |
| `./stop.sh` | Stop all services |
| `./restart.sh` | Restart all services |
| `./status.sh` | Check service status and recent logs |
| `./logs.sh` | View live logs (Ctrl+C to exit) |

### Service URLs

- **Frontend Application**: `http://your-server-ip:8080`
- **Backend API**: `http://your-server-ip:3000`
- **Health Check**: `http://your-server-ip:3000/api/health`

## PM2 Process Management

### Direct PM2 Commands

For advanced management, you can use PM2 directly:

```bash
# View all processes
pm2 status

# View logs for all processes
pm2 logs

# View logs for specific service
pm2 logs onwards-admin-server
pm2 logs onwards-admin-client

# Restart specific service
pm2 restart onwards-admin-server
pm2 restart onwards-admin-client

# Stop specific service
pm2 stop onwards-admin-server
pm2 stop onwards-admin-client

# Delete processes (removes from PM2)
pm2 delete onwards-admin-server
pm2 delete onwards-admin-client

# Reload with new environment variables
pm2 restart onwards-admin-server --update-env
```

### Process Information

- **onwards-admin-server**: Backend API (Node.js/Express)
- **onwards-admin-client**: Frontend static files (served via PM2)
- **pm2-server-monit**: PM2 monitoring module

## Configuration Files

### Environment Configuration (.env)

Located at `/root/Repos/onwards-admin-app/.env`

**⚠️ IMPORTANT**: This file contains sensitive information (database credentials, API keys). Never commit this file to version control.

Key settings:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Authentication secret key
- `PORT`: Backend server port
- `NODE_ENV`: Environment (development/production)
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key

### PM2 Configuration (ecosystem.config.cjs)

Defines how PM2 manages the applications:
- Process names and scripts
- Environment variables
- Log file locations
- Restart policies

## Log Management

### Log File Locations

```
/root/Repos/onwards-admin-app/logs/
├── server-out-1.log      # Backend output logs
├── server-error-1.log    # Backend error logs
├── server-combined-1.log # Backend combined logs
├── client-out.log        # Frontend output logs
├── client-error.log      # Frontend error logs
└── client-combined.log   # Frontend combined logs
```

### Viewing Logs

```bash
# View recent server logs
tail -f logs/server-combined-1.log

# View recent client logs  
tail -f logs/client-combined.log

# View last 50 lines of server logs
tail -50 logs/server-out-1.log

# View live logs for all services
pm2 logs

# Search logs for errors
grep -i error logs/server-*.log
```

## Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check PM2 status
pm2 status

# Check for port conflicts
ss -tlnp | grep -E ":(3000|8080)"

# Check logs for errors
./logs.sh
```

#### 2. Database Connection Issues

```bash
# Check database connectivity
cat logs/server-out-1.log | grep -i database

# Verify .env configuration
cat .env | grep DATABASE_URL
```

#### 3. Frontend Not Loading

```bash
# Check if frontend service is running
pm2 status | grep client

# Check frontend logs
tail -20 logs/client-out.log

# Verify static files exist
ls -la dist/client/
```

#### 4. Port Already in Use

```bash
# Find what's using the ports
ss -tlnp | grep -E ":(3000|8080)"

# Kill processes on specific port (if needed)
sudo fuser -k 3000/tcp
sudo fuser -k 8080/tcp
```

### System Health Checks

```bash
# Check server health
curl http://localhost:3000/api/health

# Check disk space
df -h

# Check memory usage
free -h

# Check PM2 process memory
pm2 monit
```

## Deployment Updates

### Updating the Application

1. **Stop the services:**
   ```bash
   ./stop.sh
   ```

2. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

3. **Install new dependencies (if any):**
   ```bash
   npm install
   ```

4. **Rebuild the application:**
   ```bash
   npm run build
   ```

5. **Start services:**
   ```bash
   ./start.sh
   ```

### Environment Variable Updates

1. **Edit the .env file:**
   ```bash
   nano .env
   ```

2. **Restart with new environment:**
   ```bash
   pm2 restart all --update-env
   ```

## Security Considerations

### File Permissions

Ensure sensitive files have proper permissions:
```bash
chmod 600 .env
chmod +x *.sh
```

### Firewall Configuration

If using UFW firewall:
```bash
# Allow application ports
sudo ufw allow 3000
sudo ufw allow 8080

# Allow SSH (if not already configured)
sudo ufw allow 22

# Enable firewall
sudo ufw enable
```

### Regular Maintenance

1. **Monitor log file sizes:**
   ```bash
   du -sh logs/
   ```

2. **Rotate logs if they get too large:**
   ```bash
   pm2 install pm2-logrotate
   ```

3. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

## Auto-Start Configuration

To ensure services start automatically after server reboot:

```bash
# Generate startup script
pm2 startup

# Save current PM2 configuration
pm2 save
```

This will create a system service that starts PM2 and your applications on boot.

## Backup Procedures

### Application Backup

```bash
# Create backup directory
mkdir -p /root/backups/$(date +%Y%m%d)

# Backup application directory (excluding node_modules and logs)
tar -czf /root/backups/$(date +%Y%m%d)/onwards-admin-app.tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=.git \
  /root/Repos/onwards-admin-app/
```

### Configuration Backup

```bash
# Backup important configuration files
cp .env /root/backups/$(date +%Y%m%d)/env-backup
cp ecosystem.config.cjs /root/backups/$(date +%Y%m%d)/
```

## Performance Monitoring

### Real-time Monitoring

```bash
# PM2 built-in monitor
pm2 monit

# System resources
htop

# Network connections
ss -tuln
```

### Log Analysis

```bash
# Count API requests
grep "GET\|POST\|PUT\|DELETE" logs/server-out-1.log | wc -l

# Check for errors in last hour
grep -i error logs/server-*.log | grep "$(date '+%Y-%m-%d %H')"

# Monitor response times (if logged)
grep "response time" logs/server-out-1.log | tail -20
```

## Support and Maintenance

### Regular Checks

Perform these checks weekly:

1. **Service Status**: `./status.sh`
2. **Log Review**: Check for errors in logs
3. **Disk Space**: `df -h`
4. **Memory Usage**: `free -h`
5. **Database Connectivity**: Check health endpoint

### Emergency Procedures

If the server becomes unresponsive:

1. **SSH into server**
2. **Check system resources**: `htop`
3. **Review logs**: `./logs.sh`
4. **Restart services**: `./restart.sh`
5. **If needed, reboot server**: `sudo reboot`

### Getting Help

For technical issues:

1. Check this guide first
2. Review application logs: `./logs.sh`
3. Check PM2 status: `pm2 status`
4. Consult the main README.md for development information
5. Check GitHub issues for known problems

---

**Last Updated**: July 2025  
**Application Version**: 1.0.0  
**PM2 Version**: 6.0.8  
**Node.js Version**: 22.16.0