import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Users, FileText, Settings, TrendingUp,
  ChevronDown, Shield, Edit3, Gavel, Eye,
  Database, Plus, Trash2, Edit2
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth, ROLE_CONFIG, type UserRole } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type ManuscriptStatus, STATUS_CONFIG, ALL_USERS } from "../../data/manuscripts";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { StatusBadge } from "./components/StatusBadge";

/* ─── Role Badge ───────────────────────────────────── */

function RoleBadge({ role }: { role: UserRole }) {
  if (!role) return null;
  const conf = ROLE_CONFIG[role];
  return (
    <span style={{
      fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600,
      color: conf.color, background: conf.bg, border: `1px solid ${conf.color}30`,
      padding: "2px 8px", borderRadius: "10px", letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}>
      {conf.label}
    </span>
  );
}

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield, editor: Edit3, jurado: Gavel, investigador: Eye,
};

const PIE_COLORS = ["#3ecf8e", "#6c8ebf", "#9b7fd4", "#e07b54", "#e8c55e", "#e05252"];

const MONTHLY_DATA = [
  { month: "Ene", submissions: 4, published: 2 },
  { month: "Feb", submissions: 6, published: 3 },
  { month: "Mar", submissions: 5, published: 4 },
  { month: "Abr", submissions: 8, published: 2 },
];

/* ─── Main ─────────────────────────────────────────── */

