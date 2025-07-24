@echo off
echo.
echo 🌾 Brenda Cereals - Immediate Setup
echo ===================================
echo.

:: Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo After installation, restart your terminal and run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

:: Install root dependencies
echo.
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

:: Install web app dependencies
echo.
echo Installing web app dependencies...
cd apps\web
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install web app dependencies
    pause
    exit /b 1
)

:: Go back to root
cd ..\..

:: Install package dependencies
echo.
echo Installing shared packages dependencies...

cd packages\types
call npm install
cd ..\ui
call npm install  
cd ..\utils
call npm install
cd ..\..

:: Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo Creating .env file from template...
    copy .env.example .env
    echo ✅ Created .env file - please edit it with your database settings
) else (
    echo ✅ .env file already exists
)

:: Generate Prisma client
echo.
echo Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ⚠️ Prisma generation failed - you may need to configure your database first
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your database connection string
echo 2. Run: npm run dev (to start development server)
echo 3. Run: npm run build (to build for production)
echo.
echo For deployment instructions, see DEPLOYMENT.md
echo.
pause
