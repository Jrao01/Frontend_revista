import { useState } from "react";
import { X, Eye, EyeOff, Check, FlaskConical, BookOpen, Gavel, ShieldCheck } from "lucide-react";
import { type UserProfile, DEMO_ACCOUNTS, ROLE_CONFIG } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

const DEMO_ROLES = [
  { key: "investigador@demo.com", label: "Investigador", icon: FlaskConical, color: "#3ecf8e" },
  { key: "editor@demo.com", label: "Editor", icon: BookOpen, color: "#6c8ebf" },
  { key: "jurado@demo.com", label: "Jurado", icon: Gavel, color: "#9b7fd4" },
  { key: "admin@demo.com", label: "Admin", icon: ShieldCheck, color: "#e05252" },
];

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regError, setRegError] = useState("");

  if (!isOpen) return null;

  const finishLogin = (user: UserProfile) => {
    setSuccessUser(user);
    setSuccess(true);
    setTimeout(() => {
      onLogin(user);
      onClose();
      setSuccess(false);
      setSuccessUser(null);
      setLoginEmail("");
      setLoginPassword("");
    }, 900);
  };

  const handleDemoLogin = async (email: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    const user = DEMO_ACCOUNTS[email];
    if (user) finishLogin(user);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);

    const demoUser = DEMO_ACCOUNTS[loginEmail];
    if (demoUser) {
      finishLogin(demoUser);
    } else {
      // Any other email → investigador role
      const user: UserProfile = {
        name: loginEmail.split("@")[0],
        email: loginEmail,
        role: "investigador",
      };
      finishLogin(user);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword) {
      setRegError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    const user: UserProfile = {
      name: regName,
      email: regEmail,
      role: "investigador",
      institution: regInstitution || undefined,
    };
    finishLogin(user);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    color: "#0b0b0b",
    outline: "none",
    background: "#fafafa",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 500,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-[460px] rounded-lg overflow-hidden"
        style={{
          background: "#fff",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          animation: "modalSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.94) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="px-8 pt-7 pb-5" style={{ borderBottom: "1px solid #f0f0f0" }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "3px" }}>
                {tab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>
                {tab === "login" ? "Accede a CienciaEduc" : "Únete a la comunidad científica"}
              </p>
            </div>
            <button onClick={onClose} className="p-1 mt-0.5">
              <X size={17} color="#888" />
            </button>
          </div>

          {/* Demo quick-login */}
          <div style={{ background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: "6px", padding: "12px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
              Acceso Demo Rápido
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => handleDemoLogin(key)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded px-3 py-2 text-left"
                  style={{
                    background: "#fff",
                    border: `1px solid ${color}30`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${color}10`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}60`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#fff";
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
                  }}
                >
                  <Icon size={13} color={color} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 500, color: "#333" }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb", marginTop: "8px", textAlign: "center" }}>
              Contraseña demo: <span style={{ color: "#888", fontFamily: "monospace" }}>demo123</span>
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mt-5 gap-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(""); setRegError(""); }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: tab === t ? 500 : 400,
                  color: tab === t ? "#0b0b0b" : "#888",
                  padding: "8px 0",
                  marginRight: "20px",
                  borderBottom: "2px solid transparent",
                  borderBottomColor: tab === t ? "#0b0b0b" : "transparent",
                  marginBottom: "-1px",
                  background: "none",
                  border: "none",
                  borderBottomWidth: "2px",
                  borderBottomStyle: "solid",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t === "login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {success && successUser ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: successUser.role ? ROLE_CONFIG[successUser.role].color : "#3ecf8e",
                }}
              >
                <Check size={26} color="#fff" strokeWidth={2.5} />
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", fontWeight: 500 }}>
                ¡Bienvenido, {successUser.name.split(" ")[0]}!
              </p>
              {successUser.role && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: ROLE_CONFIG[successUser.role].color,
                    background: ROLE_CONFIG[successUser.role].bg,
                    padding: "3px 10px",
                    borderRadius: "12px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {ROLE_CONFIG[successUser.role].label}
                </span>
              )}
            </div>
          ) : tab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={14} color="#888" /> : <Eye size={14} color="#888" />}
                  </button>
                </div>
              </div>
              {loginError && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c0392b" }}>{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded"
                style={{
                  background: loading ? "#ccc" : "#0b0b0b",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  marginTop: "4px",
                }}
              >
                {loading ? "Iniciando..." : "Iniciar Sesión"}
              </button>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888", textAlign: "center" }}>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  style={{ color: "#0b0b0b", fontWeight: 500, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  Regístrate gratis
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Nombre completo <span style={{ color: "#c0392b" }}>*</span></label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Dr. Nombre Apellido" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Correo electrónico <span style={{ color: "#c0392b" }}>*</span></label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="tu@institución.edu" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Institución</label>
                <input type="text" value={regInstitution} onChange={(e) => setRegInstitution(e.target.value)} placeholder="Universidad o Centro de Investigación" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Contraseña <span style={{ color: "#c0392b" }}>*</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={14} color="#888" /> : <Eye size={14} color="#888" />}
                  </button>
                </div>
                {regPassword && (
                  <div className="mt-2 flex gap-1">
                    {[8, 12, 16].map((len, i) => (
                      <div key={i} style={{ flex: 1, height: "2px", borderRadius: "2px", background: regPassword.length >= len ? "#3ecf8e" : "#e8e8e8", transition: "background 0.3s" }} />
                    ))}
                  </div>
                )}
              </div>
              {regError && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c0392b" }}>{regError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded"
                style={{ background: loading ? "#ccc" : "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s", marginTop: "4px" }}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#999", textAlign: "center" }}>
                Los nuevos registros obtienen rol de Investigador por defecto.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
