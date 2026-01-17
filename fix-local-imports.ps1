# PowerShell script to fix local component imports that should use shared package

Write-Host "Fixing local component imports to use shared package..." -ForegroundColor Green

function Fix-LocalImports {
    param (
        [string]$Directory
    )

    $files = Get-ChildItem -Path $Directory -Recurse -Include *.jsx,*.js,*.tsx,*.ts
    $count = 0

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue

        if ($content) {
            $modified = $false

            # Fix providers references
            if ($content -match 'from "\.\./providers/') {
                $content = $content -replace 'from "\.\./providers/', 'from "@ifs/shared/components/providers/'
                $modified = $true
            }

            if ($content -match "from '\.\./providers/") {
                $content = $content -replace "from '\.\./providers/", "from '@ifs/shared/components/providers/"
                $modified = $true
            }

            # Fix @/components/ui references that weren't caught
            if ($content -match 'from "@/components/ui/') {
                $content = $content -replace 'from "@/components/ui/', 'from "@ifs/shared/components/ui/'
                $modified = $true
            }

            # Save if modified
            if ($modified) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $count++
            }
        }
    }

    return $count
}

$mainSiteCount = Fix-LocalImports -Directory "c:\IFS App\apps\main-site\src"
$portalCount = Fix-LocalImports -Directory "c:\IFS App\apps\portal\src"

Write-Host "Updated $mainSiteCount files in main-site" -ForegroundColor Green
Write-Host "Updated $portalCount files in portal" -ForegroundColor Green
Write-Host "Total: $($mainSiteCount + $portalCount) files updated" -ForegroundColor Green
