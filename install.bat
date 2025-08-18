@echo off
echo Installing dependencies for Digital Twin project...
echo.

if not exist "package.json" (
    echo Error: package.json not found. Make sure you're in the correct directory.
    pause
    exit /b 1
)

echo Running npm install...
npm install

if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to install dependencies.
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo You can now run start.bat to start the development server.
pause