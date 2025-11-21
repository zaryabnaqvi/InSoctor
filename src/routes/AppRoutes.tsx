import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/page-loader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';

// Lazy-loaded components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Alerts = lazy(() => import('@/pages/Alerts'));
const EDRLogsDashboard = lazy(() => import('@/pages/Logs'));
const RulesManagement = lazy(() => import('@/pages/Rules'));
const Threats = lazy(() => import('@/pages/Threats'));
const Endpoints = lazy(() => import('@/components/endpoints/Endpoints'));
const Network = lazy(() => import('@/pages/Network'));
const Users = lazy(() => import('@/pages/Users'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const SOAR = lazy(() => import('@/pages/SOAR'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/alerts" element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        } />

        <Route path="/siem/log" element={
          <ProtectedRoute>
            <EDRLogsDashboard />
          </ProtectedRoute>
        } />

        <Route path="/siem/rules" element={
          <ProtectedRoute>
            <RulesManagement />
          </ProtectedRoute>
        } />

        <Route path="/threats" element={
          <ProtectedRoute>
            <Threats />
          </ProtectedRoute>
        } />

        <Route path="/endpoints" element={
          <ProtectedRoute>
            <Endpoints />
          </ProtectedRoute>
        } />

        <Route path="/network" element={
          <ProtectedRoute>
            <Network />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />

        <Route path="/integrations" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Integrations />
          </ProtectedRoute>
        } />

        <Route path="/soar" element={
          <ProtectedRoute allowedRoles={['admin', 'analyst']}>
            <SOAR />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Catch 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}