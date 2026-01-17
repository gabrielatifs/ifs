# Comprehensive import fixing script

Write-Host "=== COMPREHENSIVE IMPORT FIX ===" -ForegroundColor Cyan

# STEP 1: Fix shared package UI components (they should import from same directory)
Write-Host "`n[1/4] Fixing shared UI component imports..." -ForegroundColor Yellow
$uiFiles = Get-ChildItem -Path "c:\IFS App\packages\shared\src\components\ui" -Filter *.jsx
$count1 = 0
foreach ($file in $uiFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $modified = $false

        # Fix references to other UI components in same directory
        if ($content -match '\.\./\.\./\.\./components/ui/') {
            $content = $content -replace '\.\./\.\./\.\./components/ui/', './'
            $modified = $true
        }
        if ($content -match '\.\./components/ui/') {
            $content = $content -replace '\.\./components/ui/', './'
            $modified = $true
        }
        if ($content -match 'from "@/components/ui/') {
            $content = $content -replace 'from "@/components/ui/', 'from "./'
            $modified = $true
        }

        # Fix lib/utils references (go up two levels from ui/)
        if ($content -match 'from "\.\./\.\./\.\./lib/utils"') {
            $content = $content -replace 'from "\.\./\.\./\.\./lib/utils"', 'from "../../lib/utils"'
            $modified = $true
        }
        if ($content -match 'from "@/lib/utils"') {
            $content = $content -replace 'from "@/lib/utils"', 'from "../../lib/utils"'
            $modified = $true
        }

        if ($modified) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $count1++
        }
    }
}
Write-Host "  Fixed $count1 UI component files" -ForegroundColor Green

# STEP 2: Fix Layout.jsx in both apps (should use @ifs/shared for providers)
Write-Host "`n[2/4] Fixing Layout.jsx files..." -ForegroundColor Yellow
$count2 = 0
$layoutFiles = @(
    "c:\IFS App\apps\main-site\src\pages\Layout.jsx",
    "c:\IFS App\apps\portal\src\pages\Layout.jsx"
)
foreach ($layoutPath in $layoutFiles) {
    if (Test-Path $layoutPath) {
        $content = Get-Content -Path $layoutPath -Raw
        $modified = $false

        # Fix provider imports
        if ($content -match 'from [''"]\.\.\/components\/providers\/') {
            $content = $content -replace 'from [''"]\.\.\/components\/providers\/([^''"]+)[''"]', 'from ''@ifs/shared/components/providers/$1'''
            $modified = $true
        }

        if ($modified) {
            Set-Content -Path $layoutPath -Value $content -NoNewline
            $count2++
        }
    }
}
Write-Host "  Fixed $count2 Layout files" -ForegroundColor Green

# STEP 3: Fix all page files in both apps
Write-Host "`n[3/4] Fixing all page files..." -ForegroundColor Yellow
function Fix-AppFiles {
    param([string]$Path)

    $files = Get-ChildItem -Path $Path -Recurse -Include *.jsx,*.js
    $count = 0

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $modified = $false

            # Fix provider imports
            if ($content -match 'from [''"]\.\.\/components\/providers\/') {
                $content = $content -replace 'from [''"]\.\.\/components\/providers\/([^''"]+)[''"]', 'from ''@ifs/shared/components/providers/$1'''
                $modified = $true
            }
            if ($content -match 'from [''"]\.\.\/\.\.\/components\/providers\/') {
                $content = $content -replace 'from [''"]\.\.\/\.\.\/components\/providers\/([^''"]+)[''"]', 'from ''@ifs/shared/components/providers/$1'''
                $modified = $true
            }

            if ($modified) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $count++
            }
        }
    }
    return $count
}

$mainCount = Fix-AppFiles -Path "c:\IFS App\apps\main-site\src"
$portalCount = Fix-AppFiles -Path "c:\IFS App\apps\portal\src"
Write-Host "  Fixed $mainCount main-site files" -ForegroundColor Green
Write-Host "  Fixed $portalCount portal files" -ForegroundColor Green

# STEP 4: Fix shared package provider files (they should use relative paths internally)
Write-Host "`n[4/4] Fixing shared package provider files..." -ForegroundColor Yellow
$providerFiles = Get-ChildItem -Path "c:\IFS App\packages\shared\src\components\providers" -Filter *.jsx
$count4 = 0
foreach ($file in $providerFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $modified = $false

        # Fix @/lib imports (go up three levels from providers/)
        if ($content -match 'from "@/lib/') {
            $content = $content -replace 'from "@/lib/', 'from "../../../lib/'
            $modified = $true
        }

        # Fix @/api imports
        if ($content -match 'from "@/api/') {
            $content = $content -replace 'from "@/api/', 'from "../../../api/'
            $modified = $true
        }

        if ($modified) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $count4++
        }
    }
}
Write-Host "  Fixed $count4 provider files" -ForegroundColor Green

Write-Host "`n=== IMPORT FIX COMPLETE ===" -ForegroundColor Cyan
$total = $count1 + $count2 + $mainCount + $portalCount + $count4
Write-Host "Total files updated: $total" -ForegroundColor Green
