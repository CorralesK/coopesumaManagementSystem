# 🔐 Authentication & Authorization

<div align="center">

**Microsoft OAuth 2.0 + JWT Security Implementation**

[![OAuth2](https://img.shields.io/badge/OAuth-2.0-blue?style=for-the-badge&logo=oauth&logoColor=white)](.)
[![Microsoft](https://img.shields.io/badge/Microsoft-Azure_AD-0078D4?style=for-the-badge&logo=microsoft&logoColor=white)](https://azure.microsoft.com/)
[![JWT](https://img.shields.io/badge/JWT-Tokens-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![RBAC](https://img.shields.io/badge/RBAC-Roles-green?style=for-the-badge)](.)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Authentication Flow](#-authentication-flow)
- [Microsoft OAuth Configuration](#-microsoft-oauth-configuration)
- [JWT Implementation](#-jwt-implementation)
- [Authorization System](#-authorization-system)
- [Session Management](#-session-management)
- [Security Measures](#-security-measures)
- [Error Handling](#-error-handling)
- [User Management](#-user-management)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

CoopLink CR uses **Microsoft OAuth 2.0** exclusively for user authentication. This enterprise-grade approach provides:

| Feature | Benefit |
|---------|---------|
| **Single Sign-On** | Users authenticate with existing Microsoft accounts |
| **No Password Storage** | Zero password management overhead |
| **Enterprise Security** | Microsoft's security infrastructure |
| **MFA Support** | Multi-factor authentication if configured |
| **Audit Trail** | Complete authentication logging |

### Authentication Requirements

1. **Pre-registration Required** - Users must exist in the database before login
2. **Microsoft Account** - All users need a valid Microsoft/Azure AD account
3. **Active Status** - Only active users can authenticate
4. **Role Assignment** - Each user has an assigned role

---

## 🔄 Authentication Flow

### Complete OAuth 2.0 Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MICROSOFT OAUTH 2.0 FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FRONTEND   │     │   BACKEND    │     │  MICROSOFT   │     │   DATABASE   │
│   (React)    │     │  (Express)   │     │   Azure AD   │     │ (PostgreSQL) │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │ 1. Click Login     │                    │                    │
       ├───────────────────>│                    │                    │
       │                    │                    │                    │
       │ 2. Redirect URL    │                    │                    │
       │<───────────────────┤                    │                    │
       │                    │                    │                    │
       │ 3. User Auth       │                    │                    │
       ├────────────────────┼───────────────────>│                    │
       │                    │                    │                    │
       │ 4. Auth Code       │                    │                    │
       │<───────────────────┼────────────────────┤                    │
       │                    │                    │                    │
       │ 5. Callback + Code │                    │                    │
       ├───────────────────>│                    │                    │
       │                    │                    │                    │
       │                    │ 6. Exchange Code   │                    │
       │                    │    for Token       │                    │
       │                    ├───────────────────>│                    │
       │                    │                    │                    │
       │                    │ 7. Access Token +  │                    │
       │                    │    ID Token        │                    │
       │                    │<───────────────────┤                    │
       │                    │                    │                    │
       │                    │ 8. GET /me         │                    │
       │                    │    (Graph API)     │                    │
       │                    ├───────────────────>│                    │
       │                    │                    │                    │
       │                    │ 9. User Profile    │                    │
       │                    │<───────────────────┤                    │
       │                    │                    │                    │
       │                    │ 10. Find User      │                    │
       │                    ├───────────────────────────────────────>│
       │                    │                    │                    │
       │                    │ 11. User Data      │                    │
       │                    │<───────────────────────────────────────┤
       │                    │                    │                    │
       │                    │ 12. Validate &     │                    │
       │                    │     Generate JWT   │                    │
       │                    │                    │                    │
       │ 13. Redirect +     │                    │                    │
       │     JWT Token      │                    │                    │
       │<───────────────────┤                    │                    │
       │                    │                    │                    │
       │ 14. Store Token    │                    │                    │
       │     (Session)      │                    │                    │
       │                    │                    │                    │
       │ 15. Authenticated  │                    │                    │
       │     Requests       │                    │                    │
       ├───────────────────>│                    │                    │
       │                    │                    │                    │
```

### Step-by-Step Process

#### Step 1: Login Initiation

User clicks "Login with Microsoft" on the login page.

```jsx
// Frontend: LoginPage.jsx
const handleMicrosoftLogin = () => {
  // Redirect to backend OAuth endpoint
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/microsoft`;
};
```

```jsx
<button
  onClick={handleMicrosoftLogin}
  className="flex items-center justify-center gap-2 w-full py-3 px-4
             bg-white border border-gray-300 rounded-lg
             hover:bg-gray-50 transition-colors"
>
  <MicrosoftIcon className="w-5 h-5" />
  <span>Iniciar sesión con Microsoft</span>
</button>
```

---

#### Step 2: Backend Generates OAuth URL

```javascript
// Backend: authController.js
const initiateMicrosoftLogin = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');

  // Store state for CSRF protection
  req.session.oauthState = state;

  const authUrl = microsoftConfig.getAuthorizationUrl(state);
  res.redirect(authUrl);
};
```

---

#### Step 3-4: Microsoft Authentication

User authenticates with Microsoft credentials. Microsoft redirects back with authorization code.

---

#### Step 5-9: Token Exchange & Profile Fetch

```javascript
// Backend: authService.js
const processOAuthCallback = async (code) => {
  // Step 6-7: Exchange authorization code for tokens
  const tokenResponse = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'openid profile email User.Read'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const { access_token, id_token } = tokenResponse.data;

  // Step 8-9: Fetch user profile from Microsoft Graph
  const profileResponse = await axios.get(
    'https://graph.microsoft.com/v1.0/me',
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  return {
    accessToken: access_token,
    idToken: id_token,
    profile: {
      id: profileResponse.data.id,
      email: profileResponse.data.mail || profileResponse.data.userPrincipalName,
      displayName: profileResponse.data.displayName
    }
  };
};
```

---

#### Step 10-11: User Verification

```javascript
// Backend: authService.js
const findAndValidateUser = async (microsoftProfile) => {
  const { id: microsoftId, email, displayName } = microsoftProfile;

  // Find by Microsoft ID first
  let user = await userRepository.findByMicrosoftId(microsoftId);

  // If not found, try by email
  if (!user && email) {
    user = await userRepository.findByEmail(email);
  }

  // User MUST be pre-registered
  if (!user) {
    throw new AuthError('USER_NOT_REGISTERED', 'User is not registered in the system');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthError('USER_INACTIVE', 'User account is deactivated');
  }

  // Link Microsoft ID if not already linked
  if (!user.microsoftId) {
    await userRepository.updateMicrosoftId(user.userId, microsoftId);
    user.microsoftId = microsoftId;
  }

  // Update name if changed in Microsoft
  if (user.fullName !== displayName) {
    await userRepository.updateFullName(user.userId, displayName);
    user.fullName = displayName;
  }

  return user;
};
```

---

#### Step 12-13: JWT Generation & Redirect

```javascript
// Backend: authController.js
const handleMicrosoftCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // Validate state (CSRF protection)
    if (state !== req.session.oauthState) {
      throw new AuthError('INVALID_STATE', 'OAuth state mismatch');
    }

    // Process OAuth callback
    const oauthData = await authService.processOAuthCallback(code);

    // Find and validate user
    const user = await authService.findAndValidateUser(oauthData.profile);

    // Generate JWT
    const token = jwtUtils.generateToken({
      userId: user.userId,
      cooperativeId: user.cooperativeId,
      email: user.email,
      role: user.role
    });

    // Audit log
    logger.info('User authenticated', {
      userId: user.userId,
      email: user.email,
      role: user.role,
      method: 'microsoft_oauth'
    });

    // Redirect to frontend with token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);

  } catch (error) {
    logger.error('OAuth callback failed', { error: error.message });
    res.redirect(`${config.frontendUrl}/auth/callback?error=${error.code || 'AUTH_ERROR'}`);
  }
};
```

---

#### Step 14: Frontend Token Storage

```jsx
// Frontend: AuthCallbackPage.jsx
const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const errorCode = params.get('error');

    if (errorCode) {
      setError(translateError(errorCode));
      return;
    }

    if (token) {
      // Verify token and get user data
      authService.verifyToken()
        .then(({ data }) => {
          login(token, data.user);

          // Redirect based on role
          const redirectPath = data.user.role === 'member'
            ? '/my/dashboard'
            : '/dashboard';
          navigate(redirectPath);
        })
        .catch((err) => {
          setError('Error al verificar el token');
          console.error('Token verification failed:', err);
        });
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message={error} />
        <Button onClick={() => navigate('/login')}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  return <Loading fullScreen message="Iniciando sesión..." />;
};
```

---

## ⚙️ Microsoft OAuth Configuration

### Azure AD App Registration

#### Step 1: Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: `CoopLink CR Management System`
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Web - `http://localhost:5000/api/auth/callback`

#### Step 2: Configure Authentication

1. Go to **Authentication** section
2. Add redirect URIs:
   - Development: `http://localhost:5000/api/auth/callback`
   - Production: `https://your-backend.com/api/auth/callback`
3. Enable **ID tokens** and **Access tokens**

#### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Set description and expiration
4. Copy the **Value** (shown only once)

#### Step 4: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**
3. Add permissions:
   - `openid` - Sign users in
   - `profile` - View users' basic profile
   - `email` - View users' email address
   - `User.Read` - Read user profile
4. Click **Grant admin consent** if you have admin rights

### Environment Variables

```env
# Backend .env
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=your-client-secret-value
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/callback
```

| Variable | Description |
|----------|-------------|
| `MICROSOFT_CLIENT_ID` | Application (client) ID from Azure |
| `MICROSOFT_CLIENT_SECRET` | Client secret value |
| `MICROSOFT_TENANT_ID` | `common` for multi-tenant, or specific tenant ID |
| `MICROSOFT_REDIRECT_URI` | Must match Azure registration |

### Configuration Module

```javascript
// config/microsoftConfig.js
const microsoftConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
  redirectUri: process.env.MICROSOFT_REDIRECT_URI,

  scopes: ['openid', 'profile', 'email', 'User.Read'],

  getAuthorizationUrl: (state) => {
    const params = new URLSearchParams({
      client_id: microsoftConfig.clientId,
      response_type: 'code',
      redirect_uri: microsoftConfig.redirectUri,
      response_mode: 'query',
      scope: microsoftConfig.scopes.join(' '),
      state: state
    });

    return `https://login.microsoftonline.com/${microsoftConfig.tenantId}/oauth2/v2.0/authorize?${params}`;
  },

  getTokenUrl: () => {
    return `https://login.microsoftonline.com/${microsoftConfig.tenantId}/oauth2/v2.0/token`;
  }
};

module.exports = microsoftConfig;
```

---

## 🎫 JWT Implementation

### Token Structure

```javascript
// JWT Payload
{
  // Claims
  "userId": 1,
  "cooperativeId": 1,
  "email": "user@example.com",
  "role": "administrator",

  // Standard Claims
  "iat": 1704067200,  // Issued at (Unix timestamp)
  "exp": 1704153600   // Expires at (24 hours later)
}
```

### Token Utilities

```javascript
// utils/jwtUtils.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const jwtUtils = {
  /**
   * Generate a JWT token
   * @param {Object} payload - Token payload
   * @returns {string} JWT token
   */
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    });
  },

  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   * @throws {Error} If token is invalid or expired
   */
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthError('TOKEN_EXPIRED', 'Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AuthError('TOKEN_INVALID', 'Token is invalid');
      }
      throw error;
    }
  },

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload or null
   */
  decodeToken: (token) => {
    return jwt.decode(token);
  }
};

module.exports = jwtUtils;
```

### JWT Configuration Best Practices

| Setting | Development | Production |
|---------|-------------|------------|
| `JWT_SECRET` | 32+ random chars | 64+ random chars |
| `JWT_EXPIRES_IN` | `24h` | `24h` or less |
| Algorithm | HS256 | HS256 or RS256 |
| Storage | sessionStorage | sessionStorage |

---

## 👮 Authorization System

### Role-Based Access Control (RBAC)

```javascript
// config/roles.js
const USER_ROLES = {
  ADMINISTRATOR: 'administrator',
  REGISTRAR: 'registrar',
  MANAGER: 'manager',
  MEMBER: 'member'
};

const ROLE_PERMISSIONS = {
  administrator: [
    'manage_users',
    'manage_members',
    'manage_assemblies',
    'register_attendance',
    'manage_savings',
    'manage_contributions',
    'approve_withdrawals',
    'execute_liquidations',
    'view_reports',
    'manage_cooperative'
  ],
  registrar: [
    'register_attendance',
    'view_active_assembly',
    'view_members'
  ],
  manager: [
    'manage_savings',
    'manage_contributions',
    'approve_withdrawals',
    'view_members',
    'view_reports'
  ],
  member: [
    'view_own_dashboard',
    'view_own_accounts',
    'view_own_transactions',
    'request_withdrawal'
  ]
};

const ROLE_HIERARCHY = {
  administrator: 4,
  manager: 3,
  registrar: 2,
  member: 1
};

module.exports = { USER_ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY };
```

### Role Access Matrix

| Feature | Administrator | Manager | Registrar | Member |
|---------|:-------------:|:-------:|:---------:|:------:|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Member Management | ✅ | ❌ | ❌ | ❌ |
| Assembly Management | ✅ | ❌ | ❌ | ❌ |
| Attendance Registration | ✅ | ❌ | ✅ | ❌ |
| Savings Operations | ✅ | ✅ | ❌ | ❌ |
| Contribution Management | ✅ | ✅ | ❌ | ❌ |
| Withdrawal Approval | ✅ | ✅ | ❌ | ❌ |
| Liquidation Execution | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |
| Own Dashboard | ✅ | ✅ | ✅ | ✅ |
| Request Withdrawal | ❌ | ❌ | ❌ | ✅ |

### Authentication Middleware

```javascript
// middlewares/authMiddleware.js
const jwtUtils = require('../utils/jwtUtils');
const userRepository = require('../modules/users/userRepository');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        error: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwtUtils.verifyToken(token);

    // Fetch current user data
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
        error: 'USER_INACTIVE'
      });
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      cooperativeId: user.cooperativeId,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'TOKEN_INVALID'
    });
  }
};

