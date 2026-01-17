# Final Setup Steps to Complete Restructure

## Current Status

✅ **Main Site** is working on http://localhost:3000
❌ **Portal** has import errors for missing components

##  Root Cause

The portal is missing several component directories that weren't copied from `src/components/`. The portal pages reference these components but they don't exist.

## Solution: Copy ALL Remaining Component Directories

Run this PowerShell script to copy all missing directories:

```powershell
# Copy all component subdirectories to portal
$directories = @('dashboard', 'marketing')
foreach ($dir in $directories) {
    if (Test-Path "c:\IFS App\src\components\$dir") {
        Copy-Item -Path "c:\IFS App\src\components\$dir" -Destination "c:\IFS App\apps\portal\src\components\$dir" -Recurse -Force
        Write-Host "Copied $dir to portal"
    }
}

# Create QueryProvider if it doesn't exist
if (!(Test-Path "c:\IFS App\packages\shared\src\components\providers\QueryProvider.jsx")) {
    Copy-Item -Path "c:\IFS App\src\components\providers\QueryProvider.jsx" -Destination "c:\IFS App\packages\shared\src\components\providers\QueryProvider.jsx" -Force
    Write-Host "Copied QueryProvider to shared"
}

Write-Host "Done! Restart the servers."
```

## Alternative: Simpler Approach

Since we're hitting so many edge cases with missing components, here's a simpler solution:

**Just use symlinks** to share the src directory between apps for now:

```powershell
# Stop servers
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Create symlink to shared src (requires admin)
# This makes both apps share the same source files
cmd /c mklink /D "c:\IFS App\apps\portal\src\components-original" "c:\IFS App\src\components"
cmd /c mklink /D "c:\IFS App\apps\main-site\src\components-original" "c:\IFS App\src\components"
```

Then update imports to point to `../components-original/` instead of `../components/`.

## Recommended: Start Fresh with Working Copy

The cleanest solution is to use your current **working original codebase** and just add the redirect logic without restructuring:

1. Keep everything in `src/` as is
2. Add domain detection in `App.jsx`
3. Deploy twice with different URLs

This avoids all the complexity of splitting the codebase.

## If You Want to Continue with Split Structure

1. Copy ALL remaining component directories (see PowerShell script above)
2. Run `fix-imports.ps1` again
3. Restart servers
4. Fix any remaining import errors individually

The split structure is possible but requires fixing hundreds of imports across many files. Each missing component directory causes cascading errors.

Let me know which approach you'd prefer and I can help implement it.
