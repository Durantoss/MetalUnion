@echo off
setlocal enabledelayedexpansion

REM MetalUnion Deployment Script for Windows
REM This script helps automate the deployment process to Vercel

echo 🎸 MetalUnion Deployment Script 🤘
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if required files exist
echo [INFO] Checking required files...
set "missing_files="
if not exist "vercel.json" set "missing_files=!missing_files! vercel.json"
if not exist "supabase-migration.sql" set "missing_files=!missing_files! supabase-migration.sql"
if not exist ".env.example" set "missing_files=!missing_files! .env.example"
if not exist "DEPLOYMENT_GUIDE.md" set "missing_files=!missing_files! DEPLOYMENT_GUIDE.md"

if not "!missing_files!"=="" (
    echo [ERROR] Required files not found:!missing_files!
    pause
    exit /b 1
)
echo [SUCCESS] All required files found

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found. Please copy .env.example to .env and fill in your values.
    set /p response="Would you like to copy .env.example to .env now? (y/n): "
    if /i "!response!"=="y" (
        copy ".env.example" ".env" >nul
        echo [SUCCESS] Created .env file from template
        echo [WARNING] Please edit .env file with your actual values before continuing
        pause
        exit /b 0
    )
)

REM Check if Node.js and npm are installed
echo [INFO] Checking Node.js and npm...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("!NODE_VERSION!") do set MAJOR_VERSION=%%i
if !MAJOR_VERSION! LSS 18 (
    echo [ERROR] Node.js version 18+ is required. Current version: !NODE_VERSION!
    pause
    exit /b 1
)
echo [SUCCESS] Node.js and npm are installed

REM Check if Vercel CLI is installed
echo [INFO] Checking Vercel CLI...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Vercel CLI is not installed.
    set /p response="Would you like to install it now? (y/n): "
    if /i "!response!"=="y" (
        npm install -g vercel
        echo [SUCCESS] Vercel CLI installed
    ) else (
        echo [ERROR] Vercel CLI is required for deployment. Please install it with: npm install -g vercel
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] Vercel CLI is installed
)

REM Install dependencies
echo [INFO] Installing dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed

REM Run TypeScript check
echo [INFO] Running TypeScript check...
npm run check
if errorlevel 1 (
    echo [ERROR] TypeScript check failed
    pause
    exit /b 1
)
echo [SUCCESS] TypeScript check passed

REM Test build
echo [INFO] Testing production build...
npm run build
if errorlevel 1 (
    echo [ERROR] Production build failed
    pause
    exit /b 1
)
echo [SUCCESS] Production build successful

REM Check environment variables
echo [INFO] Checking environment variables...
if not exist ".env" (
    echo [ERROR] .env file not found
    pause
    exit /b 1
)

findstr /c:"DATABASE_URL=" ".env" >nul
if errorlevel 1 (
    echo [ERROR] DATABASE_URL not found in .env file
    echo [WARNING] Please update your .env file with the missing variables
    pause
    exit /b 1
)
echo [SUCCESS] Environment variables check passed

REM Ask for deployment type
echo.
echo Choose deployment type:
echo 1) Preview deployment (for testing)
echo 2) Production deployment
echo 3) Just run pre-deployment checks (no deploy)
echo.
set /p choice="Enter your choice (1-3): "

if "!choice!"=="1" (
    echo [INFO] Starting preview deployment...
    vercel
    echo [SUCCESS] Preview deployment completed!
) else if "!choice!"=="2" (
    set /p response="This will deploy to production. Are you sure? (y/n): "
    if /i "!response!"=="y" (
        echo [INFO] Starting production deployment...
        vercel --prod
        echo [SUCCESS] Production deployment completed!
    ) else (
        echo [INFO] Production deployment cancelled
    )
) else if "!choice!"=="3" (
    echo [SUCCESS] Pre-deployment checks completed successfully!
    echo [INFO] Your app is ready for deployment. Run 'vercel' for preview or 'vercel --prod' for production.
) else (
    echo [ERROR] Invalid choice. Please run the script again and choose 1, 2, or 3.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployment script completed!
echo.
echo 📋 Next steps:
echo 1. Check your deployment URL
echo 2. Verify all features work correctly
echo 3. Set up monitoring and alerts
echo 4. Configure your custom domain (if needed)
echo.
echo 📚 For detailed instructions, see:
echo    - DEPLOYMENT_GUIDE.md
echo    - DEPLOYMENT_CHECKLIST.md
echo.
echo 🎸 Rock on! Your MetalUnion app is ready to serve the metal community! 🤘
pause
