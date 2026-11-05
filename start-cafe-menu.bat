@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
set "PORT_FILE=%~dp0.cafe-menu-port.txt"

rem The elevated child receives its port directly and does not ask questions.
if /I "%~1"=="--firewall-setup" (
  set "PORT=%~2"
  set "RULE_NAME=CafeMenuVitePort-!PORT!"
  goto :firewall_admin
)

if exist "%PORT_FILE%" (
  set "PORT="
  set /p "PORT="<"%PORT_FILE%"
  echo The saved port is !PORT!.
  choice /C YN /N /M "Reuse it? [Y/N]: "
  if errorlevel 2 goto :choose_port
) else (
  goto :choose_port
)
goto :port_ready

:choose_port
set "PORT="
set /p "PORT=Enter port number (default 5173): "
if not defined PORT set "PORT=5173"
powershell -NoProfile -Command "try { $p=[int]$env:PORT; if ($p -lt 1 -or $p -gt 65535) { exit 1 }; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo Invalid port. Enter a number from 1 to 65535.
  goto :choose_port
)

:save_port
>"%PORT_FILE%" echo !PORT!

:port_ready
powershell -NoProfile -Command "try { $p=[int]$env:PORT; if ($p -lt 1 -or $p -gt 65535) { exit 1 }; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo Saved port is invalid. Choose a new port.
  goto :choose_port
)
set "RULE_NAME=CafeMenuVitePort-!PORT!"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 22 or newer was not found. Install Node.js once, then run this file again.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js with npm, then run this file again.
  pause
  exit /b 1
)
for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set "NODE_MAJOR=%%V"
if not defined NODE_MAJOR (
  echo Could not detect the Node.js version.
  pause
  exit /b 1
)
if !NODE_MAJOR! LSS 22 (
  echo Node.js 22 or newer is required. Install Node.js 22 LTS once, then run this file again.
  pause
  exit /b 1
)
if not exist "package.json" (
  echo package.json was not found. Keep this file inside the cafe-menu project folder.
  pause
  exit /b 1
)

rem Create/update the port-specific rule only when it is missing.
netsh advfirewall firewall show rule name="!RULE_NAME!" >nul 2>&1
if errorlevel 1 (
  echo.
  echo Windows will ask once for Administrator approval to allow TCP !PORT! from the local subnet.
  echo This rule is limited to LocalSubnet; no network profile is changed.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -ArgumentList '--firewall-setup !PORT!' -Verb RunAs -Wait"
  netsh advfirewall firewall show rule name="!RULE_NAME!" >nul 2>&1
  if errorlevel 1 (
    echo.
    echo [X] Firewall rule was not confirmed. The app can run here, but other devices may be blocked.
    echo Run this file again and approve the Administrator prompt.
  ) else (
    echo Firewall rule is in place for TCP !PORT!.
  )
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies automatically...
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed. Check internet access and retry.
    pause
    exit /b 1
  )
)

set "LAN_IP="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1).IPv4Address.IPAddress" 2^>nul`) do set "LAN_IP=%%I"
echo.
echo Cafe menu starting on port !PORT!.
echo This window must stay open while the menu is running.
echo On this computer: http://localhost:!PORT!/
if defined LAN_IP echo On phones on the same Wi-Fi: http://!LAN_IP!:!PORT!/
if defined LAN_IP echo Admin panel: http://!LAN_IP!:!PORT!/admin
echo.
echo If phones cannot connect, check Guest Wi-Fi, VPN, and router client isolation.
echo.
call npm run dev -- --host 0.0.0.0 --port !PORT! --strictPort
if errorlevel 1 (
  echo.
  echo The server stopped. The selected port may already be in use.
  pause
)
exit /b

:firewall_admin
echo Setting Windows Firewall for TCP port !PORT! from LocalSubnet only...
rem Remove only inbound Block rules tied to the Node.js executable being used; such a rule overrides port allows.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$node=(Get-Command node.exe).Source; $r=Get-NetFirewallApplicationFilter -ErrorAction SilentlyContinue | Where-Object { $_.Program -eq $node } | Get-NetFirewallRule -ErrorAction SilentlyContinue | Where-Object { $_.Action -eq 'Block' -and $_.Direction -eq 'Inbound' }; if ($r) { $r | Remove-NetFirewallRule }"
rem Remove only old Cafe Menu port rules; leave unrelated firewall rules untouched.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetFirewallRule -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like 'CafeMenuVitePort-*' -and $_.Group -eq 'Cafe Digital Menu' } | Remove-NetFirewallRule"
set "RULE_NAME=CafeMenuVitePort-!PORT!"
netsh advfirewall firewall add rule name="!RULE_NAME!" dir=in action=allow enable=yes protocol=TCP localport=!PORT! remoteip=localsubnet profile=any group="Cafe Digital Menu" >nul 2>&1
if errorlevel 1 (
  echo Firewall rule creation failed.
  exit /b 1
)
netsh advfirewall firewall show rule name="!RULE_NAME!" | findstr /I "Rule Enabled Profiles Direction Action LocalPort RemoteIP"
echo Firewall setup finished.
exit /b 0
