/**
 * App Component
 * Main application component with routing configuration
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Member Pages (placeholders - will be implemented)
import MembersListPage from './pages/members/MembersListPage';
import MemberFormPage from './pages/members/MemberFormPage';
import MemberDetailPage from './pages/members/MemberDetailPage';

// Assembly Pages
import AssembliesListPage from './pages/assemblies/AssembliesListPage';
import AssemblyFormPage from './pages/assemblies/AssemblyFormPage';
import AssemblyDetailPage from './pages/assemblies/AssemblyDetailPage';

// Attendance Pages (placeholders - will be implemented)
import AttendanceScanPage from './pages/attendance/AttendanceScanPage';

// User Pages (placeholders - will be implemented)
import UsersListPage from './pages/users/UsersListPage';
import UserFormPage from './pages/users/UserFormPage';

// Report Pages (placeholders - will be implemented)
import ReportsPage from './pages/reports/ReportsPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/auth/success" element={<AuthCallbackPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="/verify" element={<MemberVerifyPage />} />

                    {/* Protected Routes with Layout */}
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
                            <ProtectedRoute requiredRole={USER_ROLES.ADMINISTRATOR}>
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

                    {/* Default Redirects */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
