#!/bin/bash

# MetalUnion Deployment Script
# This script helps automate the deployment process to Vercel

set -e  # Exit on any error

echo "🎸 MetalUnion Deployment Script 🤘"
echo "=================================="

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if required files exist
print_status "Checking required files..."
required_files=("vercel.json" "supabase-migration.sql" ".env.example" "DEPLOYMENT_GUIDE.md")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found!"
        exit 1
    fi
done
print_success "All required files found"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Please copy .env.example to .env and fill in your values."
    echo "Would you like to copy .env.example to .env now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your actual values before continuing"
        exit 0
    fi
fi

# Check if Node.js and npm are installed
print_status "Checking Node.js and npm..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js $(node --version) and npm $(npm --version) are installed"

# Check if Vercel CLI is installed
print_status "Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed."
    echo "Would you like to install it now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        npm install -g vercel
        print_success "Vercel CLI installed"
    else
        print_error "Vercel CLI is required for deployment. Please install it with: npm install -g vercel"
        exit 1
    fi
else
    print_success "Vercel CLI is installed"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Run TypeScript check
print_status "Running TypeScript check..."
npm run check
print_success "TypeScript check passed"

# Test build
print_status "Testing production build..."
npm run build
print_success "Production build successful"

# Check environment variables
print_status "Checking environment variables..."
source .env 2>/dev/null || true

required_env_vars=("DATABASE_URL")
missing_vars=()

for var in "${required_env_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables: ${missing_vars[*]}"
    print_warning "Please update your .env file with the missing variables"
    exit 1
fi
print_success "Environment variables check passed"

# Ask for deployment type
echo ""
echo "Choose deployment type:"
echo "1) Preview deployment (for testing)"
echo "2) Production deployment"
echo "3) Just run pre-deployment checks (no deploy)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_status "Starting preview deployment..."
        vercel
        print_success "Preview deployment completed!"
        ;;
    2)
        print_warning "This will deploy to production. Are you sure? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_status "Starting production deployment..."
            vercel --prod
            print_success "Production deployment completed!"
        else
            print_status "Production deployment cancelled"
        fi
        ;;
    3)
        print_success "Pre-deployment checks completed successfully!"
        print_status "Your app is ready for deployment. Run 'vercel' for preview or 'vercel --prod' for production."
        ;;
    *)
        print_error "Invalid choice. Please run the script again and choose 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
print_success "Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check your deployment URL"
echo "2. Verify all features work correctly"
echo "3. Set up monitoring and alerts"
echo "4. Configure your custom domain (if needed)"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - DEPLOYMENT_GUIDE.md"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🎸 Rock on! Your MetalUnion app is ready to serve the metal community! 🤘"
