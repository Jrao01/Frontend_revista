import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Search, X, Menu, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth, ROLE_CONFIG } from "../context/AuthContext";

interface HeaderProps {
  theme?: "dark" | "light";
}

const navItems = [
  { label: "Inicio", path: "/", color: undefined, highlight: false },
  { label: "Archivos", path: "/archivos", color: undefined, highlight: false },
  { label: "Biología", path: "/categoria/biologia", color: "#3ecf8e", highlight: false },
  { label: "Física", path: "/categoria/fisica", color: "#9b7fd4", highlight: false },
  { label: "Química", path: "/categoria/quimica", color: "#e8c55e", highlight: false },
  { label: "Acerca de", path: "/acerca", color: undefined, highlight: false },
  { label: "Publicar", path: "/publicar", color: "#3ecf8e", highlight: true },
];

export function Header({ theme = "light" }: HeaderProps) {
  const { isLoggedIn, user, userRole, openAuth, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDark = theme === "dark";
  const roleConf = userRole ? ROLE_CONFIG[userRole] : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`w-full z-50 ${isDark ? "absolute top-0 left-0" : "border-b"}`}
      style={{
        borderColor: isDark ? "transparent" : "#e8e8e8",
        background: isDark ? "transparent" : "#ffffff",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center h-[60px] gap-8">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px",
              fontWeight: 600,
              color: isDark ? "#ffffff" : "#0b0b0b",
              letterSpacing: "-0.02em",
              transition: "opacity 0.2s",
            }}
          >
            CienciaEduc
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isCategory = item.path.startsWith("/categoria");

            if (item.highlight) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: isDark ? "#0b0b0b" : "#ffffff",
                    background: isDark ? "#3ecf8e" : "#0b0b0b",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    transition: "opacity 0.2s",
                  }}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  fontWeight: isActive ? 500 : 400,
                  color:
                    isActive && isCategory && item.color
                      ? item.color
                      : isActive
                      ? isDark ? "#ffffff" : "#0b0b0b"
                      : isDark ? "rgba(255,255,255,0.65)" : "#666",
                  borderBottom:
                    isActive && isCategory && item.color
                      ? `2px solid ${item.color}`
                      : isActive
                      ? `2px solid ${isDark ? "#ffffff" : "#0b0b0b"}`
                      : "2px solid transparent",
                  paddingBottom: "2px",
                  transition: "color 0.2s",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Language toggle */}
          <div
            className="hidden md:flex items-center gap-1"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: isDark ? "rgba(255,255,255,0.5)" : "#aaa" }}
          >
            <span style={{ color: isDark ? "#ffffff" : "#0b0b0b", fontWeight: 500 }}>ES</span>
            <span style={{ margin: "0 2px" }}>|</span>
            <span>EN</span>
          </div>

          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artículos..."
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  background: isDark ? "rgba(255,255,255,0.1)" : "#f5f5f5",
                  border: "none",
                  borderRadius: "4px",
                  padding: "5px 10px",
                  color: isDark ? "#fff" : "#0b0b0b",
                  outline: "none",
                  width: "180px",
                }}
              />
              <button type="button" onClick={() => setSearchOpen(false)}>
                <X size={14} color={isDark ? "rgba(255,255,255,0.7)" : "#888"} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-1">
              <Search size={15} color={isDark ? "rgba(255,255,255,0.7)" : "#888"} />
            </button>
          )}

          {/* User */}
          <div className="relative">
            <button
              onClick={() => isLoggedIn ? setUserMenuOpen(!userMenuOpen) : openAuth()}
              className="flex items-center gap-2 p-0.5"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: isLoggedIn && roleConf
                    ? roleConf.color
                    : isDark
                    ? "rgba(255,255,255,0.12)"
                    : "#f0f0f0",
                  transition: "background 0.2s",
                }}
              >
                {isLoggedIn && user ? (
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff", fontFamily: "'Inter', sans-serif" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.7)" : "#888"} strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              {/* Role indicator dot */}
              {isLoggedIn && roleConf && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: roleConf.color,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                  className="hidden md:block"
                >
                  {roleConf.label}
                </span>
              )}
            </button>

            {/* User dropdown */}
            {userMenuOpen && isLoggedIn && user && (
              <div
                className="absolute right-0 top-10 rounded-lg shadow-xl py-2 z-50"
                style={{
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  minWidth: "200px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
              >
                {/* User info */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#0b0b0b", fontFamily: "'Inter', sans-serif", marginBottom: "2px" }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: "14px", color: "#888", fontFamily: "'Inter', sans-serif", marginBottom: "4px" }}>
                    {user.email}
                  </p>
                  {roleConf && (
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: roleConf.color,
                        background: roleConf.bg,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {roleConf.label}
                    </span>
                  )}
                </div>

                {/* Dashboard link */}
                {userRole && (
                  <Link
                    to={ROLE_CONFIG[userRole].dashboardPath}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "16px",
                      color: "#333",
                      textDecoration: "none",
                      transition: "background 0.15s",
                      borderBottom: "1px solid #f5f5f5",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <LayoutDashboard size={13} color="#888" />
                    Mi Panel
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "16px",
                    color: "#e05252",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(224,82,82,0.06)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                >
                  <LogOut size={13} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={18} color={isDark ? "rgba(255,255,255,0.7)" : "#888"} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{ background: isDark ? "#0b0b0b" : "#fff", borderTop: "1px solid #e8e8e8" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "17px",
                color: isDark ? "#fff" : "#0b0b0b",
                borderBottom: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn && userRole && (
            <Link
              to={ROLE_CONFIG[userRole].dashboardPath}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-3"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "17px",
                color: roleConf?.color ?? "#3ecf8e",
                borderBottom: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0",
                textDecoration: "none",
              }}
            >
              Mi Panel ({roleConf?.label})
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-6 py-3"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "17px",
                color: "#e05252",
                background: "none",
                border: "none",
                borderTop: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <LogOut size={14} /> Cerrar sesión
            </button>
          )}
        </div>
      )}
    </header>
  );
}