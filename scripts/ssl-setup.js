#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const execAsync = promisify(exec);

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

async function setupSSL() {
  try {
    info('Setting up SSL for admin.onwards.org.uk...');
    
    // Step 0: Ensure nginx is running
    info('Ensuring nginx is running...');
    try {
      await execAsync('sudo systemctl start nginx');
      await execAsync('sudo systemctl enable nginx');
    } catch (e) {
      // nginx might already be running
    }
    
    // Step 1: Set up HTTP-only nginx configuration first
    info('Setting up HTTP nginx configuration...');
    await execAsync(`sudo cp ${projectRoot}/nginx/admin.onwards.org.uk.http /etc/nginx/sites-available/admin.onwards.org.uk`);
    
    // Enable the site (create symlink)
    info('Enabling nginx site...');
    await execAsync('sudo ln -sf /etc/nginx/sites-available/admin.onwards.org.uk /etc/nginx/sites-enabled/');
    
    // Remove default nginx site
    try {
      await execAsync('sudo rm -f /etc/nginx/sites-enabled/default');
    } catch (e) {
      // Default site might not exist
    }
    
    // Test nginx configuration
    info('Testing nginx configuration...');
    await execAsync('sudo nginx -t');
    success('Nginx HTTP configuration is valid');
    
    // Reload nginx
    info('Reloading nginx...');
    await execAsync('sudo systemctl reload nginx');
    success('Nginx is now serving HTTP on admin.onwards.org.uk');
    
    // Step 2: Get SSL certificate and upgrade to HTTPS
    info('Obtaining SSL certificate with Let\'s Encrypt...');
    info('Note: Make sure admin.onwards.org.uk DNS points to this server first!');
    
    await execAsync(
      'sudo certbot --nginx -d admin.onwards.org.uk --non-interactive --agree-tos --email admin@onwards.org.uk --redirect'
    );
    
    success('SSL certificate obtained and configured!');
    success('Certbot automatically updated nginx configuration for HTTPS');
    success('Your site should now be available at: https://admin.onwards.org.uk');
    
    // Test final configuration
    info('Testing final nginx configuration...');
    await execAsync('sudo nginx -t');
    await execAsync('sudo systemctl reload nginx');
    success('Final nginx configuration is valid and loaded');
    
  } catch (e) {
    error(`SSL setup failed: ${e.message}`);
    
    if (e.message.includes('DNS') || e.message.includes('domain')) {
      error('Make sure admin.onwards.org.uk DNS A record points to this server IP (31.97.56.79)');
      error('You can check with: nslookup admin.onwards.org.uk');
    }
    
    if (e.message.includes('nginx')) {
      error('Check nginx configuration with: sudo nginx -t');
    }
    
    if (e.message.includes('certificate') || e.message.includes('certbot')) {
      error('Make sure the domain is accessible via HTTP first');
      error('Try: curl -I http://admin.onwards.org.uk');
    }
    
    process.exit(1);
  }
}

async function main() {
  info('SSL Setup Tool for Onwards Admin Platform');
  info('This will set up nginx and SSL certificates for admin.onwards.org.uk');
  
  await setupSSL();
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});