import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import EntityPage from "./pages/admin/EntityPage";
import ChatMessagePage from "./pages/ChatMessagePage";
import ChatProfilePage from "./pages/ChatProfilePage";
import CompanyPage from "./pages/CompanyPage";
import CurrenciesPage from "./pages/CurrenciesPage";
import LanguagePage from "./pages/LanguagePage";
import NotificationPage from "./pages/NotificationPage";
import NotificationAlertPage from "./pages/NotificationAlertPage";
import PaymentGatewayPage from "./pages/PaymentGatewayPage";
import ThemePage from "./pages/ThemePage";
import ViewProfilePage from "./pages/ViewProfilePage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <ToastContainer position="top-right" autoClose={3200} newestOnTop theme="colored" />
      <Routes>
        <Route path="/" element={<AdminDashboardPage />} />
        <Route path="/admin/:entityKey" element={<EntityPage />} />
        <Route path="/chat" element={<ChatMessagePage />} />
        <Route path="/chat/profile" element={<ChatProfilePage />} />
        <Route path="/settings/company" element={<CompanyPage />} />
        <Route path="/settings/currencies" element={<CurrenciesPage />} />
        <Route path="/settings/languages" element={<LanguagePage />} />
        <Route path="/settings/notifications" element={<NotificationPage />} />
        <Route path="/settings/notification-alerts" element={<NotificationAlertPage />} />
        <Route path="/settings/payment-gateway" element={<PaymentGatewayPage />} />
        <Route path="/settings/theme" element={<ThemePage />} />
        <Route path="/settings/profile" element={<ViewProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
