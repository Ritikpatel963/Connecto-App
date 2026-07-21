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
import PushNotificationsPage from "./pages/PushNotificationsPage";
import RatingsPage from "./pages/RatingsPage";
import RedemptionsPage from "./pages/RedemptionsPage";
import ReferralTiersPage from "./pages/ReferralTiersPage";
import ReferralsPage from "./pages/ReferralsPage";
import RolesPage from "./pages/RolesPage";
import CMSPage from "./pages/CMSPage";
import SettingsPage from "./pages/SettingsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import UserProfilePage from "./pages/UserProfilePage";
import UsersPage from "./pages/UsersPage";
import VerificationsPage from "./pages/VerificationsPage";
import WalletTransactionsPage from "./pages/WalletTransactionsPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import PermissionRoute from "./auth/PermissionRoute";
import CreatePackagePage from "./pages/CreatePackagePage";
import EditPackagePage from "./pages/EditPackagePage";
import RechargePackagesPage from "./pages/RechargePackagesPage";
import CreateRechargePackagePage from "./pages/CreateRechargePackagePage";
import EditRechargePackagePage from "./pages/EditRechargePackagePage";
import WithdrawalsPage from "./pages/WithdrawalsPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />

        {/* Users — manage_users */}
        <Route element={<PermissionRoute require="manage_users" />}>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
        </Route>

        {/* Verifications — verify_id / verify_voice */}
        <Route element={<PermissionRoute require="verify_id" />}>
          <Route path="/verifications/id" element={<VerificationsPage type="id" />} />
        </Route>
        <Route element={<PermissionRoute require="verify_voice" />}>
          <Route path="/verifications/voice" element={<VerificationsPage type="voice" />} />
        </Route>

        {/* Calls & Chat — open to all authenticated admins */}
        <Route path="/calls" element={<CallsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/profile" element={<ChatProfilePage />} />
        <Route path="/ratings" element={<RatingsPage />} />

        {/* Packages — open to all authenticated admins */}
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/packages/create" element={<CreatePackagePage />} />
        <Route path="/packages/edit/:id" element={<EditPackagePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/push-notifications" element={<PushNotificationsPage />} />

        {/* Wallet — approve_wallet_recharge */}
        <Route element={<PermissionRoute require="approve_wallet_recharge" />}>
          <Route path="/wallet/transactions" element={<WalletTransactionsPage />} />
          <Route path="/wallet/manual-approvals" element={<ManualRechargePage />} />
          <Route path="/recharge-packages" element={<RechargePackagesPage />} />
          <Route path="/recharge-packages/create" element={<CreateRechargePackagePage />} />
          <Route path="/recharge-packages/edit/:id" element={<EditRechargePackagePage />} />
          <Route path="/withdrawals" element={<WithdrawalsPage />} />
        </Route>

        {/* Referrals — approve_referral_redemption */}
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/referrals/tiers" element={<ReferralTiersPage />} />
        <Route element={<PermissionRoute require="approve_referral_redemption" />}>
          <Route path="/referrals/redemptions" element={<RedemptionsPage />} />
        </Route>

        {/* Admin & Roles — manage_admins */}
        <Route element={<PermissionRoute require="manage_admins" />}>
          <Route path="/admin-access/admins" element={<AdminsPage />} />
          <Route path="/admin-access/roles" element={<RolesPage />} />
        </Route>

        <Route path="/cms" element={<CMSPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;


