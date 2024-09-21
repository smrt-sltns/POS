@echo off
:: Check for administrative privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script requires administrative privileges. Please run it as Administrator.
    pause
    exit /b
)

:: Check if Chocolatey is installed
where choco >nul 2>nul
if %errorlevel% neq 0 (
    echo Chocolatey is not installed. Please install Chocolatey before proceeding.
    pause
    exit /b
)

:: Install Node.js version 18.19.1 using Chocolatey  // 18.19.1 is the old version. if there is a problem, just go back to this one
echo Installing Node.js v20.16.0 using Chocolatey...
choco install nodejs --version=20.16.0 -y
if %errorlevel% neq 0 (
    echo Error: Failed to install Node.js via Chocolatey.
    pause
    exit /b
)

:: Check if Node.js and npm were installed correctly
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js installation failed.
    pause
    exit /b
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm installation failed. Please check the Node.js installation.
    pause
    exit /b
)

echo Node.js and npm installed successfully.
pause
exit /b
