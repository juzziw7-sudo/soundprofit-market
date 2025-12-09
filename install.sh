#!/bin/bash

# SoundProfit Market - Automated Installation Script for Linux/Mac
# Run with: chmod +x install.sh && ./install.sh

echo "========================================"
echo "  SoundProfit Market - Installation"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}Warning: Running as root is not recommended${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check PostgreSQL
echo ""
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL found: $PG_VERSION${NC}"
else
    echo -e "${RED}✗ PostgreSQL not found${NC}"
    echo -e "${YELLOW}Options:${NC}"
    echo "  1. Install PostgreSQL locally"
    echo "  2. Use cloud database (Railway, Supabase, Render)"
    echo ""
    read -p "Continue with cloud database? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo ""
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Root dependencies installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Root dependencies installed${NC}"

cd backend_api
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Backend dependencies installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

# Configure environment
echo ""
echo -e "${YELLOW}[4/6] Configuring environment...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file already exists${NC}"
else
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from template${NC}"
fi

echo ""
echo -e "${YELLOW}IMPORTANT: Please configure your .env file with:${NC}"
echo "  - DATABASE_URL (PostgreSQL connection string)"
echo "  - JWT_SECRET (secure random string)"
echo -e "${CYAN}  - Admin wallet is already set to: 0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402${NC}"
echo ""
read -p "Have you configured the .env file? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please edit .env file and run this script again${NC}"
    if command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "Please edit .env manually"
    fi
    exit 0
fi

# Initialize database
echo ""
echo -e "${YELLOW}[5/6] Initializing database...${NC}"
cd backend_api
node init-db.js
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Database initialization failed${NC}"
    echo -e "${YELLOW}Please check your DATABASE_URL and try again${NC}"
    cd ..
    exit 1
fi
echo -e "${GREEN}✓ Database initialized successfully${NC}"
cd ..

# Complete
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Start the server: npm start"
echo "  2. Open browser: http://localhost:3000"
echo "  3. Login as admin:"
echo -e "     Email: ${YELLOW}admin@soundprofit.market${NC}"
echo -e "     Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "${CYAN}Admin wallet for commissions:${NC}"
echo -e "  ${YELLOW}0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402${NC}"
echo ""
read -p "Start the server now? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    npm start
fi
