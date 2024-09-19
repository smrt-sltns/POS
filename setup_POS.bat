@echo off
setlocal

:: Set the Git repository URL
set "REPO_URL=https://github.com/smrt-sltns/POS"

:: Check if Git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not installed. Please install Git before proceeding.
    pause
    exit /b
)

:: Clone the repository
echo Cloning repository %REPO_URL%...
git clone %REPO_URL%

if %errorlevel% neq 0 (
    echo Failed to clone the repository.
    pause
    exit /b
)

echo Repository cloned successfully.

:: Change directory to the cloned repo (adjust this to the correct folder if needed)
set "REPO_FOLDER=POS"  
cd %REPO_FOLDER%

:: Run the install.bat script
if exist install.bat (
    echo Running install.bat...
    call install.bat
) else (
    echo install.bat not found.
)

pause
