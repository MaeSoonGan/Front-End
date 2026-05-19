import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { InfraLayout } from '../layouts/InfraLayout';
import { UserLayout } from '../layouts/UserLayout';
import { AdminContestManagePage } from '../pages/admin/AdminContestManagePage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminNoticeManagePage } from '../pages/admin/AdminNoticeManagePage';
import { AdminSystemManagePage } from '../pages/admin/AdminSystemManagePage';
import { AdminUserManagePage } from '../pages/admin/AdminUserManagePage';
import { FindAccountPage } from '../pages/auth/FindAccountPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { InfraDashboardPage } from '../pages/infra/InfraDashboardPage';
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
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUserManagePage /> },
      { path: 'contests', element: <AdminContestManagePage /> },
      { path: 'notices', element: <AdminNoticeManagePage /> },
      { path: 'system', element: <AdminSystemManagePage /> },
    ],
  },
  {
    path: '/infra',
    element: <InfraLayout />,
    children: [{ path: 'dashboard', element: <InfraDashboardPage /> }],
  },
]);
