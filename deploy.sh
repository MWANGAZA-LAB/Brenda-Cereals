#!/bin/bash

# Brenda Cereals Deployment Script
# Usage: ./deploy.sh [platform]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20.x or later."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_error "Node.js version 20.x or later is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check if Docker is installed (for Docker deployment)
    if [ "$1" = "docker" ] || [ "$1" = "aws" ]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed. Please install Docker."
            exit 1
        fi
    fi
    
    print_success "Prerequisites check passed"
}

# Function to build the application
build_app() {
    print_status "Building application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm run install-all
    
    # Build packages
    print_status "Building packages..."
    npm run build:packages
    
    # Build web application
    print_status "Building web application..."
    cd apps/web
    npm run build
    cd ../..
    
    print_success "Application built successfully"
}

# Function to deploy to Docker
deploy_docker() {
    print_status "Deploying to Docker..."
    
    # Build Docker image
    print_status "Building Docker image..."
    npm run docker:build
    
    # Run with Docker Compose
    print_status "Starting services with Docker Compose..."
    npm run docker:prod
    
    print_success "Docker deployment completed"
    print_status "Application is running at http://localhost:3000"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    cd apps/web
    vercel --prod --yes
    cd ../..
    
    print_success "Vercel deployment completed"
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    print_status "Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    if ! command -v npx &> /dev/null; then
        print_error "npx is not available. Please ensure Node.js is properly installed."
        exit 1
    fi
    
    # Build and export
    cd apps/web
    npm run build
    
    # Check if export script exists
    if grep -q "export" package.json; then
        npm run export
        DEPLOY_DIR="out"
    else
        # For Next.js 13+ with static export
        DEPLOY_DIR=".next"
    fi
    
    # Deploy to gh-pages
    npx gh-pages -d $DEPLOY_DIR
    cd ../..
    
    print_success "GitHub Pages deployment completed"
}

# Function to deploy to AWS
deploy_aws() {
    print_status "Deploying to AWS..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure'."
        exit 1
    fi
    
    # Build Docker image
    print_status "Building Docker image for AWS..."
    npm run docker:build
    
    # Get ECR login token
    print_status "Logging into ECR..."
    ECR_REGISTRY=$(aws ecr describe-registry --query 'registryUri' --output text)
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Tag and push image
    print_status "Pushing image to ECR..."
    docker tag brenda-cereals:latest $ECR_REGISTRY/brenda-cereals:latest
    docker push $ECR_REGISTRY/brenda-cereals:latest
    
    print_success "AWS deployment completed"
}

# Function to show help
show_help() {
    echo "Brenda Cereals Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [platform]"
    echo ""
    echo "Platforms:"
    echo "  docker        Deploy using Docker and Docker Compose"
    echo "  vercel        Deploy to Vercel"
    echo "  github-pages  Deploy to GitHub Pages"
    echo "  aws           Deploy to AWS ECR/ECS"
    echo "  all           Deploy to all platforms"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh docker"
    echo "  ./deploy.sh vercel"
    echo "  ./deploy.sh all"
    echo ""
    echo "Environment Variables:"
    echo "  Set required environment variables before deployment"
    echo "  See DEPLOYMENT-GUIDE.md for details"
}

# Main deployment logic
main() {
    PLATFORM=${1:-"help"}
    
    case $PLATFORM in
        "docker")
            check_prerequisites "docker"
            build_app
            deploy_docker
            ;;
        "vercel")
            check_prerequisites
            build_app
            deploy_vercel
            ;;
        "github-pages")
            check_prerequisites
            build_app
            deploy_github_pages
            ;;
        "aws")
            check_prerequisites "aws"
            build_app
            deploy_aws
            ;;
        "all")
            check_prerequisites "aws"
            build_app
            deploy_docker
            deploy_vercel
            deploy_github_pages
            deploy_aws
            ;;
        "help"|*)
            show_help
            exit 0
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@"
