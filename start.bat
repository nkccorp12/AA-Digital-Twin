@echo off
echo Starting Digital Twin development server...
echo.

if not exist "package.json" (
    echo Error: package.json not found. Make sure you're in the correct directory.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Error: node_modules folder not found.
    echo Please run install.bat first to install dependencies.
    pause
    exit /b 1
)

echo Starting Vite development server...
echo The application will open in your browser automatically.
echo Press Ctrl+C to stop the server.
echo.

npm run dev

if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to start the development server.
    echo Please check the console output above for details.
    pause
    exit /b 1
)

pause