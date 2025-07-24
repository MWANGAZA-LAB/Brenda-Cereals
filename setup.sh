#!/bin/bash
# Comprehensive setup script for Brenda Cereals

echo "🚀 Brenda Cereals - Comprehensive Setup"
echo "======================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js installation
if command_exists node; then
    echo "✅ Node.js $(node --version) is installed"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check npm installation
if command_exists npm; then
    echo "✅ npm $(npm --version) is installed"
else
    echo "❌ npm is not installed"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install web app dependencies
echo ""
echo "📦 Installing web app dependencies..."
cd apps/web
npm install

# Run type checking
echo ""
echo "🔍 Running type checking..."
npx tsc --noEmit

# Run linting
echo ""
echo "🔧 Running linting..."
npm run lint --fix

# Run tests
echo ""
echo "🧪 Running tests..."
npm test -- --passWithNoTests

# Build the application
echo ""
echo "🏗️ Building application..."
npm run build

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "  • Start development: npm run dev"
echo "  • Start production:  npm run start"
echo "  • Run tests:         npm test"
echo "  • View health:       http://localhost:3001/api/health"