export function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const { user } = useAuth();
  const { manuscripts, updateStatus } = useManuscripts();
  const [users, setUsers] = useState(ALL_USERS);
  const [userRoleChanging, setUserRoleChanging] = useState<string | null>(null);

  const [programs, setPrograms] = useState(["Doctorado en Ciencias de la Salud", "Maestría en Enfermería", "Especialización en Salud Pública", "Pregrado en Medicina"]);
  const [lines, setLines] = useState(["Biología Celular", "Salud Pública", "Epidemiología", "Neurociencia", "Gestión Hospitalaria"]);

  const pendingCount = manuscripts.filter((m) => m.status === "submitted").length;
  const inReviewCount = manuscripts.filter((m) => ["editor_review", "peer_review"].includes(m.status)).length;
  const publishedCount = manuscripts.filter((m) => m.status === "published").length;

  const statusData = Object.entries(
    manuscripts.reduce((acc, m) => {
      const label = STATUS_CONFIG[m.status].label;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const categoryData = Object.entries(
    manuscripts.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.split(" ")[0], value }));

  const navItems = [
    { id: "overview", label: "Resumen General", icon: <LayoutDashboard size={14} /> },
    { id: "manuscripts", label: "Todos los Manuscritos", icon: <FileText size={14} />, badge: pendingCount },
    { id: "users", label: "Gestión de Usuarios", icon: <Users size={14} /> },
    { id: "catalogs", label: "Catálogos", icon: <Database size={14} /> },
    { id: "analytics", label: "Analíticas", icon: <TrendingUp size={14} /> },
    { id: "settings", label: "Configuración", icon: <Settings size={14} /> },
  ];

  const SECTION_TITLES: Record<string, string> = {
    overview: "Panel de Administración",
    manuscripts: "Todos los Manuscritos",
    users: "Gestión de Usuarios",
    catalogs: "Catálogos Académicos",
    analytics: "Analíticas",
    settings: "Configuración",
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as typeof u.role } : u));
    setUserRoleChanging(null);
  };

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={section}
      onSectionChange={setSection}
      title={SECTION_TITLES[section] ?? "Admin"}
      subtitle={`Bienvenido, ${user?.name?.split(" ")[0]}`}
    >
      {/* ── OVERVIEW ── */}
      {section === "overview" && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label: "Total manuscritos", value: manuscripts.length, color: "#0b0b0b", sub: "+2 esta semana" },
              { label: "Pendientes revisión", value: pendingCount, color: "#6c8ebf", sub: "Nuevos envíos" },
              { label: "En revisión", value: inReviewCount, color: "#9b7fd4", sub: "Con editores/jurados" },
              { label: "Publicados", value: publishedCount, color: "#3ecf8e", sub: "Artículos activos" },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "18px 20px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "34px", fontWeight: 600, color: kpi.color, lineHeight: 1, marginBottom: "5px" }}>{kpi.value}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, color: "#444", marginBottom: "2px" }}>{kpi.label}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {(["investigador", "editor", "jurado", "admin"] as const).map((role) => {
              const count = users.filter((u) => u.role === role).length;
              const conf = ROLE_CONFIG[role];
              const Icon = ROLE_ICONS[role] ?? Shield;
              return (
                <div key={role} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "18px 20px" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} color={conf.color} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: conf.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{conf.label}</span>
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1 }}>{count}</p>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "14px" }}>Actividad reciente</p>
            {manuscripts.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-3 flex-wrap" style={{ borderBottom: "1px solid #f9f9f9" }}>
                <StatusBadge status={m.status} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>{m.submittedByName} · {m.submittedDate}</p>
                </div>
                {m.timeline[m.timeline.length - 1] && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", flexShrink: 0 }}>{m.timeline[m.timeline.length - 1].date}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MANUSCRIPTS ── */}
      {section === "manuscripts" && (
        <div className="flex flex-col gap-3">
          {manuscripts.map((m) => (
            <div key={m.id} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "16px 20px" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <StatusBadge status={m.status} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>{m.id.toUpperCase()} · {m.category}</span>
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "4px" }}>{m.title}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{m.submittedByName} — {m.institution} · {m.submittedDate}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-col items-end">
                  {m.status === "submitted" && (
                    <button
                      onClick={() => updateStatus(m.id, "editor_review", user?.name ?? "Admin", "Admin", "Asignado por admin")}
                      className="px-3 py-1.5 rounded"
                      style={{ background: "#6c8ebf20", border: "1px solid #6c8ebf40", color: "#6c8ebf", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                    >
                      → Iniciar revisión
                    </button>
                  )}
                  {m.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(m.id, "published", user?.name ?? "Admin", "Admin", "Publicado por admin")}
                      className="px-3 py-1.5 rounded"
                      style={{ background: "#3ecf8e20", border: "1px solid #3ecf8e40", color: "#3ecf8e", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                    >
                      → Publicar
                    </button>
                  )}
                  {m.status === "published" && m.articleSlug && (
                    <Link to={`/articulo/${m.articleSlug}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#3ecf8e", textDecoration: "none" }}>
                      Ver artículo →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── USERS ── */}
      {section === "users" && (
        <div style={{ overflowX: "auto" }}>
          <div className="flex justify-between items-center mb-4">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666" }}>Administra los accesos y roles de la plataforma.</p>
            <button style={{ background: "#0b0b0b", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={14} /> Nuevo Usuario
            </button>
          </div>
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", overflow: "hidden", minWidth: "600px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                  {["Usuario", "Email", "Institución", "Rol", "Manuscritos", "Desde", "Acciones"].map((h) => (
                    <th key={h} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 14px", textAlign: "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: ROLE_CONFIG[u.role as UserRole & string]?.color ?? "#aaa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333", fontWeight: 500, whiteSpace: "nowrap" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}><span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{u.email}</span></td>
                    <td style={{ padding: "10px 14px" }}><span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{u.institution}</span></td>
                    <td style={{ padding: "10px 14px" }}><RoleBadge role={u.role as UserRole} /></td>
                    <td style={{ padding: "10px 14px" }}><span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{u.manuscripts}</span></td>
                    <td style={{ padding: "10px 14px" }}><span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb" }}>{u.joined}</span></td>
                    <td style={{ padding: "10px 14px" }}>
                      <div className="relative">
                        <button
                          onClick={() => setUserRoleChanging(userRoleChanging === u.id ? null : u.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded"
                          style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#555", background: "#f5f5f5", border: "1px solid #e8e8e8", cursor: "pointer" }}
                        >
                          Cambiar rol <ChevronDown size={11} />
                        </button>
                        {userRoleChanging === u.id && (
                          <div style={{ position: "absolute", right: 0, top: "32px", background: "#fff", border: "1px solid #e8e8e8", borderRadius: "6px", minWidth: "130px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                            {(["investigador", "editor", "jurado", "admin"] as const).filter((r) => r !== u.role).map((role) => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(u.id, role)}
                                style={{ width: "100%", textAlign: "left", padding: "9px 14px", fontFamily: "'Inter', sans-serif", fontSize: "15px", color: ROLE_CONFIG[role].color, border: "none", background: "none", cursor: "pointer", display: "block", transition: "background 0.1s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                              >
                                {ROLE_CONFIG[role].label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CATALOGS ── */}
      {section === "catalogs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
            <div className="flex justify-between items-center mb-4">
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b" }}>Programas Académicos</p>
              <button style={{ background: "none", border: "none", color: "#3ecf8e", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600 }}>
                <Plus size={14} /> Añadir
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {programs.map((p, i) => (
                <div key={i} className="flex justify-between items-center" style={{ padding: "10px 14px", background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333" }}>{p}</span>
                  <div className="flex gap-2">
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><Edit2 size={13} /></button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#e05252" }} onClick={() => setPrograms(prev => prev.filter(x => x !== p))}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
            <div className="flex justify-between items-center mb-4">
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b" }}>Líneas de Investigación</p>
              <button style={{ background: "none", border: "none", color: "#3ecf8e", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600 }}>
                <Plus size={14} /> Añadir
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {lines.map((l, i) => (
                <div key={i} className="flex justify-between items-center" style={{ padding: "10px 14px", background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333" }}>{l}</span>
                  <div className="flex gap-2">
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><Edit2 size={13} /></button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#e05252" }} onClick={() => setLines(prev => prev.filter(x => x !== l))}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {section === "analytics" && (
        <div className="flex flex-col gap-5">
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "18px" }}>Envíos y publicaciones mensuales</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px", border: "1px solid #efefef" }} />
                <Bar dataKey="submissions" name="Enviados" fill="#6c8ebf" radius={[3, 3, 0, 0]} />
                <Bar dataKey="published" name="Publicados" fill="#3ecf8e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "18px" }}>Estado actual</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px" }}>
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "18px" }}>Por área disciplinar</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#555" }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px" }} />
                  <Bar dataKey="value" fill="#9b7fd4" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {section === "settings" && (
        <div className="flex flex-col gap-5">
          {[
            {
              title: "Información de la Revista",
              fields: [
                { label: "Nombre", value: "CienciaEduc" },
                { label: "ISSN", value: "2024-XXXX" },
                { label: "Periodicidad", value: "Trimestral" },
                { label: "Idiomas aceptados", value: "Español, Inglés" },
              ],
            },
            {
              title: "Flujo Editorial",
              fields: [
                { label: "Días para revisión editorial", value: "5" },
                { label: "Semanas para revisión por pares", value: "6–8" },
                { label: "Jurados requeridos por manuscrito", value: "2" },
                { label: "Umbral de aceptación", value: "3.5/5.0" },
              ],
            },
          ].map((group) => (
            <div key={group.title} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "18px" }}>{group.title}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.fields.map((f) => (
                  <div key={f.label}>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>
                      {f.label}
                    </label>
                    <input
                      defaultValue={f.value}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333", outline: "none", background: "#fafafa", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <button className="mt-4 px-5 py-2 rounded" style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, border: "none", cursor: "pointer" }}>
                Guardar cambios
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
