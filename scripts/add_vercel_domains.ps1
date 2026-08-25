# add_vercel_domains.ps1
# Runs locally: installs vercel CLI (if needed), adds domains to the Vercel project and prints DNS records to add at your registrar.
# Usage (PowerShell):
#   $env:VERCEL_TOKEN = "<your_token_here>"  # temporary for session
#   pwsh .\scripts\add_vercel_domains.ps1

param()

$env:VERCEL_TELEMETRY_DISABLED = '1'

function Write-ErrExit($msg){ Write-Host ('ERROR: {0}' -f $msg) -ForegroundColor Red; exit 1 }

if (-not $env:VERCEL_TOKEN -or $env:VERCEL_TOKEN.Trim().Length -eq 0) {
    $env:VERCEL_TOKEN = Read-Host 'Vercel token'
}
if (-not $env:VERCEL_TOKEN -or $env:VERCEL_TOKEN.Trim().Length -eq 0) { Write-ErrExit 'Vercel token is required.' }

# Ensure npm/node available for installing vercel CLI if missing
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
    Write-Host 'Node/npm not found on PATH. Please install Node.js (https://nodejs.org/) and re-run this script.' -ForegroundColor Yellow
    exit 1
}

# Install vercel CLI globally if missing
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host 'Vercel CLI not found. Installing globally via npm (may require admin rights)...' -ForegroundColor Cyan
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) { Write-ErrExit 'npm install -g vercel failed. Install vercel CLI manually and re-run.' }
}

# Re-resolve vercel
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) { Write-ErrExit 'Vercel CLI still not found after install.' }

# Project name configured in vercel.json
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $projectDir '..')
$vercelJsonPath = Join-Path $repoRoot 'vercel.json'
$projectName = 'quintumnia'
if (Test-Path $vercelJsonPath) {
    try {
        $json = Get-Content $vercelJsonPath -Raw | ConvertFrom-Json
        if ($json.name) { $projectName = $json.name }
    } catch { }
}

Write-Host ('Using project name: {0}' -f $projectName) -ForegroundColor Green

# Helper to run vercel with token and capture output
function Invoke-Vercel([string[]]$vercelArgs) {
    $safeArgs = @($vercelArgs | ForEach-Object { if ($_ -eq $env:VERCEL_TOKEN) { '***' } else { $_ } })
    $displayCommand = @('vercel') + $safeArgs + @('--token', '***')
    Write-Host ('Running: {0}' -f ($displayCommand -join ' ')) -ForegroundColor DarkGray
    & vercel @vercelArgs --token $env:VERCEL_TOKEN --non-interactive
    if ($LASTEXITCODE -ne 0) { Write-ErrExit ('vercel command failed with exit code {0}.' -f $LASTEXITCODE) }
}

# Add apex and www domains
Write-Host ('Adding apex domain: {0}.space' -f $projectName) -ForegroundColor Cyan
Invoke-Vercel @('domains', 'add', ('{0}.space' -f $projectName), $projectName)

Write-Host ('Adding www domain: www.{0}.space' -f $projectName) -ForegroundColor Cyan
Invoke-Vercel @('domains', 'add', ('www.{0}.space' -f $projectName), $projectName)

$dnsInstructions = @(
    'If Vercel prints DNS records to add, copy them exactly into your registrar (Namecheap) Advanced DNS panel.'
    ''
    'Typical required records:'
    ' - A  @  76.76.21.21'
    ' - CNAME  www  cname.vercel-dns.com'
    ''
    'After adding DNS records wait 5-30 minutes and then run:'
    '  vercel domains inspect quintumnia.space --token $env:VERCEL_TOKEN'
    '  vercel domains inspect www.quintumnia.space --token $env:VERCEL_TOKEN'
) -join [Environment]::NewLine
Write-Host $dnsInstructions -ForegroundColor Green

Write-Host 'Script finished. If any vercel commands failed, review the error above.' -ForegroundColor Green
