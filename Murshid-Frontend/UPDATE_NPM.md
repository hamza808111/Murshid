# How to Update npm

## Current Issue
Your PowerShell execution policy is preventing npm from running. Here are solutions:

## Method 1: Update npm using npm (Recommended)

### Step 1: Fix PowerShell Execution Policy (One-time setup)
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Update npm
After fixing the execution policy, run:
```powershell
npm install -g npm@latest
```

### Step 3: Verify the update
```powershell
npm --version
```

## Method 2: Use Command Prompt (CMD) instead
If you prefer not to change PowerShell settings, use Command Prompt:

1. Open **Command Prompt** (not PowerShell)
2. Run:
   ```cmd
   npm install -g npm@latest
   ```
3. Verify:
   ```cmd
   npm --version
   ```

## Method 3: Update npm with Node.js
When you upgrade Node.js (as needed for Vite), npm will also be updated to a compatible version.

## Quick Commands Summary

**In PowerShell (after fixing execution policy):**
```powershell
# Fix execution policy (run once as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Update npm
npm install -g npm@latest

# Check version
npm --version
```

**In Command Prompt (no policy changes needed):**
```cmd
npm install -g npm@latest
npm --version
```

## Notes
- The `-g` flag installs npm globally
- You may need Administrator privileges
- After updating npm, you might want to run `npm install` in your project directory to ensure dependencies are compatible


