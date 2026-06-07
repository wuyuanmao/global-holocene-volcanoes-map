$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 8765
$PythonCandidates = @(
  "C:\Users\12059\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe",
  "C:\ProgramData\Anaconda3\python.exe"
)

$Python = $PythonCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $Python) {
  $Python = "python"
}

Write-Host "Serving Global Holocene Volcanoes Web Map"
Write-Host "Folder: $Root"
Write-Host "Open: http://localhost:$Port"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server."

& $Python "$Root\start_server.py"