module.exports = authMiddleware;
```

### Role Middleware

```javascript
// middlewares/roleMiddleware.js
const { ROLE_HIERARCHY } = require('../config/roles');

/**
 * Require specific role(s) for access
 * @param {string|string[]} allowedRoles - Allowed role(s)
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Require minimum role level
 * @param {string} minRole - Minimum role required
 */
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      });
    }

    next();
  };
};

module.exports = { requireRole, requireMinRole };
```

### Route Protection Example

```javascript
// routes/memberRoutes.js
const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { USER_ROLES } = require('../config/roles');
const memberController = require('./memberController');

// All routes require authentication
router.use(authMiddleware);

// GET /members - View members (all authenticated users)
router.get('/', memberController.getAll);

// GET /members/:id - View member details
router.get('/:id', memberController.getById);

// POST /members/affiliate - Administrator only
router.post(
  '/affiliate',
  requireRole(USER_ROLES.ADMINISTRATOR),
  memberController.affiliate
);

// PUT /members/:id - Administrator only
router.put(
  '/:id',
  requireRole(USER_ROLES.ADMINISTRATOR),
  memberController.update
);

// DELETE /members/:id - Administrator only
router.delete(
  '/:id',
  requireRole(USER_ROLES.ADMINISTRATOR),
  memberController.delete
);

