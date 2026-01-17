# PowerShell script to fix imports within the shared package

Write-Host "Fixing shared package internal imports..." -ForegroundColor Green

# For files in the shared package, @/ should be relative paths
$sharedFiles = Get-ChildItem -Path "c:\IFS App\packages\shared\src" -Recurse -Include *.jsx,*.js,*.tsx,*.ts
$count = 0

foreach ($file in $sharedFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue

    if ($content) {
        $modified = $false
        $originalContent = $content

        # Replace @/lib/utils with ../lib/utils or ../../lib/utils depending on depth
        $relativePath = $file.Directory.FullName.Replace("c:\IFS App\packages\shared\src\", "").Replace("\", "/")
        $depth = ($relativePath -split "/").Count

        if ($depth -eq 0) {
            # In root of src
            $prefix = "./"
        } elseif ($depth -eq 1) {
            # One level deep (components/ui/)
            $prefix = "../"
        } elseif ($depth -eq 2) {
            # Two levels deep
            $prefix = "../../"
        } else {
            $prefix = "../../../"
        }

        # Fix @/lib/utils
        if ($content -match '@/lib/utils') {
            $content = $content -replace '@/lib/utils', ($prefix + 'lib/utils')
            $modified = $true
        }

        # Fix @/components/ui/ references
        if ($content -match '@/components/ui/') {
            if ($relativePath -like "components/ui*") {
                # Same directory
                $content = $content -replace '@/components/ui/', './'
            } else {
                $content = $content -replace '@/components/ui/', ($prefix + 'components/ui/')
            }
            $modified = $true
        }

        # Save if modified
        if ($modified) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $count++
        }
    }
}

Write-Host "Updated $count files in shared package" -ForegroundColor Green
