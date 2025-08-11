@echo off
REM Brenda Cereals Deployment Script for Windows
REM Usage: deploy.bat [platform]

setlocal enabledelayedexpansion

REM Set colors for output
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check prerequisites
:check_prerequisites
call :print_status "Checking prerequisites..."

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Node.js is not installed. Please install Node.js 20.x or later."
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
set NODE_VERSION=!NODE_VERSION:~1,2!
if !NODE_VERSION! lss 20 (
    call :print_error "Node.js version 20.x or later is required. Current version: !NODE_VERSION!"
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "npm is not installed. Please install npm."
    exit /b 1
)

REM Check if Docker is installed (for Docker deployment)
if "%~1"=="docker" (
    where docker >nul 2>&1
    if %errorlevel% neq 0 (
        call :print_error "Docker is not installed. Please install Docker Desktop."
        exit /b 1
    )
)

call :print_success "Prerequisites check passed"
goto :eof

REM Function to build the application
:build_app
call :print_status "Building application..."

REM Install dependencies
call :print_status "Installing dependencies..."
call npm run install-all
if %errorlevel% neq 0 (
    call :print_error "Failed to install dependencies"
    exit /b 1
)

REM Build packages
call :print_status "Building packages..."
call npm run build:packages
if %errorlevel% neq 0 (
    call :print_error "Failed to build packages"
    exit /b 1
)

REM Build web application
call :print_status "Building web application..."
cd apps\web
call npm run build
if %errorlevel% neq 0 (
    call :print_error "Failed to build web application"
    exit /b 1
)
cd ..\..

call :print_success "Application built successfully"
goto :eof

REM Function to deploy to Docker
:deploy_docker
call :print_status "Deploying to Docker..."

REM Build Docker image
call :print_status "Building Docker image..."
call npm run docker:build
if %errorlevel% neq 0 (
    call :print_error "Failed to build Docker image"
    exit /b 1
)

REM Run with Docker Compose
call :print_status "Starting services with Docker Compose..."
call npm run docker:prod
if %errorlevel% neq 0 (
    call :print_error "Failed to start Docker services"
    exit /b 1
)

call :print_success "Docker deployment completed"
call :print_status "Application is running at http://localhost:3000"
goto :eof

REM Function to deploy to Vercel
:deploy_vercel
call :print_status "Deploying to Vercel..."

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    call :print_status "Installing Vercel CLI..."
    call npm install -g vercel
    if %errorlevel% neq 0 (
        call :print_error "Failed to install Vercel CLI"
        exit /b 1
    )
)

REM Deploy to Vercel
cd apps\web
call vercel --prod --yes
if %errorlevel% neq 0 (
    call :print_error "Failed to deploy to Vercel"
    exit /b 1
)
cd ..\..

call :print_success "Vercel deployment completed"
goto :eof

REM Function to deploy to GitHub Pages
:deploy_github_pages
call :print_status "Deploying to GitHub Pages..."

REM Build and export
cd apps\web
call npm run build
if %errorlevel% neq 0 (
    call :print_error "Failed to build application"
    exit /b 1
)

REM Deploy to gh-pages
call npx gh-pages -d .next
if %errorlevel% neq 0 (
    call :print_error "Failed to deploy to GitHub Pages"
    exit /b 1
)
cd ..\..

call :print_success "GitHub Pages deployment completed"
goto :eof

REM Function to deploy to AWS
:deploy_aws
call :print_status "Deploying to AWS..."

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "AWS CLI is not installed. Please install AWS CLI."
    exit /b 1
)

REM Check AWS credentials
call aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "AWS credentials not configured. Please run 'aws configure'."
    exit /b 1
)

REM Build Docker image
call :print_status "Building Docker image for AWS..."
call npm run docker:build
if %errorlevel% neq 0 (
    call :print_error "Failed to build Docker image"
    exit /b 1
)

call :print_success "AWS deployment completed"
goto :eof

REM Function to show help
:show_help
echo Brenda Cereals Deployment Script for Windows
echo.
echo Usage: deploy.bat [platform]
echo.
echo Platforms:
echo   docker        Deploy using Docker and Docker Compose
echo   vercel        Deploy to Vercel
echo   github-pages  Deploy to GitHub Pages
echo   aws           Deploy to AWS ECR/ECS
echo   all           Deploy to all platforms
echo.
echo Examples:
echo   deploy.bat docker
echo   deploy.bat vercel
echo   deploy.bat all
echo.
echo Environment Variables:
echo   Set required environment variables before deployment
echo   See DEPLOYMENT-GUIDE.md for details
goto :eof

REM Main deployment logic
set PLATFORM=%1
if "%PLATFORM%"=="" set PLATFORM=help

if "%PLATFORM%"=="docker" (
    call :check_prerequisites docker
    if %errorlevel% neq 0 exit /b 1
    call :build_app
    if %errorlevel% neq 0 exit /b 1
    call :deploy_docker
    if %errorlevel% neq 0 exit /b 1
) else if "%PLATFORM%"=="vercel" (
    call :check_prerequisites
    if %errorlevel% neq 0 exit /b 1
    call :build_app
    if %errorlevel% neq 0 exit /b 1
    call :deploy_vercel
    if %errorlevel% neq 0 exit /b 1
) else if "%PLATFORM%"=="github-pages" (
    call :check_prerequisites
    if %errorlevel% neq 0 exit /b 1
    call :build_app
    if %errorlevel% neq 0 exit /b 1
    call :deploy_github_pages
    if %errorlevel% neq 0 exit /b 1
) else if "%PLATFORM%"=="aws" (
    call :check_prerequisites aws
    if %errorlevel% neq 0 exit /b 1
    call :build_app
    if %errorlevel% neq 0 exit /b 1
    call :deploy_aws
    if %errorlevel% neq 0 exit /b 1
) else if "%PLATFORM%"=="all" (
    call :check_prerequisites aws
    if %errorlevel% neq 0 exit /b 1
    call :build_app
    if %errorlevel% neq 0 exit /b 1
    call :deploy_docker
    if %errorlevel% neq 0 exit /b 1
    call :deploy_vercel
    if %errorlevel% neq 0 exit /b 1
    call :deploy_github_pages
    if %errorlevel% neq 0 exit /b 1
    call :deploy_aws
    if %errorlevel% neq 0 exit /b 1
) else (
    call :show_help
    exit /b 0
)

call :print_success "Deployment completed successfully!"
exit /b 0
