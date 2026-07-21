import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../../helper/ThemeToggleButton";
import { AdminNotification, notificationsApi } from "../api/notifications";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../../lib/supabase";
import { usePushNotifications } from "../hooks/usePushNotifications";

interface NavItem { label: string; to: string; }
interface NavGroup { id: string; label: string; icon: string; items: NavItem[]; permission?: string; }

const groups: NavGroup[] = [
  { id: "users", label: "Users", icon: "solar:users-group-rounded-outline", items: [{ label: "All Users", to: "/users" }] },
  { id: "verifications", label: "Verifications", icon: "solar:shield-check-outline", items: [{ label: "ID Verifications", to: "/verifications/id" }, { label: "Voice Verifications", to: "/verifications/voice" }] },
  { id: "calls", label: "Calls", icon: "solar:phone-calling-outline", items: [{ label: "Call Log", to: "/calls" }] },
  { id: "chat", label: "Chat", icon: "solar:chat-round-dots-outline", items: [{ label: "Chat", to: "/chat" }] },
  { id: "notifications", label: "Notifications", icon: "solar:bell-bing-outline", items: [{ label: "Push Notifications", to: "/push-notifications" }] },
  { id: "ratings", label: "Ratings & Reviews", icon: "solar:star-outline", items: [{ label: "All Reviews", to: "/ratings" }] },
  { id: "subscriptions", label: "Packages", icon: "solar:crown-star-outline", items: [{ label: "All Packages", to: "/subscriptions" }] },
  { id: "wallet", label: "Wallet", icon: "solar:wallet-2-outline", items: [{ label: "Recharge Transactions", to: "/wallet/transactions" }, { label: "Manual Approvals", to: "/wallet/manual-approvals" }, { label: "Recharge Packages", to: "/recharge-packages" }, { label: "Withdraw Rules", to: "/settings#withdrawal" }, { label: "Withdrawals", to: "/withdrawals" }] },
  { id: "referrals", label: "Referral Program", icon: "solar:share-circle-outline", items: [{ label: "Referrals", to: "/referrals" }, { label: "Referral Tiers", to: "/referrals/tiers" }] },
  { id: "cms", label: "Content (CMS)", icon: "solar:document-text-outline", items: [{ label: "Manage Content", to: "/cms" }] },
  { id: "rbac", label: "Admin & Roles", icon: "solar:user-shield-outline", permission: "manage_admins", items: [{ label: "Admins", to: "/admin-access/admins" }, { label: "Roles", to: "/admin-access/roles" }] },
];

const itemClass = ({ isActive }: { isActive: boolean }) => isActive ? "active-page" : "";

