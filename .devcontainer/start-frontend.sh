#!/bin/bash

echo "=========================================="
echo " Starting Frontend"
echo "=========================================="

# Navigate to frontend directory
cd frontend || exit 1

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Running configuration script..."
    bash ../.devcontainer/configure-urls.sh
fi

# Start frontend
echo ""
echo "🚀 Starting frontend on port 5173..."
npm run dev
