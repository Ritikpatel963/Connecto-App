import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import AdminsPage from "./pages/AdminsPage";
import CallsPage from "./pages/CallsPage";
import ChatPage from "./pages/ChatPage";
import ChatProfilePage from "./pages/ChatProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ManualRechargePage from "./pages/ManualRechargePage";
import NotificationsPage from "./pages/NotificationsPage";
import RatingsPage from "./pages/RatingsPage";
import RedemptionsPage from "./pages/RedemptionsPage";
import ReferralTiersPage from "./pages/ReferralTiersPage";
import ReferralsPage from "./pages/ReferralsPage";
import RolesPage from "./pages/RolesPage";
import SettingsPage from "./pages/SettingsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import UserDetailPage from "./pages/UserProfilePage";
import UsersPage from "./pages/UsersPage";
import VerificationsPage from "./pages/VerificationsPage";
import WalletTransactionsPage from "./pages/WalletTransactionsPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./auth/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/verifications/id" element={<VerificationsPage type="id" />} />
        <Route path="/verifications/voice" element={<VerificationsPage type="voice" />} />
        <Route path="/calls" element={<CallsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/profile" element={<ChatProfilePage />} />
        <Route path="/ratings" element={<RatingsPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/wallet/transactions" element={<WalletTransactionsPage />} />
        <Route path="/wallet/manual-approvals" element={<ManualRechargePage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/referrals/tiers" element={<ReferralTiersPage />} />
        <Route path="/referrals/redemptions" element={<RedemptionsPage />} />
        <Route path="/admin-access/admins" element={<AdminsPage />} />
        <Route path="/admin-access/roles" element={<RolesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
