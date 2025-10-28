# CoopeSuma Backend API

REST API for CoopeSuma Student Cooperative Management System

## Requirements

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy configuration file
cp .env.example .env

# Edit .env with your values
nano .env
```

## Configuration

Edit `.env` with the correct values for your environment:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cooplinkcr
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

## Database Setup

Before starting the server, make sure you have the database configured:

```bash
# Create database
createdb cooplinkcr

# Execute SQL scripts in order
cd ../database/scripts/phase_1
psql -U postgres -d cooplinkcr -f 01_create_functions.sql
psql -U postgres -d cooplinkcr -f 02_create_tables.sql
psql -U postgres -d cooplinkcr -f 03_create_indexes.sql
psql -U postgres -d cooplinkcr -f 04_create_triggers.sql
psql -U postgres -d cooplinkcr -f 05_seed_initial_data.sql
```

## Available Scripts

```bash
npm start        # Start in production
npm run dev      # Start in development (with nodemon)
npm test         # Run tests
npm run lint     # Check code
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, environment, CORS)
│   ├── constants/       # Constants (roles, errorCodes, messages)
│   ├── middlewares/     # Middlewares (auth, validation, errorHandler)
│   ├── modules/         # Modules by functionality
│   │   ├── auth/        # Authentication
│   │   ├── members/     # Member management
│   │   ├── assemblies/  # Assembly management
│   │   ├── attendance/  # Attendance control
│   │   ├── users/       # User management
│   │   └── reports/     # Report generation
│   ├── utils/           # Utilities (JWT, OAuth, QR, logger, PDF)
│   ├── app.js           # Express configuration
│   └── server.js        # Entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── logs/                # Application logs
├── .env.example         # Environment variables example
├── .gitignore           # Files ignored by Git
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## Module Architecture

Each module follows a 3-layer architecture:

1. **Controller** (`*Controller.js`): Handles HTTP requests
2. **Service** (`*Service.js`): Contains business logic
3. **Repository** (`*Repository.js`): Interacts with database

Additionally:
- **Routes** (`*Routes.js`): Defines module routes
- **Validation** (`*Validation.js`): Validation schemas with Joi

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
GET  /api/auth/login      # Initiate Microsoft OAuth login
GET  /api/auth/callback   # OAuth callback
GET  /api/auth/me         # Get current user info
POST /api/auth/logout     # Logout (optional)
```

### Users
```
GET    /api/users              # Get all users (with pagination)
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create user
PUT    /api/users/:id          # Update user
POST   /api/users/:id/deactivate  # Deactivate user
POST   /api/users/:id/activate    # Activate user
```

### Members
```
GET    /api/members            # Get all members
GET    /api/members/:id        # Get member by ID
POST   /api/members            # Create member
PUT    /api/members/:id        # Update member
DELETE /api/members/:id        # Delete member
GET    /api/members/:id/qr     # Generate member QR code
POST   /api/members/verify     # Verify member by QR code
```

### Assemblies
```
GET    /api/assemblies         # Get all assemblies
GET    /api/assemblies/:id     # Get assembly by ID
POST   /api/assemblies         # Create assembly
PUT    /api/assemblies/:id     # Update assembly
DELETE /api/assemblies/:id     # Delete assembly
POST   /api/assemblies/:id/activate    # Activate assembly
POST   /api/assemblies/:id/deactivate  # Deactivate assembly
GET    /api/assemblies/:id/stats       # Get assembly statistics
GET    /api/assemblies/active          # Get active assembly
```

### Attendance
```
POST   /api/attendance/scan               # Register attendance by QR scan
POST   /api/attendance/manual             # Register attendance manually
GET    /api/attendance/assembly/:id       # Get attendance by assembly
GET    /api/attendance/assembly/:id/stats # Get assembly attendance statistics
DELETE /api/attendance/:id                # Delete attendance record
```

### Reports
```
POST   /api/reports/attendance # Generate attendance report
GET    /api/reports/members/stats      # Get member statistics
```

## API Responses

### Success Response
```json
{
  "success": true,
  "message": "Message in Spanish",
  "data": { ... },
  "pagination": {  // Optional, for paginated responses
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message in Spanish",
  "error": "ERROR_CODE",
  "details": { ... }
}
```

## Error Handling

The system includes global error handling that captures:
- Operational errors (expected)
- Database errors
- JWT errors
- Validation errors
- Not found errors (404)

## Security

### Authentication
- Microsoft OAuth 2.0 for user authentication
- JWT tokens for session management
- Role-based access control (RBAC)

### Data Protection
- SQL injection protection (parameterized queries)
- Input validation with Joi schemas
- XSS protection (no eval, no innerHTML)
- Secure user authentication via Microsoft OAuth only

### HTTP Security
- Helmet.js for security headers
- CORS configured
- Request logging
- Error sanitization

### Input Validation
All endpoints validate input data with Joi schemas:
- Email format validation
- String length limits
- Required field validation
- Type checking
- Role validation

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Development

### Adding a New Module

1. Create folder in `src/modules/module-name/`
2. Create files:
   - `moduleNameController.js`
   - `moduleNameService.js`
   - `moduleNameRepository.js`
   - `moduleNameRoutes.js`
   - `moduleNameValidation.js`
3. Register routes in `src/app.js`
4. Add tests in `tests/`

### Code Conventions

- **Technical names**: English
- **User messages**: Spanish
- **Files/functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Database**: snake_case

### Logging

The application uses Winston for logging with different levels:
- `error`: Error messages
- `warn`: Warning messages
- `info`: Informational messages
- `debug`: Debug messages (development only)

Logs are stored in:
- `logs/application-YYYY-MM-DD.log`: All logs
- `logs/error-YYYY-MM-DD.log`: Error logs only

## Required Environment Variables

In production, make sure to configure:
- `JWT_SECRET`: Secret key for JWT
- `DATABASE_PASSWORD`: Database password
- `NODE_ENV`: Must be "production"
- `CORS_ORIGIN`: Frontend origin in production
- `MICROSOFT_CLIENT_ID`: Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET`: Microsoft OAuth client secret

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in `.env`
- Verify database `cooplinkcr` exists
- Check database logs

### Server Start Error
- Verify port 5000 is available
- Check all dependencies are installed
- Review logs for details
- Verify `.env` file exists and is properly configured

### JWT Error
- Verify `JWT_SECRET` is configured in `.env`
- Check token hasn't expired
- Verify token format in Authorization header

### OAuth Error
- Verify Microsoft OAuth credentials are correct in `.env`
- Check redirect URI matches the configuration in Azure
- Verify the user exists in the `users` table in the database
- Check that the user's `is_active` status is `true`

## Database Notes

### Snake Case to Camel Case
The database uses `snake_case` for column names, but the API converts them to `camelCase` automatically using a middleware.

Example:
- Database: `full_name`, `created_at`
- API: `fullName`, `createdAt`

### Parameterized Queries
All database queries use parameterized statements to prevent SQL injection:

```javascript
// Good
db.query('SELECT * FROM users WHERE user_id = $1', [userId]);

// Bad (never do this)
db.query(`SELECT * FROM users WHERE user_id = ${userId}`);
```

## Performance

- Connection pooling with `pg-pool`
- Database indexes on frequently queried fields
- Pagination for large datasets
- Query result limiting

## License

This project is developed as a Final Graduation Project for Universidad Técnica Nacional.

## Author

Kimberly Corrales - UTN Graduation Project 2025

---

For more information, see the main project README.md at the repository root.
