import { useState } from "react";
import { X, Eye, EyeOff, Check, FlaskConical, BookOpen, Gavel, ShieldCheck } from "lucide-react";
import { type UserProfile, DEMO_ACCOUNTS, ROLE_CONFIG } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:3000/api";

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
  const { login } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [regName, setRegName] = useState("");
  const [regSecondName, setRegSecondName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regSecondLastName, setRegSecondLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regInstitution, setRegInstitution] = useState("");
  const [regRole, setRegRole] = useState("investigador");
  const [regCedula, setRegCedula] = useState("");
  const [regOncti, setRegOncti] = useState("");
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

    // Check demo accounts first
    const demoUser = DEMO_ACCOUNTS[loginEmail];
    if (demoUser) {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      setLoading(false);
      finishLogin(demoUser);
      return;
    }

    // Real API login
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setLoginError(data.message || "Credenciales incorrectas.");
        return;
      }
      const userProfile: UserProfile = {
        name: `${data.usuario.nombre} ${data.usuario.apellido ?? ""}`.trim(),
        email: data.usuario.correo,
        role: data.usuario.rol as any,
        institution: data.usuario.afiliacion_institucional,
      };
      login(userProfile, data.token);
      finishLogin(userProfile);
    } catch {
      setLoading(false);
      setLoginError("Error de conexión. Verifica que el servidor esté activo.");
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
    try {
      const res = await fetch(`${API}/usuarios/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: regName,
          segundo_nombre: regSecondName || undefined,
          apellido: regLastName,
          segundo_apellido: regSecondLastName || undefined,
          correo: regEmail,
          password: regPassword,
          afiliacion_institucional: regInstitution || undefined,
          cedula: regCedula || undefined,
          oncti: regOncti || undefined,
          rol: regRole,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setRegError(data.message || "Error al registrar usuario.");
        return;
      }
      // Auto-login after register
      const loginRes = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: regEmail, password: regPassword }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        const userProfile: UserProfile = {
          name: `${loginData.usuario.nombre} ${loginData.usuario.apellido ?? ""}`.trim(),
          email: loginData.usuario.correo,
          role: loginData.usuario.rol as any,
          institution: loginData.usuario.afiliacion_institucional,
        };
        login(userProfile, loginData.token);
        finishLogin(userProfile);
      } else {
        setRegError("Cuenta creada. Inicia sesión manualmente.");
        setTab("login");
      }
    } catch {
      setLoading(false);
      setRegError("Error de conexión. Verifica que el servidor esté activo.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "16px",
    color: "#0b0b0b",
    outline: "none",
    background: "#fafafa",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
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
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
                {tab === "login" ? "Accede a CienciaEduc" : "Únete a la comunidad científica"}
              </p>
            </div>
            <button onClick={onClose} className="p-1 mt-0.5">
              <X size={17} color="#888" />
            </button>
          </div>



          {/* Tabs */}
          <div className="flex mt-5 gap-0" style={{ borderBottom: "1px solid #e8e8e8" }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(""); setRegError(""); }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
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
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", color: "#0b0b0b", fontWeight: 500 }}>
                ¡Bienvenido, {successUser.name.split(" ")[0]}!
              </p>
              {successUser.role && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
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
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#c0392b" }}>{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded"
                style={{
                  background: loading ? "#ccc" : "#0b0b0b",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  marginTop: "4px",
                }}
              >
                {loading ? "Iniciando..." : "Iniciar Sesión"}
              </button>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", textAlign: "center" }}>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Primer Nombre <span style={{ color: "#c0392b" }}>*</span></label>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Juan" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Segundo Nombre</label>
                  <input type="text" value={regSecondName} onChange={(e) => setRegSecondName(e.target.value)} placeholder="Carlos" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Primer Apellido <span style={{ color: "#c0392b" }}>*</span></label>
                  <input type="text" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} placeholder="García" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Segundo Apellido</label>
                  <input type="text" value={regSecondLastName} onChange={(e) => setRegSecondLastName(e.target.value)} placeholder="Pérez" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Correo electrónico <span style={{ color: "#c0392b" }}>*</span></label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="tu@institución.edu" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cédula</label>
                  <input type="text" value={regCedula} onChange={(e) => setRegCedula(e.target.value)} placeholder="V-12345678" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Institución</label>
                  <input type="text" value={regInstitution} onChange={(e) => setRegInstitution(e.target.value)} placeholder="Univ. o Centro" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>ONCTI</label>
                  <input type="text" value={regOncti} onChange={(e) => setRegOncti(e.target.value)} placeholder="ONCTI-00123" style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Tipo de usuario</label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value)} style={inputStyle}>
                    <option value="investigador">Investigador</option>
                    <option value="editor">Editor</option>
                    <option value="revisor">Revisor</option>
                    <option value="admin">Administrador</option>
                  </select>
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
                </div>
              </div>
              {regError && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#c0392b" }}>{regError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded"
                style={{ background: loading ? "#ccc" : "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s", marginTop: "4px" }}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999", textAlign: "center" }}>
                Selecciona el rol que corresponde a tu perfil.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
