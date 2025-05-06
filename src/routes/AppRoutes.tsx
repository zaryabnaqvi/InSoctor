import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/page-loader';
import EDRLogsDashboard from '@/pages/Logs';
import RulesManagement from '@/pages/Rules';
import { UserManagementDashboard } from '@/components/user-management/UserManagementDashboard';

// Lazy-loaded components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Alerts = lazy(() => import('@/pages/Alerts'));
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
        <Route path="/" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/siem/log" element={<EDRLogsDashboard />} />
        <Route path="/siem/rules" element={<RulesManagement />} />


        <Route path="/threats" element={<Threats />} />
        <Route path="/endpoints" element={<Endpoints />} />
        <Route path="/network" element={<Network />} />
        <Route path="/users" element={<UserManagementDashboard />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/soar" element={<SOAR />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Catch 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}