@echo off
setlocal EnableExtensions
cd /d "%~dp0"
where node >nul 2>&1 || (echo Node.js 22 or newer is required. & pause & exit /b 1)
where npm >nul 2>&1 || (echo npm was not found. & pause & exit /b 1)
for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set "NODE_MAJOR=%%V"
if not defined NODE_MAJOR (echo Could not detect the Node.js version. & pause & exit /b 1)
if %NODE_MAJOR% LSS 22 (echo Install Node.js 22 LTS or newer, then retry. & pause & exit /b 1)

rem Vite embeds these public settings into the static bundle at build time.
if not exist ".env.local" goto :warn_cloud
findstr /B /C:"VITE_SUPABASE_URL=" ".env.local" >nul
if errorlevel 1 goto :warn_cloud
findstr /B /C:"VITE_SUPABASE_ANON_KEY=" ".env.local" >nul
if errorlevel 1 goto :warn_cloud
findstr /C:"YOUR_PROJECT" /C:"YOUR_PUBLIC_ANON_KEY" ".env.local" >nul
if not errorlevel 1 goto :warn_cloud
goto :install

:warn_cloud
echo.
echo WARNING: Supabase settings are missing or still contain example placeholders.
echo Without real settings, the build will use localStorage and will NOT sync between devices.
echo Configure .env.local from .env.example before production use.
echo.
choice /C YN /N /M "Continue with a local-only build anyway? [Y/N]: "
if errorlevel 2 exit /b 1

:install
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies...
  call npm ci
  if errorlevel 1 (echo Dependency installation failed. & pause & exit /b 1)
)
echo Building the Cloudflare Pages site...
call npm run build
if errorlevel 1 (echo Build failed. & pause & exit /b 1)
echo.
echo Done. Upload the CONTENTS of this folder in Cloudflare Pages:
echo %~dp0dist
start "" explorer "%~dp0dist"
echo.
echo Direct Upload does not publish until you confirm the upload in Cloudflare.
pause