const matchesPath = (pathname: string, to: string) => pathname === to || pathname.startsWith(to + '/');

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin: currentAdmin, signOut } = useAuth();
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery<AdminNotification[]>({ queryKey: ["admin-notifications"], queryFn: notificationsApi.list });
  const markNotificationRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  usePushNotifications(currentAdmin?.id);

  const visibleGroups = groups.filter((group) => !group.permission || currentAdmin?.permissions.includes(group.permission as never));
  const matchingGroup = useMemo(() => visibleGroups.find((group) => group.items.some((item) => matchesPath(location.pathname, item.to)))?.id, [location.pathname, visibleGroups]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggle = (id: string, isOpen: boolean) => setOpenGroups((current) => ({ ...current, [id]: !isOpen }));
  const closeMobile = () => setMobileMenu(false);
  const allNotifications: AdminNotification[] = notificationsQuery.data || [];
  const notifications = allNotifications.slice(0, 5);
  const notificationCount = allNotifications.filter((item) => !item.is_read).length;

  useEffect(() => {
    if (!notificationsOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const logout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay"}>
      <aside className={sidebarActive ? "sidebar active" : mobileMenu ? "sidebar sidebar-open" : "sidebar"}>
        <button onClick={closeMobile} type="button" className="sidebar-close-btn"><Icon icon="radix-icons:cross-2" /></button>
        <Link to="/" className="sidebar-logo" onClick={closeMobile}>
          <img src="/assets/images/logo.png" alt="Connecting People" className="light-logo" />
          <img src="/assets/images/logo-light.png" alt="Connecting People" className="dark-logo" />
          <img src="/assets/images/logo-icon.png" alt="Connecting People" className="logo-icon" />
        </Link>

        <div className="sidebar-menu-area">
          <ul className="sidebar-menu">
            <li className="sidebar-menu-group-title">Control centre</li>
            <li>
              <NavLink to="/" end className={itemClass} onClick={closeMobile}>
                <Icon icon="solar:chart-2-outline" className="menu-icon" /><span>Dashboard</span>
              </NavLink>
            </li>

            {visibleGroups.map((group) => {
              const active = matchingGroup === group.id;
              const open = openGroups[group.id] ?? active;
              return (
                <li className={`dropdown admin-navigation-group${open ? ' open' : ''}${active ? ' active-group' : ''}`} key={group.id}>
                  <a href={`#${group.id}`} onClick={(event) => { event.preventDefault(); toggle(group.id, open); }} aria-expanded={open}>
                    <Icon icon={group.icon} className="menu-icon" /><span>{group.label}</span>
                  </a>
                  <ul className="sidebar-submenu" style={{ display: open ? "block" : "none", maxHeight: open ? `${group.items.length * 52}px` : 0 }}>
                    {group.items.map((item) => (
                      <li key={item.to}><NavLink to={item.to} className={itemClass} onClick={closeMobile}><i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{item.label}</NavLink></li>
                    ))}
                  </ul>
                </li>
              );
            })}

            <li className="sidebar-menu-group-title">System</li>
            <li>
              <NavLink to="/settings" className={itemClass} onClick={closeMobile}>
                <Icon icon="solar:settings-outline" className="menu-icon" /><span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>

      <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex align-items-center gap-3">
                <button type="button" className="sidebar-toggle" onClick={() => setSidebarActive((value) => !value)}>
                  <Icon icon="heroicons:bars-3-solid" className="icon text-2xl non-active" /><Icon icon="iconoir:arrow-right" className="icon text-2xl active" />
                </button>
                <button type="button" className="sidebar-mobile-toggle" onClick={() => setMobileMenu(true)}><Icon icon="heroicons:bars-3-solid" /></button>
                <div className="position-relative d-none d-md-block">
                  <Icon icon="solar:magnifer-linear" className="position-absolute top-50 start-0 translate-middle-y ms-16 text-secondary-light" />
                  <input className="form-control ps-40 bg-neutral-50 border-0" style={{ width: 300 }} placeholder="Search admin resources..." />
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex align-items-center gap-3">
                <div className="admin-notification-wrap" ref={notificationRef}>
                  <button
                    type="button"
                    className="admin-notification-trigger position-relative w-40-px h-40-px rounded-circle bg-warning-focus text-warning-main d-flex align-items-center justify-content-center border-0"
                    aria-label="Notifications"
                    aria-expanded={notificationsOpen}
                    onClick={() => setNotificationsOpen((value) => !value)}
                  >
                    <Icon icon="solar:inbox-unread-outline" className="text-xl" />
                    {notificationCount > 0 && <span className="admin-notification-count position-absolute top-0 end-0 rounded-circle bg-danger-main text-white text-xxs d-flex align-items-center justify-content-center">{notificationCount > 99 ? "99+" : notificationCount}</span>}
                  </button>

                  {notificationsOpen && (
                    <div className="admin-notification-popover card" role="dialog" aria-label="Notifications">
                      <div className="admin-notification-header d-flex align-items-center justify-content-between gap-3">
                        <div><h6 className="mb-2">Notifications</h6><p className="mb-0 text-secondary-light">Recent admin activity</p></div>
                        <span className="bg-danger-focus text-danger-main rounded-pill px-10 py-4 text-xs fw-bold">{notificationCount}</span>
                      </div>
                      <div className="admin-notification-list">
                        {notificationsQuery.isLoading && <div className="admin-notification-state text-secondary-light">Loading notifications...</div>}
                        {!notificationsQuery.isLoading && notifications.length === 0 && <div className="admin-notification-state text-secondary-light">No notifications yet.</div>}
                        {notifications.map((item) => (
                          <Link key={item.id} to={item.to} className={`admin-notification-item d-flex align-items-center gap-12 text-decoration-none ${item.is_read ? "read" : "unread"}`} onClick={() => { setNotificationsOpen(false); if (!item.is_read) markNotificationRead.mutate(item.id); }}>
                            <span className={`admin-notification-icon rounded-circle bg-${item.tone}-focus text-${item.tone}-main d-flex align-items-center justify-content-center flex-shrink-0`}><Icon icon={item.icon} /></span>
                            <span className="min-w-0 flex-grow-1">
                              <span className="d-flex align-items-center gap-2"><span className="d-block fw-semibold text-primary-light text-truncate">{item.title}</span>{!item.is_read && <span className="admin-notification-unread-dot flex-shrink-0" />}</span>
                              <span className="d-block text-xs text-secondary-light text-truncate">{item.message}</span>
                              <span className="d-block admin-notification-time">{item.time}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Link to="/notifications" className="admin-notification-view-more btn btn-primary-600" onClick={() => setNotificationsOpen(false)}>View more</Link>
                    </div>
                  )}
                </div>
                <ThemeToggleButton />
                <div className="d-flex align-items-center gap-10">
                  <span className="w-40-px h-40-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center fw-bold">
                    {currentAdmin?.name.split(" ").map((part: string) => part[0]).slice(0, 2).join("") || "AD"}
                  </span>
                  <span className="d-none d-lg-block">
                    <span className="d-block text-sm fw-semibold">{currentAdmin?.name || "Admin"}</span>
                    <span className="d-block text-xs text-secondary-light">{currentAdmin?.role || "Admin"}</span>
                  </span>
                  <button type="button" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={logout} title="Sign out"><Icon icon="solar:logout-2-outline" /><span className="d-none d-xl-inline">Logout</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-main-body"><Outlet /></div>
        <footer className="d-footer"><div className="d-flex flex-wrap justify-content-between gap-2"><p className="mb-0">Copyright {new Date().getFullYear()} Snappo</p><p className="mb-0 text-secondary-light">Created by <a href="https://crescitasoftware.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 fw-semibold">Crescita Software</a></p></div></footer>
      </main>
    </section>
  );
};

export default AdminLayout;


