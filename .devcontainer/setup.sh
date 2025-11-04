#!/bin/bash

echo "=========================================="
echo " Setting up CoopeSuma Management System"
echo "=========================================="

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Create .env file for Codespaces
echo "Creating .env file for Codespaces..."
cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cooplinkcr
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cooplinkcr

# JWT Configuration
JWT_SECRET=codespaces-test-jwt-secret-key
JWT_EXPIRES_IN=24h

# Bcrypt Configuration
BCRYPT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug
EOF

cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup PostgreSQL
echo "Setting up PostgreSQL..."
sudo service postgresql start

# Wait for PostgreSQL to be ready
sleep 3

# Create database
echo "Creating database..."
sudo -u postgres psql -c "CREATE DATABASE cooplinkcr;" 2>/dev/null || echo "Database might already exist"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

echo "=========================================="
echo " Setup completed!"
echo "=========================================="
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Note: You may need to manually import your database schema"
echo "=========================================="
