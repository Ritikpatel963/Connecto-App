import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { sidebarSections } from "../data/adminSchema";

const navClass = ({ isActive }) => (isActive ? "active-page" : "");

const SidebarGroup = ({ section, open, onToggle, onNavigate }) => (
  <li className={open ? "dropdown open" : "dropdown"}>
    <a
      href={`#${section.id}`}
      onClick={(event) => {
        event.preventDefault();
        onToggle(section.id);
      }}
      aria-expanded={open}
    >
      <Icon icon={section.icon} className="menu-icon" />
      <span>{section.label}</span>
    </a>
    <ul
      className="sidebar-submenu"
      style={{ display: open ? "block" : "none", maxHeight: open ? `${section.items.length * 52}px` : "0px" }}
    >
      {section.items.map(([key, label]) => (
        <li key={key}>
          <NavLink to={`/admin/${key}`} className={navClass} onClick={onNavigate}>
            <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </li>
);

const MasterLayout = ({ children }) => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  const activeSection = useMemo(
    () => sidebarSections.find((section) => section.items.some(([key]) => location.pathname === `/admin/${key}`))?.id,
    [location.pathname]
  );
  const [openMenus, setOpenMenus] = useState(() => activeSection ? { [activeSection]: true } : { people: true });

  const toggleMenu = (id) => setOpenMenus((current) => ({ ...current, [id]: !current[id] }));
  const closeMobileMenu = () => setMobileMenu(false);

  const settingsOpen = openMenus.settings || location.pathname.startsWith("/settings");

  return (
    <section className={mobileMenu ? "overlay active" : "overlay"}>
      <aside className={sidebarActive ? "sidebar active" : mobileMenu ? "sidebar sidebar-open" : "sidebar"}>
        <button onClick={closeMobileMenu} type="button" className="sidebar-close-btn" aria-label="Close navigation">
          <Icon icon="radix-icons:cross-2" />
        </button>

        <Link to="/" className="sidebar-logo" onClick={closeMobileMenu}>
          <img src="/assets/images/logo.png" alt="Connecting People" className="light-logo" />
          <img src="/assets/images/logo-light.png" alt="Connecting People" className="dark-logo" />
          <img src="/assets/images/logo-icon.png" alt="Connecting People" className="logo-icon" />
        </Link>

        <div className="sidebar-menu-area">
          <ul className="sidebar-menu">
            <li className="sidebar-menu-group-title">Platform</li>
            <li>
              <NavLink to="/" end className={navClass} onClick={closeMobileMenu}>
                <Icon icon="solar:chart-2-outline" className="menu-icon" />
                <span>Overview</span>
              </NavLink>
            </li>

            {sidebarSections.map((section) => (
              <SidebarGroup
                key={section.id}
                section={section}
                open={Boolean(openMenus[section.id] || activeSection === section.id)}
                onToggle={toggleMenu}
                onNavigate={closeMobileMenu}
              />
            ))}

            <li className="sidebar-menu-group-title">Applications</li>
            <li>
              <NavLink to="/chat" className={navClass} onClick={closeMobileMenu}>
                <Icon icon="bi:chat-dots" className="menu-icon" />
                <span>Live Chat</span>
              </NavLink>
            </li>

            <li className={settingsOpen ? "dropdown open" : "dropdown"}>
              <a href="#settings" onClick={(event) => { event.preventDefault(); toggleMenu("settings"); }} aria-expanded={settingsOpen}>
                <Icon icon="solar:settings-outline" className="menu-icon" />
                <span>System Settings</span>
              </a>
              <ul className="sidebar-submenu" style={{ display: settingsOpen ? "block" : "none", maxHeight: settingsOpen ? "430px" : "0px" }}>
                {[
                  ["/settings/company", "Company"],
                  ["/settings/notifications", "Notifications"],
                  ["/settings/notification-alerts", "Alert rules"],
                  ["/settings/payment-gateway", "Payment gateway"],
                  ["/settings/currencies", "Currencies"],
                  ["/settings/languages", "Languages"],
                  ["/settings/theme", "Appearance"],
                  ["/settings/profile", "My profile"],
                ].map(([to, label]) => (
                  <li key={to}>
                    <NavLink to={to} className={navClass} onClick={closeMobileMenu}>
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </aside>

      <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button type="button" className="sidebar-toggle" onClick={() => setSidebarActive((active) => !active)} aria-label="Toggle sidebar">
                  <Icon icon="heroicons:bars-3-solid" className="icon text-2xl non-active" />
                  <Icon icon="iconoir:arrow-right" className="icon text-2xl active" />
                </button>
                <button type="button" className="sidebar-mobile-toggle" onClick={() => setMobileMenu(true)} aria-label="Open navigation">
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>
                <div className="position-relative d-none d-md-block">
                  <Icon icon="solar:magnifer-linear" className="position-absolute top-50 start-0 translate-middle-y ms-16 text-secondary-light" />
                  <input className="form-control ps-40 bg-neutral-50 border-0" style={{ width: 290 }} placeholder="Search users, calls, payments..." />
                </div>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link to="/admin/id-verifications" className="position-relative w-40-px h-40-px bg-warning-focus text-warning-main rounded-circle d-flex align-items-center justify-content-center" title="Pending approvals">
                  <Icon icon="solar:inbox-unread-outline" className="text-xl" />
                  <span className="position-absolute top-0 end-0 translate-middle-y w-16-px h-16-px rounded-circle bg-danger-main text-white text-xxs d-flex align-items-center justify-content-center">8</span>
                </Link>
                <ThemeToggleButton />
                <Link to="/settings/profile" className="d-flex align-items-center gap-10 text-decoration-none">
                  <span className="w-40-px h-40-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center fw-bold">NV</span>
                  <span className="d-none d-lg-block">
                    <span className="d-block text-sm fw-semibold text-primary-light">Neha Verma</span>
                    <span className="d-block text-xs text-secondary-light">Super admin</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-main-body">{children}</div>

        <footer className="d-footer">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto"><p className="mb-0">© 2026 Connecting People</p></div>
            <div className="col-auto"><p className="mb-0 text-secondary-light">Admin control centre</p></div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;