module.exports = router;
```

### Frontend Route Protection

```jsx
// components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return <Loading fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
```

---

## 💾 Session Management

### Frontend Session Storage

```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = sessionStorage.getItem('token');

      if (storedToken) {
        try {
          // Verify token is still valid
          const response = await authService.verifyToken();
          setToken(storedToken);
          setUser(response.data.user);
        } catch (error) {
          // Token invalid, clear storage
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Session Characteristics

| Aspect | Implementation |
|--------|----------------|
| **Storage** | `sessionStorage` (tab-scoped) |
| **Persistence** | Cleared on browser/tab close |
| **Token Lifetime** | 24 hours (configurable) |
| **Refresh** | None (re-authentication required) |
| **Concurrent Sessions** | Allowed (multiple tabs/devices) |

---

## 🛡️ Security Measures

### Token Security

| Measure | Implementation |
|---------|----------------|
| **HTTPS Only** | Tokens transmitted over HTTPS in production |
| **Session Storage** | Not accessible by other tabs |
| **Short Expiry** | 24-hour token lifetime |
| **No URL Exposure** | Tokens in headers, not URLs (except callback) |
| **Secure Secret** | 64+ character secret in production |

### CSRF Protection

```javascript
// OAuth state parameter for CSRF protection
const initiateMicrosoftLogin = (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');

  // Store in session (server-side)
  req.session.oauthState = state;

  const authUrl = microsoftConfig.getAuthorizationUrl(state);
  res.redirect(authUrl);
};

const handleCallback = async (req, res) => {
  // Verify state matches
  if (req.query.state !== req.session.oauthState) {
    throw new AuthError('INVALID_STATE', 'OAuth state mismatch - possible CSRF attack');
  }
  // Continue...
};
```

### Security Headers

```javascript
// app.js - Helmet configuration
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### Audit Logging

```javascript
// Successful authentication
logger.info('User authenticated', {
  userId: user.userId,
  email: user.email,
  role: user.role,
  method: 'microsoft_oauth',
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});

// Failed authentication
logger.warn('Authentication failed', {
  error: error.code,
  email: profile?.email,
  ip: req.ip,
  timestamp: new Date().toISOString()
});

// Logout
logger.info('User logged out', {
  userId: req.user.userId,
  timestamp: new Date().toISOString()
});
```

---

## ⚠️ Error Handling

### Authentication Error Codes

| Code | HTTP | Description | User Message |
|------|------|-------------|--------------|
| `UNAUTHORIZED` | 401 | No token provided | Debe iniciar sesión |
| `TOKEN_EXPIRED` | 401 | Token has expired | Su sesión ha expirado |
| `TOKEN_INVALID` | 401 | Token is malformed | Token inválido |
| `USER_NOT_FOUND` | 401 | User not in database | Usuario no encontrado |
| `USER_INACTIVE` | 401 | Account deactivated | Cuenta desactivada |
| `USER_NOT_REGISTERED` | 403 | Not pre-registered | Usuario no registrado |
| `FORBIDDEN` | 403 | Insufficient role | Sin permisos |
| `INVALID_STATE` | 400 | OAuth state mismatch | Error de autenticación |

### Error Response Format

```json
{
  "success": false,
  "message": "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
  "error": "TOKEN_EXPIRED"
}
```

### Frontend Error Handling

```javascript
// services/api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.error;

    if (status === 401) {
      // Clear auth state
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Redirect to login (if not already there)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Translate error for user display
    const translatedMessage = translateError(errorCode);
    error.userMessage = translatedMessage;

    return Promise.reject(error);
  }
);
```

---

## 👥 User Management

### Creating New Users

Only administrators can create users:

```javascript
// Backend: userController.js
const createUser = async (req, res) => {
  const { fullName, email, role } = req.body;

  // Validate role
  if (!Object.values(USER_ROLES).includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role',
      error: 'VALIDATION_ERROR'
    });
  }

  // Check email uniqueness
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
      error: 'DUPLICATE_EMAIL'
    });
  }

  // Create user (Microsoft ID linked on first login)
  const user = await userRepository.create({
    cooperativeId: req.user.cooperativeId,
    fullName,
    email,
    role,
    isActive: true
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
};
```

### User Activation/Deactivation

```javascript
// Deactivate user
const deactivateUser = async (req, res) => {
  const { id } = req.params;

  // Cannot deactivate self
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot deactivate your own account',
      error: 'SELF_DEACTIVATION'
    });
  }

  // Cannot deactivate last administrator
  const adminCount = await userRepository.countActiveAdmins();
  const user = await userRepository.findById(id);

  if (user.role === 'administrator' && adminCount <= 1) {
    return res.status(400).json({
      success: false,
      message: 'Cannot deactivate the last administrator',
      error: 'LAST_ADMIN'
    });
  }

  await userRepository.deactivate(id);

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
};
```

---

## 🔧 Troubleshooting

### Common Issues

#### "User not registered" Error

**Cause**: User's email doesn't exist in the `users` table.

**Solution**: Administrator must create the user before they can log in.

---

#### "redirect_uri_mismatch" Error

**Cause**: Callback URL doesn't match Azure registration.

**Solution**:
1. Check `MICROSOFT_REDIRECT_URI` matches Azure portal
2. Include both HTTP (dev) and HTTPS (prod) URLs in Azure

---

#### Token Expires Too Quickly

**Cause**: `JWT_EXPIRES_IN` configured incorrectly.

**Solution**: Check environment variable format (`24h`, `7d`, `1w`)

---

#### CORS Errors on Auth

**Cause**: OAuth callback redirects not handling CORS.

**Solution**: OAuth flow uses redirects, not AJAX. Check frontend URL configuration.

---

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture |
| [03-API-REST.md](./03-API-REST.md) | API endpoints |
| [07-INSTALLATION.md](./07-INSTALLATION.md) | Setup guide |
| [08-DEPLOYMENT.md](./08-DEPLOYMENT.md) | Production deployment |

---

<div align="center">

**[⬆ Back to Top](#-authentication--authorization)**

</div>
