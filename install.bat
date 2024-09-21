@echo off
setlocal

:: Check if Node.js (npm) is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Installing it right now...
    call powershell -Command "Start-Process cmd -ArgumentList '/c install_node.bat' -Verb RunAs"
    pause
    exit /b
)

:: Install Yarn globally if it's not installed
echo Checking if Yarn is installed...
where yarn >nul 2>nul
if %errorlevel% neq 0 (
    echo Yarn is not installed. Installing Yarn...
    call npm install -g yarn
    if %errorlevel% neq 0 (
        echo Error: Yarn installation failed.
        pause
        exit /b
    )
)

:: Install dependencies
echo Running yarn install...
call yarn install
if %errorlevel% neq 0 (
    echo Error: yarn install failed.
    pause
    exit /b
)

echo Installing electron-packager...
call npm install -g electron-packager
if %errorlevel% neq 0 (
    echo Error: yarn install failed.
    pause
    exit /b
)

:: Run the packaging script
echo Running yarn run package-win...
call yarn run package-win
if %errorlevel% neq 0 (
    echo Error: yarn run package-win failed.
    pause
    exit /b
)

:: Create a shortcut on the Desktop
echo Creating a shortcut on the Desktop...

:: Define the paths (update these with your specific paths)
set TARGET_PATH=%cd%\release-builds\POS-win32-x64\POS.exe
set SHORTCUT_NAME=POS.lnk
set SHORTCUT_PATH=%USERPROFILE%\Desktop\%SHORTCUT_NAME%

:: Check if the OneDrive exists
if exist "%USERPROFILE%\OneDrive\Desktop" (
    set SHORTCUT_PATH=%USERPROFILE%\OneDrive\Desktop\%SHORTCUT_NAME%
)

:: Check if the executable exists
if not exist "%TARGET_PATH%" (
    echo Error: %TARGET_PATH% not found.
    pause
    exit /b
)

:: Use PowerShell to create the shortcut
call powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_PATH%'; $s.Save()"

if %errorlevel% neq 0 (
    echo Error: Failed to create the shortcut.
    pause
    exit /b
)

echo Shortcut created on the Desktop.
pause
