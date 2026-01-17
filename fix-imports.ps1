# PowerShell script to fix import paths in the restructured apps

Write-Host "Fixing import paths..." -ForegroundColor Green

# Define the import mappings
$replacements = @{
    "from '@/components/ui/" = "from '@ifs/shared/components/ui/"
    "from '@/components/providers/" = "from '@ifs/shared/components/providers/"
    "from '@/hooks/" = "from '@ifs/shared/hooks/"
    "from '@/lib/" = "from '@ifs/shared/lib/"
    "from '@/utils" = "from '@ifs/shared/utils"
    "from '@/api/" = "from '@ifs/shared/api/"
    "from '@/api/entities'" = "from '@ifs/shared/api/entities'"
    "from '@/api/entities.js'" = "from '@ifs/shared/api/entities.js'"
    "from '@/api/base44Client'" = "from '@ifs/shared/api/base44Client'"
    "from '@/api/base44Client.js'" = "from '@ifs/shared/api/base44Client.js'"
    "import { base44 } from '@/api/base44Client'" = "import { base44 } from '@ifs/shared/api/base44Client'"
}

function Fix-Imports {
    param (
        [string]$Directory,
        [string]$AppName
    )

    Write-Host "`nProcessing $AppName..." -ForegroundColor Yellow

    $files = Get-ChildItem -Path $Directory -Recurse -Include *.jsx,*.js,*.tsx,*.ts
    $count = 0

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue

        if ($content) {
            $modified = $false
            $originalContent = $content

            # Apply all replacements
            foreach ($key in $replacements.Keys) {
                if ($content -match [regex]::Escape($key)) {
                    $content = $content -replace [regex]::Escape($key), $replacements[$key]
                    $modified = $true
                }
            }

            # Save if modified
            if ($modified) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $count++
            }
        }
    }

    Write-Host "  Updated $count files" -ForegroundColor Green
}

# Fix main site
Fix-Imports -Directory "c:\IFS App\apps\main-site\src" -AppName "Main Site"

# Fix portal
Fix-Imports -Directory "c:\IFS App\apps\portal\src" -AppName "Portal"

# Fix shared package (in case any files reference @/)
Fix-Imports -Directory "c:\IFS App\packages\shared\src" -AppName "Shared Package"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Import fixing complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nNote: Some imports to local files (../components) are expected and correct." -ForegroundColor Cyan
Write-Host "Only shared code imports needed to be updated." -ForegroundColor Cyan
