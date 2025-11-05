#!/bin/bash

echo "=========================================="
echo " Starting Backend"
echo "=========================================="

# Ensure PostgreSQL is running
echo "Checking PostgreSQL..."
sudo service postgresql status > /dev/null 2>&1 || {
    echo "Starting PostgreSQL..."
    sudo service postgresql start
}

# Navigate to backend directory
cd backend || exit 1

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Running configuration script..."
    bash ../.devcontainer/configure-urls.sh
fi

# Start backend
echo ""
echo "🚀 Starting backend on port 5000..."
npm start
