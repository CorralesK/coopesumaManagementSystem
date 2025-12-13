/**
 * App Component
 * Main application component with routing configuration
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import { USER_ROLES } from './utils/constants';

// Auth Pages
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Public Pages
import MemberVerifyPage from './pages/public/MemberVerifyPage';

// Main Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Member Pages
import MembersListPage from './pages/members/MembersListPage';
import MemberFormPage from './pages/members/MemberFormPage';
import MemberDetailPage from './pages/members/MemberDetailPage';
import MemberDashboardPage from './pages/members/MemberDashboardPage';
import MemberTransactionsPage from './pages/members/MemberTransactionsPage';
import MemberProfilePage from './pages/members/MemberProfilePage';
import MemberNotificationsPage from './pages/members/MemberNotificationsPage';

// Assembly Pages
import AssembliesListPage from './pages/assemblies/AssembliesListPage';
import AssemblyFormPage from './pages/assemblies/AssemblyFormPage';
import AssemblyDetailPage from './pages/assemblies/AssemblyDetailPage';

// Attendance Pages (placeholders - will be implemented)
import AttendanceScanPage from './pages/attendance/AttendanceScanPage';

// User Pages
import UsersListPage from './pages/users/UsersListPage';
import UserFormPage from './pages/users/UserFormPage';
import UserDetailPage from './pages/users/UserDetailPage';

// Report Pages (placeholders - will be implemented)
import ReportsPage from './pages/reports/ReportsPage';

// Financial Pages
import WithdrawalRequestPage from './pages/withdrawals/WithdrawalRequestPage';
import WithdrawalRequestsManagementPage from './pages/withdrawals/WithdrawalRequestsManagementPage';
// TEMPORARILY HIDDEN - Surplus distribution feature not ready for presentation
// import SurplusDistributionPage from './pages/surplus/SurplusDistributionPage';
import SavingsManagementPage from './pages/savings/SavingsManagementPage';
import SavingsInventoryPage from './pages/savings/SavingsInventoryPage';
import SavingsMonthlyDetailPage from './pages/savings/SavingsMonthlyDetailPage';
import MemberSavingsDashboardPage from './pages/savings/MemberSavingsDashboardPage';
// TEMPORARILY HIDDEN - Contributions feature not ready for presentation
// import ContributionsManagementPage from './pages/contributions/ContributionsManagementPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/auth/success" element={<AuthCallbackPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="/verify" element={<MemberVerifyPage />} />

                    {/* Protected Routes with Layout */}

                    {/* Member Personal Dashboard (Member role only) */}
                    <Route
                        path="/my-dashboard"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                                <Layout>
                                    <MemberDashboardPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Member Transactions History (Member role only) */}
                    <Route
                        path="/my-transactions"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                                <Layout>
                                    <MemberTransactionsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Member Profile (Member role only) */}
                    <Route
                        path="/my-profile"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                                <Layout>
                                    <MemberProfilePage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Member Notifications (Member role only) */}
                    <Route
                        path="/my-notifications"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                                <Layout>
                                    <MemberNotificationsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Member Withdrawal Requests (Member role only) - Keep for backwards compatibility */}
                    <Route
                        path="/my-withdrawals"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.MEMBER}>
                                <Layout>
                                    <WithdrawalRequestPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Dashboard (Administrator only) */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <DashboardPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Members Routes (Administrator only) */}
                    <Route
                        path="/members"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <MembersListPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/members/new"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <MemberFormPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/members/:id"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <MemberDetailPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/members/:id/edit"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <MemberFormPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Assemblies Routes (Administrator only) */}
                    <Route
                        path="/assemblies"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <AssembliesListPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assemblies/:id"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <AssemblyDetailPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assemblies/new"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <AssemblyFormPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assemblies/:id/edit"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <AssemblyFormPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Attendance Routes (Administrator and Registrar) */}
                    <Route
                        path="/attendance/scan"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.REGISTRAR]}>
                                <Layout>
                                    <AttendanceScanPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Users Routes (Administrator only) */}
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <UsersListPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users/new"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <UserFormPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users/:id"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <UserDetailPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users/:id/edit"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <UserFormPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Reports Routes (Administrator only) */}
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
                                <Layout>
                                    <ReportsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Withdrawal Requests Management (Administrator and Manager) */}
                    <Route
                        path="/withdrawals"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <WithdrawalRequestsManagementPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* TEMPORARILY HIDDEN - Surplus Distribution (Administrator and Manager) */}
                    {/* <Route
                        path="/surplus"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <SurplusDistributionPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    /> */}

                    {/* Savings Management (Administrator and Manager) */}
                    <Route
                        path="/savings"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <SavingsManagementPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/savings/inventory/:fiscalYear"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <SavingsInventoryPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/savings/inventory/:fiscalYear/:month"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <SavingsMonthlyDetailPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/members/:memberId/savings"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <MemberSavingsDashboardPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* TEMPORARILY HIDDEN - Contributions Management (Administrator and Manager) */}
                    {/* <Route
                        path="/contributions"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <ContributionsManagementPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    /> */}

                    {/* Notifications (Administrator and Manager) */}
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute requiredRole={[USER_ROLES.ADMINISTRATOR, USER_ROLES.MANAGER]}>
                                <Layout>
                                    <NotificationsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Redirects */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
