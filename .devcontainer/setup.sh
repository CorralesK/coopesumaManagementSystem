#!/bin/bash

echo "=========================================="
echo " Setting up CoopeSuma Management System"
echo "=========================================="

# Ensure we're in the right directory
cd /workspaces/coopesumaManagementSystem 2>/dev/null || cd /workspace 2>/dev/null || cd ~

# Verify Node.js installation
echo "Checking Node.js installation..."
node --version
npm --version

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend || exit 1
npm install || {
    echo "❌ Failed to install backend dependencies"
    exit 1
}
echo "✓ Backend dependencies installed"

cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend || exit 1
npm install || {
    echo "❌ Failed to install frontend dependencies"
    exit 1
}
echo "✓ Frontend dependencies installed"

cd ..

# Setup PostgreSQL
echo ""
echo "🗄️  Setting up PostgreSQL..."
sudo service postgresql start || {
    echo "⚠️  PostgreSQL might not be installed via apt, trying alternative..."
    pg_ctl -D /usr/local/var/postgres start 2>/dev/null
}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Create database and user
echo "Creating database..."
sudo -u postgres psql -c "CREATE DATABASE cooplinkcr;" 2>/dev/null || echo "⚠️  Database might already exist"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>/dev/null

echo ""
echo "=========================================="
echo " ✓ Initial setup completed!"
echo "=========================================="
echo ""
echo "📝 Environment files will be configured automatically"
echo ""
echo "⚠️  IMPORTANT: You need to import your database schema"
echo "   If you have a SQL dump file, run:"
echo "   sudo -u postgres psql cooplinkcr < your_schema.sql"
echo ""
echo "=========================================="
