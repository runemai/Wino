#!/usr/bin/env node
/**
 * Build script for Capacitor
 * This script builds Next.js and copies the output to the public directory
 * for Capacitor to use
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const nextDir = path.join(projectRoot, '.next');

console.log('🔨 Building Next.js app for Capacitor...\n');

// Set environment variable for Capacitor build
process.env.CAPACITOR = '1';

try {
  // Clean up any existing _next folder in public (shouldn't exist, but just in case)
  const publicNextDir = path.join(publicDir, '_next');
  if (fs.existsSync(publicNextDir)) {
    console.log('🧹 Cleaning up existing public/_next folder...');
    fs.rmSync(publicNextDir, { recursive: true, force: true });
  }

  // Build Next.js
  console.log('📦 Building Next.js...');
  execSync('pnpm build', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, CAPACITOR: '1' }
  });

  // Copy static files from .next/static to public/_next/static
  // NOTE: This is only for Capacitor builds. These files should not be committed.
  const staticSource = path.join(nextDir, 'static');
  const staticDest = path.join(publicDir, '_next', 'static');
  
  if (fs.existsSync(staticSource)) {
    console.log('📋 Copying static assets for Capacitor...');
    if (fs.existsSync(staticDest)) {
      fs.rmSync(staticDest, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(staticDest), { recursive: true });
    fs.cpSync(staticSource, staticDest, { recursive: true });
    console.log('✅ Static assets copied to public/_next/static');
  }

  // Ensure index.html exists in public
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('📄 Creating index.html...');
    const indexContent = `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Wino</title>
  <script>
    // Redirect to Next.js app
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      window.location.href = '/';
    }
  </script>
</head>
<body>
  <div id="__next"></div>
  <script src="/_next/static/chunks/main.js"></script>
</body>
</html>`;
    fs.writeFileSync(indexPath, indexContent);
  }

  console.log('\n✅ Build complete! Ready for Capacitor sync.');
  console.log('💡 Run: pnpm cap:sync\n');
  console.log('⚠️  NOTE: The public/_next/ folder is for Capacitor only.');
  console.log('   It will be ignored by git and should not be committed.\n');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
