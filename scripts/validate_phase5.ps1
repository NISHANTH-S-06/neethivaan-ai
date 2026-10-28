# Neethivaan AI - Phase 5 Validation Script
# This script sets up the environment, installs dependencies, and runs tests.

$ProjectRoot = "D:\Neethivaan"
$VenvPath = "$ProjectRoot\venv"

Write-Host "--- Starting Neethivaan AI Phase 5 Setup & Validation ---" -ForegroundColor Cyan

# 1. Navigate to Project Root
Set-Location $ProjectRoot
Write-Host "Current Location: $(Get-Location)"

# 2. Create Virtual Environment if it doesn't exist
if (-not (Test-Path $VenvPath)) {
    Write-Host "Creating Virtual Environment..." -ForegroundColor Yellow
    python -m venv venv
} else {
    Write-Host "Virtual Environment already exists." -ForegroundColor Green
}

# 3. Activate Virtual Environment
Write-Host "Activating Virtual Environment..." -ForegroundColor Yellow
& "$VenvPath\Scripts\Activate.ps1"

# 4. Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# 5. Install Dependencies
Write-Host "Installing dependencies from backend/requirements.txt..." -ForegroundColor Yellow
python -m pip install -r backend/requirements.txt pytest httpx

# 6. Configure PYTHONPATH
# We need the root, backend, and backend/app in the path for all imports to work
$env:PYTHONPATH = "$ProjectRoot;$ProjectRoot\backend;$ProjectRoot\backend\app"
Write-Host "PYTHONPATH set to: $env:PYTHONPATH" -ForegroundColor Green

# 7. Run Automated Tests
Write-Host "`n--- Running Automated Tests (pytest) ---" -ForegroundColor Cyan
python -m pytest -v backend/tests/test_rag_chat.py
$pytestExitCode = $LASTEXITCODE

# 8. Run Live Endpoint Tests
Write-Host "`n--- Running Live Endpoint Tests (scripts/test_rag_manual.py) ---" -ForegroundColor Cyan
Write-Host "(Note: Ensure Docker containers are running for this to succeed)" -ForegroundColor Gray
python scripts/test_rag_manual.py
$manualExitCode = $LASTEXITCODE

# 9. Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor White
Write-Host "                VALIDATION SUMMARY" -ForegroundColor White
Write-Host ("=" * 60) -ForegroundColor White

if ($pytestExitCode -eq 0) {
    Write-Host "[SUCCESS] Automated Tests Passed" -ForegroundColor Green
} else {
    Write-Host "[FAILURE] Automated Tests Failed (Exit Code: $pytestExitCode)" -ForegroundColor Red
}

if ($manualExitCode -eq 0) {
    Write-Host "[SUCCESS] Live Endpoint Tests Passed" -ForegroundColor Green
} else {
    Write-Host "[FAILURE] Live Endpoint Tests Failed (Exit Code: $manualExitCode)" -ForegroundColor Red
    Write-Host "         Check if Docker containers are running (docker-compose up)" -ForegroundColor Gray
}

Write-Host ("=" * 60) -ForegroundColor White

if ($pytestExitCode -eq 0 -and $manualExitCode -eq 0) {
    Write-Host "Phase 5 Validation COMPLETE: ALL TESTS PASSED." -ForegroundColor Cyan -BackgroundColor DarkBlue
} else {
    Write-Host "Phase 5 Validation INCOMPLETE: One or more tests failed." -ForegroundColor Red
}

Write-Host "`nYou can now close this terminal or continue using the activated venv."
