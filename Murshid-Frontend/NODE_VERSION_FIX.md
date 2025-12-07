# Node.js Version Fix

## Problem
Vite 7.1.12 requires Node.js version 20.19+ or 22.12+, but you're currently using Node.js 21.6.1.

Error: `TypeError: crypto.hash is not a function`

## Solution

### Option 1: Direct Installation (Easiest)
1. Download Node.js 22.12+ from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Restart your terminal/PowerShell
4. Verify: `node --version` should show v22.12.0 or higher
5. Run `npm install` in the project directory
6. Start dev server: `npm run dev`

### Option 2: Using nvm-windows (Recommended for developers)
1. Download nvm-windows from [GitHub Releases](https://github.com/coreybutler/nvm-windows/releases)
2. Install nvm-windows
3. Open a new PowerShell/Command Prompt as Administrator
4. Install Node.js 22.12:
   ```powershell
   nvm install 22.12.0
   nvm use 22.12.0
   ```
5. Verify: `node --version`
6. Run `npm install` in the project directory
7. Start dev server: `npm run dev`

## Why Node.js 21.6.1 doesn't work
- Node.js 21 is an odd-numbered (non-LTS) version
- Vite 7 uses `crypto.hash()` which isn't available in Node.js 21.6.1
- Vite explicitly requires Node.js 20.19+ (LTS) or 22.12+ (Current)

## After Upgrading
Once you've upgraded Node.js, the dev server should start without errors.


