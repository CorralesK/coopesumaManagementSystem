#!/bin/bash

echo "=========================================="
echo " Configuring URLs for Codespaces"
echo "=========================================="

# Get Codespace name from environment
CODESPACE_NAME=${CODESPACE_NAME:-""}

if [ -z "$CODESPACE_NAME" ]; then
    echo "⚠️  Not running in Codespaces, using localhost URLs"
    BACKEND_URL="http://localhost:5000"
    FRONTEND_URL="http://localhost:5173"
else
    echo "✓ Running in Codespaces: $CODESPACE_NAME"
    # Codespaces URL format: https://{codespace-name}-{port}.preview.app.github.dev
    BACKEND_URL="https://${CODESPACE_NAME}-5000.app.github.dev"
    FRONTEND_URL="https://${CODESPACE_NAME}-5173.app.github.dev"
fi

echo ""
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Configure backend .env
echo "Configuring backend environment..."
cat > backend/.env << EOF
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
CORS_ORIGIN=${FRONTEND_URL}

# Logging
LOG_LEVEL=debug
EOF

# Configure frontend .env
echo "Configuring frontend environment..."
cat > frontend/.env << EOF
VITE_API_URL=${BACKEND_URL}/api
EOF

echo ""
echo "=========================================="
echo " ✓ URLs configured successfully!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "1. Start PostgreSQL: sudo service postgresql start"
echo "2. Start Backend: cd backend && npm start"
echo "3. Start Frontend: cd frontend && npm run dev"
echo ""
echo "📱 Access from your phone:"
echo "   Frontend: $FRONTEND_URL"
echo ""
echo "=========================================="
