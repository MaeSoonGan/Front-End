import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { InfraLayout } from '../layouts/InfraLayout';
import { UserLayout } from '../layouts/UserLayout';

// admin - dashboard
import { AdminDashboardPage } from '../pages/admin/dashboard/AdminDashboardPage';

// admin - members
import { AdminUserManagePage } from '../pages/admin/members/AdminUserManagePage';
import { AdminSuspensionPage } from '../pages/admin/members/AdminSuspensionPage';
import { AdminSeedMoneyPage } from '../pages/admin/members/AdminSeedMoneyPage';

// admin - contests
import { AdminContestManagePage } from '../pages/admin/contests/AdminContestManagePage';
import { AdminRankingPage } from '../pages/admin/contests/AdminRankingPage';

// admin - contents
import { AdminNoticeManagePage } from '../pages/admin/contents/AdminNoticeManagePage';

// admin - system
import { AdminMonitoringPage } from '../pages/admin/system/AdminMonitoringPage';
import { AdminAuditLogPage } from '../pages/admin/system/AdminAuditLogPage';
import { AdminSystemManagePage } from '../pages/admin/system/AdminSystemManagePage';

// auth
import { FindAccountPage } from '../pages/auth/FindAccountPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPasswordCompletePage } from '../pages/auth/ResetPasswordCompletePage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { SignupPage } from '../pages/auth/SignupPage';

// infra
import { InfraDashboardPage } from '../pages/infra/InfraDashboardPage';

// user
import { ContestDetailPage } from '../pages/user/ContestDetailPage';
import { ContestListPage } from '../pages/user/ContestListPage';
import { ContestRankingPage } from '../pages/user/ContestRankingPage';
import { ExecutionHistoryPage } from '../pages/user/ExecutionHistoryPage';
import { HomePage } from '../pages/user/HomePage';
import { MarketPage } from '../pages/user/MarketPage';
import { MorePage } from '../pages/user/MorePage';
import { NotificationPage } from '../pages/user/NotificationPage';
import { OrderPage } from '../pages/user/OrderPage';
import { ProfileEditPage } from '../pages/user/ProfileEditPage';
import { WatchlistPage } from '../pages/user/WatchlistPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/find-account', element: <FindAccountPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/reset-password/complete', element: <ResetPasswordCompletePage /> },
    ],
  },
  {
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/home', element: <HomePage /> },
      { path: '/market', element: <MarketPage /> },
      { path: '/order', element: <OrderPage /> },
      { path: '/watchlist', element: <WatchlistPage /> },
      { path: '/contests', element: <ContestListPage /> },
      { path: '/contests/:contestId', element: <ContestDetailPage /> },
      { path: '/contests/:contestId/ranking', element: <ContestRankingPage /> },
      { path: '/more', element: <MorePage /> },
      { path: '/executions', element: <ExecutionHistoryPage /> },
      { path: '/notifications', element: <NotificationPage /> },
      { path: '/profile/edit', element: <ProfileEditPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUserManagePage /> },
      { path: 'suspensions', element: <AdminSuspensionPage /> },
      { path: 'seed-money', element: <AdminSeedMoneyPage /> },
      { path: 'contests', element: <AdminContestManagePage /> },
      { path: 'rankings', element: <AdminRankingPage /> },
      { path: 'notices', element: <AdminNoticeManagePage /> },
      { path: 'monitoring', element: <AdminMonitoringPage /> },
      { path: 'audit-log', element: <AdminAuditLogPage /> },
      { path: 'system', element: <AdminSystemManagePage /> },
    ],
  },
  {
    path: '/infra',
    element: <InfraLayout />,
    children: [{ path: 'dashboard', element: <InfraDashboardPage /> }],
  },
]);
