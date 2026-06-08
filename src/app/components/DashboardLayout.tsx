import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, LogOut, Menu, X } from "lucide-react";
import { useAuth, ROLE_CONFIG, type UserRole } from "../context/AuthContext";

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({
  children,
  navItems,
  activeSection,
  onSectionChange,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = userRole as UserRole;
  const roleConf = role ? ROLE_CONFIG[role] : null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavItem = (id: string) => {
    onSectionChange(id);
    setSidebarOpen(false);
  };

  /* ─── Sidebar content (shared between desktop & mobile drawer) ─ */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "18px",
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textDecoration: "none",
          }}
        >
          SaberUnerg
        </Link>
        {/* Close button on mobile */}
        <button
          className="md:hidden p-1"
          onClick={() => setSidebarOpen(false)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <X size={18} color="rgba(255,255,255,0.5)" />
        </button>
      </div>

      {/* User info */}
      {user && (
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: "36px",
                height: "36px",
                background: roleConf?.color ?? "#3ecf8e",
                fontSize: "16px",
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#fff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name.split(" ").slice(0, 2).join(" ")}
              </p>
              {roleConf && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: roleConf.color,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {roleConf.label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavItem(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded mb-1 text-left"
              style={{
                background: isActive ? `${roleConf?.color ?? "#3ecf8e"}15` : "transparent",
                borderLeft: isActive
                  ? `2px solid ${roleConf?.color ?? "#3ecf8e"}`
                  : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                border: "none",
              }}
            >
              {item.icon && (
                <span
                  style={{
                    color: isActive ? (roleConf?.color ?? "#3ecf8e") : "rgba(255,255,255,0.4)",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
              )}
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  flex: 1,
                }}
              >
                {item.label}
              </span>
              {item.badge != null && item.badge > 0 && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    background: roleConf?.color ?? "#3ecf8e",
                    borderRadius: "10px",
                    padding: "1px 7px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded mb-1"
          style={{ background: "transparent", textDecoration: "none", transition: "background 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <ArrowLeft size={14} color="rgba(255,255,255,0.4)" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.45)" }}>
            Volver al sitio
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(224,82,82,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={14} color="rgba(224,82,82,0.6)" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "rgba(224,82,82,0.7)" }}>
            Cerrar sesión
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#f5f5f5" }}>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex flex-shrink-0 flex-col"
        style={{
          width: "240px",
          background: "#0b0b0b",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSidebarOpen(false);
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          />
          {/* Drawer */}
          <div
            className="relative flex flex-col"
            style={{
              width: "280px",
              background: "#0b0b0b",
              height: "100vh",
              overflowY: "auto",
              zIndex: 1,
              boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
            }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header
          className="px-4 md:px-8 py-4 md:py-5 flex items-center justify-between flex-shrink-0"
          style={{
            background: "#fff",
            borderBottom: "1px solid #efefef",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded"
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "#f5f5f5",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={16} color="#555" />
            </button>

            <div>
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#0b0b0b",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    color: "#aaa",
                    marginTop: "1px",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {roleConf && role && (
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                color: roleConf.color,
                background: roleConf.bg,
                border: `1px solid ${roleConf.color}30`,
                padding: "4px 12px",
                borderRadius: "20px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              {roleConf.label}
            </span>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
