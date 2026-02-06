# ⚛️ Frontend Documentation

<div align="center">

**React 19 Progressive Web Application**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/Router-7.9-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Components](#-components)
  - [Common Components](#common-components)
  - [Domain Components](#domain-components)
  - [Print Components](#print-components)
- [State Management](#-state-management)
- [Custom Hooks](#-custom-hooks)
- [Services](#-services)
- [Routing](#-routing)
- [Styling](#-styling)
- [Configuration](#-configuration)
- [Build & Development](#-build--development)

---

## 🎯 Overview

The CoopLink CR frontend is a **Progressive Web Application (PWA)** providing a modern, responsive interface for cooperative management. Built with React 19 and Vite 7, it delivers fast performance and excellent developer experience.

### Key Features

| Feature | Description |
|---------|-------------|
| **PWA Support** | Installable, offline-capable application |
| **Responsive Design** | Mobile-first approach with Tailwind CSS |
| **QR Scanning** | Real-time camera-based QR code scanning |
| **Role-Based UI** | Dynamic interface based on user permissions |
| **Print Support** | Printable receipts and reports |
| **Real-time Updates** | Instant feedback with toast notifications |

---

## 🛠️ Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.1.1 | UI Framework |
| `react-dom` | 19.1.1 | DOM Rendering |
| `react-router-dom` | 7.9.4 | Client-side Routing |
| `axios` | 1.12.2 | HTTP Client |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4.1.14 | Utility-first CSS |
| `@tailwindcss/forms` | Latest | Form styling plugin |
| `react-hot-toast` | 2.6.0 | Toast notifications |
| `@heroicons/react` | 2.x | Icon library |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `html5-qrcode` | 2.3.8 | QR Code scanning |
| `qrcode` | 1.5.x | QR Code generation |
| `prop-types` | 15.8.1 | Runtime type checking |
| `date-fns` | 3.x | Date manipulation |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | 7.1.7 | Build tool & dev server |
| `@vitejs/plugin-react` | 5.x | React integration |
| `eslint` | 9.x | Code linting |
| `postcss` | 8.x | CSS processing |

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
│
├── src/
│   ├── main.jsx               # Application entry point
│   ├── App.jsx                # Root component & routing
│   ├── index.css              # Global styles (Tailwind)
│   │
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Generic components
│   │   │   ├── Alert.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── EmptyState.jsx
│   │   │
│   │   ├── members/           # Member-specific components
│   │   │   ├── MemberCard.jsx
│   │   │   ├── MemberForm.jsx
│   │   │   ├── MemberAccountsSummary.jsx
│   │   │   └── BatchQrPrintModal.jsx
│   │   │
│   │   ├── savings/           # Savings components
│   │   │   ├── SavingsDepositModal.jsx
│   │   │   ├── SavingsWithdrawalModal.jsx
│   │   │   └── TransactionsList.jsx
│   │   │
│   │   ├── attendance/        # Attendance components
│   │   │   ├── QrScanner.jsx
│   │   │   ├── AttendanceConfirmation.jsx
│   │   │   └── AttendanceList.jsx
│   │   │
│   │   └── print/             # Print-optimized components
│   │       ├── AttendanceListPrint.jsx
│   │       ├── SavingsReceiptPrint.jsx
│   │       ├── LiquidationReceiptPrint.jsx
│   │       └── MemberQrPrint.jsx
│   │
│   ├── context/               # React Contexts
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── CooperativeContext.jsx
│   │
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useApi.js          # Base API hook
│   │   ├── useMembers.js
│   │   ├── useAssemblies.js
│   │   ├── useAttendance.js
│   │   ├── useSavings.js
│   │   ├── useContributions.js
│   │   ├── useWithdrawalRequests.js
│   │   ├── useLiquidations.js
│   │   ├── useNotifications.js
│   │   ├── useQrScanner.js
│   │   ├── useDebounce.js
│   │   └── usePagination.js
│   │
│   ├── pages/                 # Page components
│   │   ├── LoginPage.jsx
│   │   ├── AuthCallbackPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── UnauthorizedPage.jsx
│   │   │
│   │   ├── members/
│   │   │   ├── MembersListPage.jsx
│   │   │   ├── MemberDetailPage.jsx
│   │   │   ├── MemberFormPage.jsx
│   │   │   └── MemberVerifyPage.jsx
│   │   │
│   │   ├── assemblies/
│   │   │   ├── AssembliesListPage.jsx
│   │   │   └── AssemblyDetailPage.jsx
│   │   │
│   │   ├── attendance/
│   │   │   ├── AttendanceScanPage.jsx
│   │   │   └── AttendanceHistoryPage.jsx
│   │   │
│   │   ├── users/
│   │   │   ├── UsersListPage.jsx
│   │   │   └── UserFormPage.jsx
│   │   │
│   │   ├── savings/
│   │   │   ├── SavingsManagementPage.jsx
│   │   │   └── SavingsInventoryPage.jsx
│   │   │
│   │   ├── withdrawals/
│   │   │   └── WithdrawalRequestsPage.jsx
│   │   │
│   │   ├── liquidations/
│   │   │   └── LiquidationsPage.jsx
│   │   │
│   │   ├── reports/
│   │   │   └── ReportsPage.jsx
│   │   │
│   │   └── member-portal/     # Member self-service
│   │       ├── MemberDashboardPage.jsx
│   │       ├── MemberTransactionsPage.jsx
│   │       └── MemberProfilePage.jsx
│   │
│   ├── services/              # API service layer
│   │   ├── api.js             # Axios instance
│   │   ├── authService.js
│   │   ├── memberService.js
│   │   ├── assemblyService.js
│   │   ├── attendanceService.js
│   │   ├── savingsService.js
│   │   ├── contributionService.js
│   │   ├── withdrawalService.js
│   │   ├── liquidationService.js
│   │   ├── notificationService.js
│   │   ├── reportService.js
│   │   └── catalogService.js
│   │
│   └── utils/                 # Utility functions
│       ├── constants.js       # App constants
│       ├── formatters.js      # Data formatters
│       ├── validators.js      # Form validators
│       └── errorTranslations.js
│
├── .env                       # Environment variables
├── .env.example               # Environment template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
└── package.json
```

---

## 🏗️ Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          APP COMPONENT                               │
│                              (App.jsx)                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
          ┌────────────────────┴────────────────────┐
          │                                         │
          ▼                                         ▼
┌─────────────────────┐                   ┌─────────────────────┐
│    AUTH CONTEXT     │                   │  COOPERATIVE CTX    │
│  ┌───────────────┐  │                   │  ┌───────────────┐  │
│  │ user          │  │                   │  │ cooperative   │  │
│  │ token         │  │                   │  │ loading       │  │
│  │ isAuth        │  │                   │  └───────────────┘  │
│  │ login/logout  │  │                   └─────────────────────┘
│  └───────────────┘  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           ROUTER                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    PROTECTED ROUTE                           │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │                      LAYOUT                          │    │    │
│  │  │  ┌────────────┐  ┌───────────────────────────────┐  │    │    │
│  │  │  │  SIDEBAR   │  │         PAGE CONTENT          │  │    │    │
│  │  │  │  ────────  │  │  ┌─────────────────────────┐  │  │    │    │
│  │  │  │  • Home    │  │  │      COMPONENTS         │  │  │    │    │
│  │  │  │  • Members │  │  │  (Cards, Tables, Forms) │  │  │    │    │
│  │  │  │  • Savings │  │  └─────────────────────────┘  │  │    │    │
│  │  │  │  • ...     │  │                               │  │    │    │
│  │  │  └────────────┘  └───────────────────────────────┘  │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    COMPONENT    │────>│   CUSTOM HOOK   │────>│    SERVICE      │
│                 │     │                 │     │                 │
│  • Uses hook    │     │  • State mgmt   │     │  • API calls    │
│  • Renders UI   │     │  • Side effects │     │  • Data transform│
│  • User events  │     │  • Error handle │     │  • Auth headers │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        ▲                                                 │
        │                                                 ▼
        │                                       ┌─────────────────┐
        │                                       │   AXIOS / API   │
        │                                       │                 │
        └───────────────────────────────────────│  Backend REST   │
                     Response                   │     API         │
                                                └─────────────────┘
```

---

## 🧩 Components

### Common Components

#### Alert

Displays feedback messages with auto-dismiss capability.

```jsx
import { Alert } from '../components/common/Alert';

<Alert
  type="success"           // success | error | warning | info
  message="Operation completed successfully"
  onClose={() => setAlert(null)}
  autoClose={true}
  duration={5000}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Alert variant |
| `message` | `string` | — | Alert message |
| `onClose` | `() => void` | — | Close callback |
| `autoClose` | `boolean` | `true` | Auto-dismiss |
| `duration` | `number` | `5000` | Dismiss delay (ms) |

---

#### Button

Configurable button with loading state.

```jsx
import { Button } from '../components/common/Button';

<Button
  variant="primary"
  size="md"
  onClick={handleSubmit}
  loading={isSubmitting}
  disabled={!isValid}
>
  Save Changes
</Button>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Button style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `disabled` | `boolean` | `false` | Disable interaction |
| `onClick` | `() => void` | — | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `children` | `ReactNode` | — | Button content |

---

#### Card

Container component with optional header and footer.

```jsx
import { Card } from '../components/common/Card';

<Card
  title="Member Information"
  subtitle="Personal details"
  actions={<Button>Edit</Button>}
>
  {/* Card content */}
</Card>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title |
| `subtitle` | `string` | Card subtitle |
| `actions` | `ReactNode` | Header actions |
| `footer` | `ReactNode` | Footer content |
| `children` | `ReactNode` | Card body |
| `className` | `string` | Additional classes |

---

#### Input

Form input with label, validation, and error display.

```jsx
import { Input } from '../components/common/Input';

<Input
  label="Full Name"
  name="fullName"
  type="text"
  value={formData.fullName}
  onChange={handleChange}
  error={errors.fullName}
  required
  placeholder="Enter full name"
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Input label |
| `name` | `string` | Input name attribute |
| `type` | `string` | Input type |
| `value` | `string \| number` | Controlled value |
| `onChange` | `(e) => void` | Change handler |
| `error` | `string` | Error message |
| `required` | `boolean` | Required field marker |
| `disabled` | `boolean` | Disable input |
| `placeholder` | `string` | Placeholder text |
| `helpText` | `string` | Helper text below input |

---

#### Select

Dropdown select with options.

```jsx
import { Select } from '../components/common/Select';

<Select
  label="Member Quality"
  name="qualityId"
  value={formData.qualityId}
  onChange={handleChange}
  options={qualities.map(q => ({ value: q.id, label: q.name }))}
  placeholder="Select quality"
  error={errors.qualityId}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Select label |
| `name` | `string` | Select name |
| `value` | `string \| number` | Selected value |
| `onChange` | `(e) => void` | Change handler |
| `options` | `Array<{value, label}>` | Options array |
| `placeholder` | `string` | Placeholder option |
| `error` | `string` | Error message |
| `disabled` | `boolean` | Disable select |

---

#### Modal

Dialog overlay component.

```jsx
import { Modal } from '../components/common/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Open state |
| `onClose` | `() => void` | — | Close callback |
| `title` | `string` | — | Modal title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal width |
| `children` | `ReactNode` | — | Modal content |
| `closeOnOverlay` | `boolean` | `true` | Close on overlay click |
| `showCloseButton` | `boolean` | `true` | Show X button |

---

#### Table

Data table with sorting, actions, and empty state.

```jsx
import { Table } from '../components/common/Table';

const columns = [
  { key: 'fullName', label: 'Name', sortable: true },
  { key: 'memberCode', label: 'Code' },
  { key: 'levelName', label: 'Level' },
  {
    key: 'actions',
    label: '',
    render: (row) => (
      <Button size="sm" onClick={() => handleEdit(row)}>
        Edit
      </Button>
    )
  }
];

<Table
  columns={columns}
  data={members}
  loading={isLoading}
  emptyMessage="No members found"
  onRowClick={(row) => navigate(`/members/${row.memberId}`)}
/>
```

**Column Definition:**

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Data key |
| `label` | `string` | Column header |
| `sortable` | `boolean` | Enable sorting |
| `render` | `(row) => ReactNode` | Custom renderer |
| `className` | `string` | Column classes |

---

#### Pagination

Pagination controls with page info.

```jsx
import { Pagination } from '../components/common/Pagination';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalItems}
  onPageChange={setPage}
  itemsPerPage={limit}
/>
```

---

#### ProtectedRoute

Route guard for authentication and authorization.

```jsx
import { ProtectedRoute } from '../components/common/ProtectedRoute';

<Route
  path="/savings"
  element={
    <ProtectedRoute requiredRole={['administrator', 'manager']}>
      <SavingsManagementPage />
    </ProtectedRoute>
  }
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Protected content |
| `requiredRole` | `string \| string[]` | Required role(s) |
| `redirectTo` | `string` | Redirect path on failure |

---

### Domain Components

#### MemberCard

Displays member information with photo and QR code.

```jsx
<MemberCard
  member={memberData}
  showQr={true}
  showAccounts={true}
  onEdit={() => navigate(`/members/${id}/edit`)}
/>
```

---

#### QrScanner

Camera-based QR code scanner using html5-qrcode.

```jsx
import { QrScanner } from '../components/attendance/QrScanner';

<QrScanner
  onScan={handleQrScan}
  onError={handleScanError}
  active={isScanning}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `onScan` | `(code: string) => void` | Scan success callback |
| `onError` | `(error: Error) => void` | Scan error callback |
| `active` | `boolean` | Scanner active state |

---

### Print Components

Print-optimized components for physical output.

```jsx
// Trigger print
const handlePrint = () => {
  window.print();
};

// Print component
<div className="print:block hidden">
  <SavingsReceiptPrint
    receipt={receiptData}
    member={memberData}
  />
</div>
```

Available print components:
- `AttendanceListPrint` - Assembly attendance list
- `SavingsReceiptPrint` - Deposit/withdrawal receipt
- `LiquidationReceiptPrint` - Liquidation receipt
- `MemberQrPrint` - Member QR code card

---

## 🔄 State Management

### Context-Based State

The application uses React Context for global state management.

#### AuthContext

```jsx
// Provider setup in App.jsx
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>

// Usage in components
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const {
    user,              // Current user object
    token,             // JWT token
    isAuthenticated,   // Auth status
    loading,           // Auth loading state
    login,             // Login function
    logout,            // Logout function
    hasRole            // Role check utility
  } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!hasRole(['administrator'])) return <Navigate to="/unauthorized" />;

  return <div>Welcome, {user.fullName}</div>;
}
```

**AuthContext Values:**

| Value | Type | Description |
|-------|------|-------------|
| `user` | `object \| null` | Current user data |
| `token` | `string \| null` | JWT token |
| `isAuthenticated` | `boolean` | Authentication status |
| `loading` | `boolean` | Initial auth check |
| `login` | `(token: string) => Promise<void>` | Set token & fetch user |
| `logout` | `() => void` | Clear auth state |
| `hasRole` | `(roles: string \| string[]) => boolean` | Check user role |

---

## 🪝 Custom Hooks

### useApi

Base hook for API calls with state management.

```jsx
import { useApi } from '../hooks/useApi';

function MemberList() {
  const { data, loading, error, execute } = useApi();

  useEffect(() => {
    execute(() => memberService.getAll());
  }, []);

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error.message} />;

  return <Table data={data} />;
}
```

**Returns:**

| Value | Type | Description |
|-------|------|-------------|
| `data` | `T \| null` | Response data |
| `loading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error object |
| `execute` | `(fn: () => Promise<T>) => Promise<void>` | Execute API call |
| `reset` | `() => void` | Reset state |

---

### useMembers

Hook for member CRUD operations.

```jsx
import { useMembers } from '../hooks/useMembers';

function MemberManagement() {
  const {
    members,
    loading,
    pagination,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    affiliateMember
  } = useMembers();

  useEffect(() => {
    fetchMembers({ page: 1, limit: 50 });
  }, []);

  const handleAffiliate = async (data) => {
    const result = await affiliateMember(data);
    if (result.success) {
      toast.success('Member affiliated successfully');
    }
  };

  return (/* ... */);
}
```

---

### useAssemblies

Hook for assembly operations.

```jsx
import { useAssemblies } from '../hooks/useAssemblies';

function AssemblyManagement() {
  const {
    assemblies,
    activeAssembly,
    loading,
    fetchAssemblies,
    createAssembly,
    activateAssembly,
    deactivateAssembly
  } = useAssemblies();

  // Activate assembly (auto-deactivates others)
  const handleActivate = async (assemblyId) => {
    await activateAssembly(assemblyId);
    toast.success('Assembly activated');
  };

  return (/* ... */);
}
```

---

### useAttendance

Hook for attendance registration.

```jsx
import { useAttendance } from '../hooks/useAttendance';

function AttendanceScanner() {
  const {
    attendance,
    loading,
    registerByQr,
    registerManually,
    fetchByAssembly,
    getStats
  } = useAttendance();

  const handleScan = async (qrHash) => {
    const result = await registerByQr(qrHash);
    if (result.success) {
      toast.success(`${result.data.member.fullName} registered`);
    }
  };

  return (/* ... */);
}
```

---

### useSavings

Hook for savings operations.

```jsx
import { useSavings } from '../hooks/useSavings';

function SavingsManagement() {
  const {
    memberSavings,
    transactions,
    loading,
    fetchMemberSavings,
    registerDeposit,
    registerWithdrawal,
    getInventory
  } = useSavings();

  const handleDeposit = async (memberId, amount, description) => {
    const result = await registerDeposit(memberId, amount, description);
    if (result.success) {
      toast.success(`Deposit of ₡${amount} registered`);
    }
  };

  return (/* ... */);
}
```

---

### useQrScanner

Hook for QR code scanning functionality.

```jsx
import { useQrScanner } from '../hooks/useQrScanner';

function ScannerPage() {
  const {
    isScanning,
    lastScannedCode,
    error,
    startScanning,
    stopScanning,
    resetScanner
  } = useQrScanner({
    onScanSuccess: handleScan,
    onScanError: handleError
  });

  return (
    <div>
      <Button onClick={isScanning ? stopScanning : startScanning}>
        {isScanning ? 'Stop' : 'Start'} Scanner
      </Button>
      <div id="qr-reader" />
    </div>
  );
}
```

---

### useDebounce

Debounce hook for search inputs.

```jsx
import { useDebounce } from '../hooks/useDebounce';

function SearchableList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchMembers({ search: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search members..."
    />
  );
}
```

---

### useNotifications

Hook for user notifications.

```jsx
import { useNotifications } from '../hooks/useNotifications';

function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  return (
    <div className="relative">
      <BellIcon />
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </div>
  );
}
```

---

## 📡 Services

### API Configuration

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Example

```javascript
// services/memberService.js
import api from './api';

export const memberService = {
  getAll: (params) => api.get('/members', { params }),

  getById: (id) => api.get(`/members/${id}`),

  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return api.post('/members', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  affiliate: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return api.post('/members/affiliate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  update: (id, data) => api.put(`/members/${id}`, data),

  delete: (id) => api.delete(`/members/${id}`),

  generateQr: (id) => api.get(`/members/${id}/qr`),

  batchQr: (memberIds) => api.post('/members/qr/batch', { memberIds }),

  verifyQr: (qrHash) => api.post('/members/qr/verify', { qrHash })
};
```

---

## 🗺️ Routing

### Route Configuration

```jsx
// App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />
  },
  {
    path: '/verify',
    element: <MemberVerifyPage />  // Public member verification
  },

  // Protected Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      { index: true, element: <DashboardPage /> },

      // Members (Administrator)
      {
        path: 'members',
        element: <ProtectedRoute requiredRole="administrator"><MembersListPage /></ProtectedRoute>
      },
      {
        path: 'members/new',
        element: <ProtectedRoute requiredRole="administrator"><MemberFormPage /></ProtectedRoute>
      },
      {
        path: 'members/:id',
        element: <MemberDetailPage />
      },

      // Assemblies (Administrator)
      {
        path: 'assemblies',
        element: <ProtectedRoute requiredRole="administrator"><AssembliesListPage /></ProtectedRoute>
      },

      // Attendance (Administrator, Registrar)
      {
        path: 'attendance/scan',
        element: <ProtectedRoute requiredRole={['administrator', 'registrar']}><AttendanceScanPage /></ProtectedRoute>
      },

      // Users (Administrator)
      {
        path: 'users',
        element: <ProtectedRoute requiredRole="administrator"><UsersListPage /></ProtectedRoute>
      },

      // Savings (Administrator, Manager)
      {
        path: 'savings',
        element: <ProtectedRoute requiredRole={['administrator', 'manager']}><SavingsManagementPage /></ProtectedRoute>
      },

      // Withdrawal Requests (Administrator, Manager)
      {
        path: 'withdrawals',
        element: <ProtectedRoute requiredRole={['administrator', 'manager']}><WithdrawalRequestsPage /></ProtectedRoute>
      },

      // Notifications
      {
        path: 'notifications',
        element: <NotificationsPage />
      },

      // Reports (Administrator)
      {
        path: 'reports',
        element: <ProtectedRoute requiredRole="administrator"><ReportsPage /></ProtectedRoute>
      }
    ]
  },

  // Member Portal
  {
    path: '/my',
    element: (
      <ProtectedRoute requiredRole="member">
        <MemberPortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <MemberDashboardPage /> },
      { path: 'transactions', element: <MemberTransactionsPage /> },
      { path: 'profile', element: <MemberProfilePage /> }
    ]
  },

  // Error Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
```

---

## 🎨 Styling

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        success: {
          500: '#10b981',
          600: '#059669'
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626'
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
```

### Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Print Styles

```css
/* index.css */
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  body {
    font-size: 12pt;
    color: black;
    background: white;
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# .env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CoopLink CR
VITE_APP_VERSION=1.0.0
```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
});
```

---

## 🔧 Build & Development

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start dev server |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview build |
| `lint` | `eslint src` | Lint code |

---

## 📚 Related Documentation

| Document | Description |
|----------|-------------|
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System architecture |
| [03-API-REST.md](./03-API-REST.md) | API endpoints |
| [05-AUTHENTICATION.md](./05-AUTHENTICATION.md) | Auth details |
| [07-INSTALLATION.md](./07-INSTALLATION.md) | Setup guide |

---

<div align="center">

**[⬆ Back to Top](#️-frontend-documentation)**

</div>
