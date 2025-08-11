# Brenda Cereals Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1 [platform]

param(
    [Parameter(Position=0)]
    [string]$Platform = "help"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check prerequisites
function Test-Prerequisites {
    param([string]$DeploymentType)
    
    Write-Status "Checking prerequisites..."
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Status "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 20.x or later."
        exit 1
    }
    
    # Check Node.js version
    $majorVersion = [int]($nodeVersion -replace 'v', '' -split '\.' | Select-Object -First 1)
    if ($majorVersion -lt 20) {
        Write-Error "Node.js version 20.x or later is required. Current version: $nodeVersion"
        exit 1
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version
        Write-Status "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed. Please install npm."
        exit 1
    }
    
    # Check if Docker is installed (for Docker deployment)
    if ($DeploymentType -eq "docker" -or $DeploymentType -eq "aws") {
        try {
            $dockerVersion = docker --version
            Write-Status "Docker version: $dockerVersion"
        }
        catch {
            Write-Error "Docker is not installed. Please install Docker Desktop."
            exit 1
        }
    }
    
    Write-Success "Prerequisites check passed"
}

# Function to build the application
function Build-Application {
    Write-Status "Building application..."
    
    # Install dependencies
    Write-Status "Installing dependencies..."
    npm run install-all
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    
    # Build packages
    Write-Status "Building packages..."
    npm run build:packages
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build packages"
        exit 1
    }
    
    # Build web application
    Write-Status "Building web application..."
    Push-Location apps\web
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build web application"
        exit 1
    }
    Pop-Location
    
    Write-Success "Application built successfully"
}

# Function to deploy to Docker
function Deploy-Docker {
    Write-Status "Deploying to Docker..."
    
    # Build Docker image
    Write-Status "Building Docker image..."
    npm run docker:build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build Docker image"
        exit 1
    }
    
    # Run with Docker Compose
    Write-Status "Starting services with Docker Compose..."
    npm run docker:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start Docker services"
        exit 1
    }
    
    Write-Success "Docker deployment completed"
    Write-Status "Application is running at http://localhost:3000"
}

# Function to deploy to Vercel
function Deploy-Vercel {
    Write-Status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    try {
        $vercelVersion = vercel --version
        Write-Status "Vercel CLI version: $vercelVersion"
    }
    catch {
        Write-Status "Installing Vercel CLI..."
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install Vercel CLI"
            exit 1
        }
    }
    
    # Deploy to Vercel
    Push-Location apps\web
    vercel --prod --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy to Vercel"
        exit 1
    }
    Pop-Location
    
    Write-Success "Vercel deployment completed"
}

# Function to deploy to GitHub Pages
function Deploy-GitHubPages {
    Write-Status "Deploying to GitHub Pages..."
    
    # Build and export
    Push-Location apps\web
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build application"
        exit 1
    }
    
    # Deploy to gh-pages
    npx gh-pages -d .next
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy to GitHub Pages"
        exit 1
    }
    Pop-Location
    
    Write-Success "GitHub Pages deployment completed"
}

# Function to deploy to AWS
function Deploy-AWS {
    Write-Status "Deploying to AWS..."
    
    # Check if AWS CLI is installed
    try {
        $awsVersion = aws --version
        Write-Status "AWS CLI version: $awsVersion"
    }
    catch {
        Write-Error "AWS CLI is not installed. Please install AWS CLI."
        exit 1
    }
    
    # Check AWS credentials
    try {
        aws sts get-caller-identity | Out-Null
        Write-Status "AWS credentials verified"
    }
    catch {
        Write-Error "AWS credentials not configured. Please run 'aws configure'."
        exit 1
    }
    
    # Build Docker image
    Write-Status "Building Docker image for AWS..."
    npm run docker:build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build Docker image"
        exit 1
    }
    
    Write-Success "AWS deployment completed"
}

# Function to show help
function Show-Help {
    Write-Host "Brenda Cereals Deployment Script for Windows PowerShell" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [platform]" -ForegroundColor White
    Write-Host ""
    Write-Host "Platforms:" -ForegroundColor Yellow
    Write-Host "  docker        Deploy using Docker and Docker Compose" -ForegroundColor White
    Write-Host "  vercel        Deploy to Vercel" -ForegroundColor White
    Write-Host "  github-pages  Deploy to GitHub Pages" -ForegroundColor White
    Write-Host "  aws           Deploy to AWS ECR/ECS" -ForegroundColor White
    Write-Host "  all           Deploy to all platforms" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 docker" -ForegroundColor White
    Write-Host "  .\deploy.ps1 vercel" -ForegroundColor White
    Write-Host "  .\deploy.ps1 all" -ForegroundColor White
    Write-Host ""
    Write-Host "Environment Variables:" -ForegroundColor Yellow
    Write-Host "  Set required environment variables before deployment" -ForegroundColor White
    Write-Host "  See DEPLOYMENT-GUIDE.md for details" -ForegroundColor White
}

# Main deployment logic
try {
    switch ($Platform.ToLower()) {
        "docker" {
            Test-Prerequisites "docker"
            Build-Application
            Deploy-Docker
        }
        "vercel" {
            Test-Prerequisites
            Build-Application
            Deploy-Vercel
        }
        "github-pages" {
            Test-Prerequisites
            Build-Application
            Deploy-GitHubPages
        }
        "aws" {
            Test-Prerequisites "aws"
            Build-Application
            Deploy-AWS
        }
        "all" {
            Test-Prerequisites "aws"
            Build-Application
            Deploy-Docker
            Deploy-Vercel
            Deploy-GitHubPages
            Deploy-AWS
        }
        default {
            Show-Help
            exit 0
        }
    }
    
    Write-Success "Deployment completed successfully!"
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}
