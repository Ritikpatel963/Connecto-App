import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import ThemeToggleButton from "../../helper/ThemeToggleButton";
import { dashboardApi } from "../api/dashboard";

interface NavItem { label: string; to: string; }
interface NavGroup { id: string; label: string; icon: string; items: NavItem[]; permission?: string; }

const groups: NavGroup[] = [
  { id: "users", label: "Users", icon: "solar:users-group-rounded-outline", items: [{ label: "All Users", to: "/users" }] },
  { id: "verifications", label: "Verifications", icon: "solar:shield-check-outline", items: [{ label: "ID Verifications", to: "/verifications/id" }, { label: "Voice Verifications", to: "/verifications/voice" }] },
  { id: "calls", label: "Calls", icon: "solar:phone-calling-outline", items: [{ label: "Call Log", to: "/calls" }] },
  { id: "chat", label: "Chat", icon: "solar:chat-round-dots-outline", items: [{ label: "Chat", to: "/chat" }] },
  { id: "ratings", label: "Ratings & Reviews", icon: "solar:star-outline", items: [{ label: "All Reviews", to: "/ratings" }] },
  { id: "wallet", label: "Wallet", icon: "solar:wallet-2-outline", items: [{ label: "Transactions", to: "/wallet/transactions" }, { label: "Manual Approvals", to: "/wallet/manual-approvals" }] },
  { id: "referrals", label: "Referral Program", icon: "solar:share-circle-outline", items: [{ label: "Referrals", to: "/referrals" }, { label: "Referral Tiers", to: "/referrals/tiers" }, { label: "Redemptions", to: "/referrals/redemptions" }] },
  { id: "rbac", label: "Admin & Roles", icon: "solar:user-shield-outline", permission: "manage_admins", items: [{ label: "Admins", to: "/admin-access/admins" }, { label: "Roles", to: "/admin-access/roles" }, { label: "Permissions", to: "/admin-access/permissions" }] },
];

const itemClass = ({ isActive }: { isActive: boolean }) => isActive ? "active-page" : "";

const matchesPath = (pathname: string, to: string) => pathname === to || pathname.startsWith(to + '/');

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const currentAdmin = useQuery({ queryKey: ["current-admin"], queryFn: dashboardApi.currentAdmin });

  const visibleGroups = groups.filter((group) => !group.permission || currentAdmin.data?.permissions.includes(group.permission as never));
  const matchingGroup = useMemo(() => visibleGroups.find((group) => group.items.some((item) => matchesPath(location.pathname, item.to)))?.id, [location.pathname, visibleGroups]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggle = (id: string, isOpen: boolean) => setOpenGroups((current) => ({ ...current, [id]: !isOpen }));
  const closeMobile = () => setMobileMenu(false);

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
                <Link to="/verifications/id" className="position-relative w-40-px h-40-px rounded-circle bg-warning-focus text-warning-main d-flex align-items-center justify-content-center">
                  <Icon icon="solar:inbox-unread-outline" className="text-xl" /><span className="position-absolute top-0 end-0 w-16-px h-16-px rounded-circle bg-danger-main text-white text-xxs d-flex align-items-center justify-content-center">8</span>
                </Link>
                <ThemeToggleButton />
                <div className="d-flex align-items-center gap-10">
                  <span className="w-40-px h-40-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center fw-bold">
                    {currentAdmin.data?.name.split(" ").map((part: string) => part[0]).slice(0, 2).join("") || "AD"}
                  </span>
                  <span className="d-none d-lg-block">
                    <span className="d-block text-sm fw-semibold">{currentAdmin.data?.name || "Loading..."}</span>
                    <span className="d-block text-xs text-secondary-light">{currentAdmin.data?.role || "Admin"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-main-body"><Outlet /></div>
        <footer className="d-footer"><div className="d-flex flex-wrap justify-content-between gap-2"><p className="mb-0">Copyright {new Date().getFullYear()} Connecto</p><p className="mb-0 text-secondary-light">Created by <a href="https://crescitasoftware.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 fw-semibold">Crescita Software</a></p></div></footer>
      </main>
    </section>
  );
};

export default AdminLayout;
