import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Users, FileText, Settings, Star, TrendingUp,
  ChevronDown, Shield, UserCheck, Edit3, Gavel, Eye
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth, ROLE_CONFIG, type UserRole } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type Manuscript, type ManuscriptStatus, STATUS_CONFIG, ALL_USERS } from "../../data/manuscripts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  editor: Edit3,
  jurado: Gavel,
  investigador: Eye,
};

function StatusBadge({ status }: { status: ManuscriptStatus }) {
  const conf = STATUS_CONFIG[status];
  return (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "10px",
        fontWeight: 600,
        color: conf.color,
        background: conf.bg,
        border: `1px solid ${conf.color}30`,
        padding: "2px 8px",
        borderRadius: "10px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {conf.label}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (!role) return null;
  const conf = ROLE_CONFIG[role];
  return (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "10px",
        fontWeight: 600,
        color: conf.color,
        background: conf.bg,
        border: `1px solid ${conf.color}30`,
        padding: "2px 8px",
        borderRadius: "10px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {conf.label}
    </span>
  );
}

export function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const { user } = useAuth();
  const { manuscripts, updateStatus } = useManuscripts();
  const [users, setUsers] = useState(ALL_USERS);
  const [userRoleChanging, setUserRoleChanging] = useState<string | null>(null);

  const totalManuscripts = manuscripts.length;
  const publishedCount = manuscripts.filter((m) => m.status === "published").length;
  const inReviewCount = manuscripts.filter((m) =>
    ["editor_review", "peer_review"].includes(m.status)
  ).length;
  const pendingCount = manuscripts.filter((m) => m.status === "submitted").length;

  // Chart data
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

  const monthlyData = [
    { month: "Ene", submissions: 4, published: 2 },
    { month: "Feb", submissions: 6, published: 3 },
    { month: "Mar", submissions: 5, published: 4 },
    { month: "Abr", submissions: 8, published: 2 },
  ];

  const PIE_COLORS = ["#3ecf8e", "#6c8ebf", "#9b7fd4", "#e07b54", "#e8c55e", "#e05252"];

  const navItems = [
    { id: "overview", label: "Resumen General", icon: <LayoutDashboard size={14} /> },
    { id: "manuscripts", label: "Todos los Manuscritos", icon: <FileText size={14} />, badge: pendingCount },
    { id: "users", label: "Gestión de Usuarios", icon: <Users size={14} /> },
    { id: "analytics", label: "Analíticas", icon: <TrendingUp size={14} /> },
    { id: "settings", label: "Configuración", icon: <Settings size={14} /> },
  ];

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as typeof u.role } : u));
    setUserRoleChanging(null);
  };

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={section}
      onSectionChange={setSection}
      title={
        section === "overview" ? "Panel de Administración"
        : section === "manuscripts" ? "Todos los Manuscritos"
        : section === "users" ? "Gestión de Usuarios"
        : section === "analytics" ? "Analíticas"
        : "Configuración"
      }
      subtitle={`Bienvenido, ${user?.name?.split(" ")[0]}`}
    >
      {/* OVERVIEW */}
      {section === "overview" && (
        <div>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total manuscritos", value: totalManuscripts, color: "#0b0b0b", sub: "+2 esta semana" },
              { label: "Pendientes revisión", value: pendingCount, color: "#6c8ebf", sub: "Nuevos envíos" },
              { label: "En revisión", value: inReviewCount, color: "#9b7fd4", sub: "Con editores/jurados" },
              { label: "Publicados", value: publishedCount, color: "#3ecf8e", sub: "Artículos activos" },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "20px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 600, color: kpi.color, lineHeight: 1, marginBottom: "6px" }}>
                  {kpi.value}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 500, color: "#444", marginBottom: "3px" }}>
                  {kpi.label}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Users stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(["investigador", "editor", "jurado", "admin"] as const).map((role) => {
              const count = users.filter((u) => u.role === role).length;
              const conf = ROLE_CONFIG[role];
              const Icon = ROLE_ICONS[role] ?? Shield;
              return (
                <div key={role} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "20px" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={14} color={conf.color} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: conf.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {conf.label}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1 }}>
                    {count}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent activity */}
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "16px" }}>
              Actividad reciente
            </p>
            {manuscripts.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid #f9f9f9" }}>
                <StatusBadge status={m.status} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>
                    {m.submittedByName} · {m.submittedDate}
                  </p>
                </div>
                {m.timeline[m.timeline.length - 1] && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb", flexShrink: 0 }}>
                    {m.timeline[m.timeline.length - 1].date}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MANUSCRIPTS */}
      {section === "manuscripts" && (
        <div>
          <div className="flex flex-col gap-3">
            {manuscripts.map((m) => (
              <div key={m.id} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "18px" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={m.status} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb" }}>
                        {m.id.toUpperCase()} · {m.category}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "4px" }}>
                      {m.title}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>
                      {m.submittedByName} — {m.institution} · {m.submittedDate}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-col items-end">
                    {m.assignedEditorName && (
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#6c8ebf" }}>
                        Ed: {m.assignedEditorName.split(" ")[0]}
                      </span>
                    )}
                    {m.status === "submitted" && (
                      <button
                        onClick={() => updateStatus(m.id, "editor_review", user?.name ?? "Admin", "Admin", "Asignado por admin")}
                        className="px-3 py-1.5 rounded text-xs"
                        style={{ background: "#6c8ebf20", border: "1px solid #6c8ebf40", color: "#6c8ebf", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "11px" }}
                      >
                        → Iniciar revisión
                      </button>
                    )}
                    {m.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(m.id, "published", user?.name ?? "Admin", "Admin", "Publicado por admin")}
                        className="px-3 py-1.5 rounded text-xs"
                        style={{ background: "#3ecf8e20", border: "1px solid #3ecf8e40", color: "#3ecf8e", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "11px" }}
                      >
                        → Publicar
                      </button>
                    )}
                    {m.status === "published" && m.articleSlug && (
                      <Link
                        to={`/articulo/${m.articleSlug}`}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#3ecf8e", textDecoration: "none" }}
                      >
                        Ver artículo →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS */}
      {section === "users" && (
        <div>
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                  {["Usuario", "Email", "Institución", "Rol", "Manuscritos", "Desde", "Acciones"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "#888",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "12px 16px",
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: ROLE_CONFIG[u.role as UserRole & string]?.color ?? "#aaa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#fff",
                            fontFamily: "'Inter', sans-serif",
                            flexShrink: 0,
                          }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#333", fontWeight: 500 }}>
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>{u.email}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>{u.institution}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <RoleBadge role={u.role as UserRole} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>{u.manuscripts}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#bbb" }}>{u.joined}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="relative">
                        <button
                          onClick={() => setUserRoleChanging(userRoleChanging === u.id ? null : u.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "11px",
                            color: "#555",
                            background: "#f5f5f5",
                            border: "1px solid #e8e8e8",
                            cursor: "pointer",
                          }}
                        >
                          Cambiar rol <ChevronDown size={11} />
                        </button>
                        {userRoleChanging === u.id && (
                          <div
                            className="absolute right-0 rounded shadow-lg py-1"
                            style={{ background: "#fff", border: "1px solid #e8e8e8", minWidth: "140px", zIndex: 50, top: "32px" }}
                          >
                            {(["investigador", "editor", "jurado", "admin"] as const).filter((r) => r !== u.role).map((role) => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(u.id, role)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: ROLE_CONFIG[role].color, border: "none", background: "none", cursor: "pointer" }}
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

      {/* ANALYTICS */}
      {section === "analytics" && (
        <div className="flex flex-col gap-6">
          {/* Monthly submissions */}
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
              Envíos y publicaciones mensuales
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px", border: "1px solid #efefef" }} />
                <Bar dataKey="submissions" name="Enviados" fill="#6c8ebf" radius={[3, 3, 0, 0]} />
                <Bar dataKey="published" name="Publicados" fill="#3ecf8e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Status pie */}
            <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
                Estado actual
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px" }}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category bar */}
            <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
                Por área disciplinar
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#555" }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px" }} />
                  <Bar dataKey="value" fill="#9b7fd4" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {section === "settings" && (
        <div className="flex flex-col gap-6">
          {[
            {
              title: "Información de la Revista",
              fields: [
                { label: "Nombre de la revista", value: "CienciaEduc" },
                { label: "ISSN", value: "2024-XXXX" },
                { label: "Periodicidad", value: "Trimestral" },
                { label: "Idiomas aceptados", value: "Español, Inglés" },
              ],
            },
            {
              title: "Configuración del Flujo Editorial",
              fields: [
                { label: "Días para revisión editorial", value: "5" },
                { label: "Semanas para revisión por pares", value: "6-8" },
                { label: "Jurados requeridos por manuscrito", value: "2" },
                { label: "Umbral de aceptación (puntuación media)", value: "3.5/5.0" },
              ],
            },
          ].map((section) => (
            <div key={section.title} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
                {section.title}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {section.fields.map((f) => (
                  <div key={f.label}>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "5px" }}>
                      {f.label}
                    </label>
                    <input
                      defaultValue={f.value}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "4px",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        color: "#333",
                        outline: "none",
                        background: "#fafafa",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                className="mt-4 px-5 py-2 rounded"
                style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 500, border: "none", cursor: "pointer" }}
              >
                Guardar cambios
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}