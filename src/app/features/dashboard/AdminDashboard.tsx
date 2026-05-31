import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Users, FileText, Settings, Star, TrendingUp,
  ChevronDown, Shield, UserCheck, Edit3, Gavel, Eye, BookOpen, Plus, Search, Check, Download, Edit, Layers
} from "lucide-react";
import ApprovedArticlesList from "./ApprovedArticlesList.tsx";
import AreaLineManagement from "./AreaLineManagement.tsx";
import { DashboardLayout } from "../../components/DashboardLayout.tsx";
import { useAuth, ROLE_CONFIG, type UserRole } from "../../context/AuthContext.tsx";
import { useManuscripts } from "../../context/ManuscriptContext.tsx";
import { type Manuscript, type ManuscriptStatus, STATUS_CONFIG } from "../../data/manuscripts.tsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { useEffect } from "react";
import {FileCheck} from "lucide-react"
const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  editor: Edit3,
  revisor: Gavel,
  investigador: Eye,
};

function StatusBadge({ status }: { status: ManuscriptStatus }) {
  const conf = STATUS_CONFIG[status];
  return (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
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
        fontSize: "13px",
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
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleChanging, setUserRoleChanging] = useState<string | null>(null);

  // --- Real API & Form States ---
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [revistas, setRevistas] = useState<any[]>([]);
  const [selectedRevista, setSelectedRevista] = useState<any | null>(null);
  const [revistaArticulos, setRevistaArticulos] = useState<any[]>([]);
  const [revistaNumeros, setRevistaNumeros] = useState<any[]>([]);
  const [lineas, setLineas] = useState<any[]>([]);
  
  // Modals / forms visibility
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRevistaModal, setShowRevistaModal] = useState(false);
  const [showNumeroModal, setShowNumeroModal] = useState(false);
  const [showVolumenModal, setShowVolumenModal] = useState(false);
  const [editingRevista, setEditingRevista] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Form inputs
  const [userForm, setUserForm] = useState({
    nombre: "",
    segundo_nombre: "",
    apellido: "",
    segundo_apellido: "",
    correo: "",
    password: "",
    cedula: "",
    oncti: "",
    afiliacion_institucional: "",
    rol: "investigador"
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [revistaForm, setRevistaForm] = useState({
    nombre: "",
    issn: "",
    periodicidad: "semestral",
    descripcion: "",
    lineas_permitidas: [] as number[]
  });

  const [volumenForm, setVolumenForm] = useState({
    volumen: "",
    anio: new Date().getFullYear().toString()
  });

  const [numeroForm, setNumeroForm] = useState({
    volumen: "",
    numero: "",
    anio: new Date().getFullYear().toString(),
    titulo_edicion: "",
    status: "futuro",
    fecha_publicacion: ""
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/usuarios/todos", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRealUsers(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchRevistas = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/revistas");
      if (res.ok) {
        const data = await res.json();
        setRevistas(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchLineas = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/lineas");
      if (res.ok) {
        const data = await res.json();
        setLineas(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchUsers();
    fetchRevistas();
    fetchLineas();
  }, []);

  const fetchRevistaDetails = async (revId: number) => {
    try {
      // Artículos aprobados de la revista
      const artRes = await fetch(`http://localhost:3000/api/articulos/aprobados?revistaId=${revId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (artRes.ok) {
        const artData = await artRes.json();
        setRevistaArticulos(artData);
      }

      // Números de la revista
      const numRes = await fetch(`http://localhost:3000/api/revistas/${revId}/numeros`);
      if (numRes.ok) {
        const numData = await numRes.json();
        setRevistaNumeros(numData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedRevista) {
      fetchRevistaDetails(selectedRevista.id);
    }
  }, [selectedRevista]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(userForm).forEach(([key, val]) => {
      formData.append(key, val);
    });
    if (cvFile) {
      formData.append("cv", cvFile);
    }

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/crear-admin", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Usuario creado exitosamente con su CV");
        setShowUserModal(false);
        setUserForm({
          nombre: "",
          segundo_nombre: "",
          apellido: "",
          segundo_apellido: "",
          correo: "",
          password: "",
          cedula: "",
          oncti: "",
          afiliacion_institucional: "",
          rol: "autor"
        });
        setCvFile(null);
        fetchUsers();
      } else {
        showToast("error", data.message || "Error al crear usuario");
      }
    } catch (err: any) {
      showToast("error", "Error de conexión");
    }
  };

  const handleCreateOrUpdateRevista = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingRevista ? "PUT" : "POST";
    const url = editingRevista 
      ? `http://localhost:3000/api/revistas/${editingRevista.id}`
      : "http://localhost:3000/api/revistas";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(revistaForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", editingRevista ? "Revista actualizada" : "Revista creada exitosamente");
        setShowRevistaModal(false);
        setEditingRevista(null);
        setRevistaForm({
          nombre: "",
          issn: "",
          periodicidad: "semestral",
          descripcion: "",
          lineas_permitidas: []
        });
        fetchRevistas();
      } else {
        showToast("error", data.message || "Error al procesar revista");
      }
    } catch (err) {
      showToast("error", "Error de conexión");
    }
  };

  const handleDesactivarRevista = async (revId: number) => {
    if (!confirm("¿Está seguro de que desea desactivar esta revista? No podrá ser eliminada físicamente pero quedará inactiva.")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/revistas/${revId}/desactivar`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        showToast("success", "Revista desactivada correctamente");
        fetchRevistas();
      } else {
        showToast("error", "Error al desactivar la revista");
      }
    } catch (err) {
      showToast("error", "Error de conexión");
    }
  };

  const handleCreateVolumen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevista) return;
    try {
      const res = await fetch(`http://localhost:3000/api/revistas/${selectedRevista.id}/numeros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          volumen: parseInt(volumenForm.volumen),
          numero: null, // No number yet
          anio: parseInt(volumenForm.anio),
          titulo_edicion: `Volumen ${volumenForm.volumen}`,
          status: "futuro"
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Volumen creado exitosamente");
        setShowVolumenModal(false);
        setVolumenForm({
          volumen: "",
          anio: new Date().getFullYear().toString()
        });
        fetchRevistaDetails(selectedRevista.id);
      } else {
        showToast("error", data.message || "Error al crear volumen");
      }
    } catch (err) {
      showToast("error", "Error de conexión");
    }
  };

  const handleCreateNumero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevista) return;
    try {
      const res = await fetch(`http://localhost:3000/api/revistas/${selectedRevista.id}/numeros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          volumen: parseInt(numeroForm.volumen),
          numero: parseInt(numeroForm.numero),
          anio: parseInt(numeroForm.anio),
          titulo_edicion: numeroForm.titulo_edicion,
          status: numeroForm.status,
          fecha_publicacion: numeroForm.fecha_publicacion || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Número de revista creado exitosamente");
        setShowNumeroModal(false);
        setNumeroForm({
          volumen: "",
          numero: "",
          anio: new Date().getFullYear().toString(),
          titulo_edicion: "",
          status: "futuro",
          fecha_publicacion: ""
        });
        fetchRevistaDetails(selectedRevista.id);
      } else {
        showToast("error", data.message || "Error al crear número");
      }
    } catch (err) {
      showToast("error", "Error de conexión");
    }
  };

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
    { id: "revistas", label: "Revistas", icon: <BookOpen size={14} /> },
    { id: "articles", label: "Gestión de Artículos", icon: <FileCheck size={14} /> },
    { id: "areas", label: "Áreas y Líneas", icon: <Layers size={14} /> },
  ];

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setRealUsers((prev) => prev.map((u) => u.id.toString() === userId ? { ...u, rol: newRole } : u));
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
        : section === "revistas" ? "Gestión de Revistas"
        : section === "articles" ? "Gestión de Artículos"
        : "Áreas y Líneas de Investigación"
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
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, color: "#444", marginBottom: "3px" }}>
                  {kpi.label}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Users stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(["investigador", "editor", "revisor", "admin"] as const).map((role) => {
              const count = users.filter((u) => u.role === role).length;
              const conf = ROLE_CONFIG[role];
              const Icon = ROLE_ICONS[role] ?? Shield;
              return (
                <div key={role} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "20px" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={14} color={conf.color} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: conf.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                    {m.submittedByName} · {m.submittedDate}
                  </p>
                </div>
                {m.timeline[m.timeline.length - 1] && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", flexShrink: 0 }}>
                    {m.timeline[m.timeline.length - 1].date}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
)}
{section === "articles" && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <ApprovedArticlesList />
  </div>
)}
{/* AREAS SECTION */}
{section === "areas" && (
  <AreaLineManagement />
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
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                        {m.id.toUpperCase()} · {m.category}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "4px" }}>
                      {m.title}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
                      {m.submittedByName} — {m.institution} · {m.submittedDate}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-col items-end">
                    {m.assignedEditorName && (
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#6c8ebf" }}>
                        Ed: {m.assignedEditorName.split(" ")[0]}
                      </span>
                    )}
                    {m.status === "submitted" && (
                      <button
                        onClick={() => updateStatus(m.id, "editor_review", user?.name ?? "Admin", "Admin", "Asignado por admin")}
                        className="px-3 py-1.5 rounded text-xs"
                        style={{ background: "#6c8ebf20", border: "1px solid #6c8ebf40", color: "#6c8ebf", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                      >
                        → Iniciar revisión
                      </button>
                    )}
                    {m.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(m.id, "published", user?.name ?? "Admin", "Admin", "Publicado por admin")}
                        className="px-3 py-1.5 rounded text-xs"
                        style={{ background: "#3ecf8e20", border: "1px solid #3ecf8e40", color: "#3ecf8e", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                      >
                        → Publicar
                      </button>
                    )}
                    {m.status === "published" && m.articleSlug && (
                      <Link
                        to={`/articulo/${m.articleSlug}`}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#3ecf8e", textDecoration: "none" }}
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
      {section === "users" && (() => {
        const combinedUsers = realUsers.map((ru: any) => ({
            id: ru.id.toString(),
            name: `${ru.nombre} ${ru.apellido}`,
            email: ru.correo,
            institution: ru.afiliacion_institucional,
            role: ru.rol,
            manuscripts: 0,
            joined: new Date(ru.created_at || Date.now()).toLocaleDateString(),
            cv: ru.cv
          }));

        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#666" }}>
                Total de usuarios registrados: <strong>{combinedUsers.length}</strong>
              </p>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white bg-black hover:bg-neutral-800 transition"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer" }}
                >
                <Plus size={16} /> Crear Usuario
              </button>
            </div>

            <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                    {["Usuario", "Email", "Institución", "Rol", "CV", "Desde", "Acciones"].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "13px",
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
                  {combinedUsers.map((u) => (
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
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#fff",
                              fontFamily: "'Inter', sans-serif",
                              flexShrink: 0,
                            }}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333", fontWeight: 500 }}>
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{u.email}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{u.institution}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <RoleBadge role={u.role as UserRole} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {(u as any).cv ? (
                          <a
                            href={`http://localhost:3000/${(u as any).cv}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            <Download size={14} /> Descargar
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic" style={{ fontFamily: "'Inter', sans-serif" }}>Ninguno</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb" }}>{u.joined}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="relative">
                          <button
                            onClick={() => setUserRoleChanging(userRoleChanging === u.id ? null : u.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "14px",
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
                              {(["investigador", "editor", "revisor", "admin"] as const).filter((r) => r !== u.role).map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(u.id, role)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: ROLE_CONFIG[role].color, border: "none", background: "none", cursor: "pointer" }}
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

            {/* Modal for adding user */}
            {showUserModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#fff", padding: "32px", borderRadius: "8px", width: "100%", maxWidth: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>Crear Nuevo Usuario</h3>
                  <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Primer Nombre</label>
                        <input required type="text" value={userForm.nombre} onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Segundo Nombre</label>
                        <input type="text" value={userForm.segundo_nombre} onChange={(e) => setUserForm({ ...userForm, segundo_nombre: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Primer Apellido</label>
                        <input required type="text" value={userForm.apellido} onChange={(e) => setUserForm({ ...userForm, apellido: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Segundo Apellido</label>
                        <input type="text" value={userForm.segundo_apellido} onChange={(e) => setUserForm({ ...userForm, segundo_apellido: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                        <input required type="email" value={userForm.correo} onChange={(e) => setUserForm({ ...userForm, correo: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Cédula</label>
                        <input type="text" value={userForm.cedula} onChange={(e) => setUserForm({ ...userForm, cedula: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Contraseña</label>
                        <input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Rol</label>
                        <select value={userForm.rol} onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                          <option value="investigador">Investigador</option>
                          <option value="editor">Editor</option>
                          <option value="revisor">Revisor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">ONCTI <span className="text-gray-300 normal-case font-normal">(opcional)</span></label>
                        <input type="text" value={userForm.oncti} onChange={(e) => setUserForm({ ...userForm, oncti: e.target.value })} placeholder="ONCTI-12345" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Afiliación Institucional</label>
                        <input required type="text" value={userForm.afiliacion_institucional} onChange={(e) => setUserForm({ ...userForm, afiliacion_institucional: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Curriculum Vitae (CV) - PDF/DOC</label>
                      <input type="file" onChange={(e) => setCvFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx" style={{ width: "100%", padding: "6px", fontFamily: "'Inter', sans-serif" }} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button type="button" onClick={() => { setShowUserModal(false); setCvFile(null); }} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
                      <button type="submit" style={{ padding: "8px 20px", background: "#0b0b0b", color: "#fff", borderRadius: "4px", cursor: "pointer", border: "none" }}>Crear Usuario</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })()}

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
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px" }}
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

      {/* REVISTAS */}
      {section === "revistas" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>
              Administre las revistas científicas, ISSN, periodicidad y sus volúmenes.
            </p>
            <button
              onClick={() => {
                setEditingRevista(null);
                setRevistaForm({
                  nombre: "",
                  issn: "",
                  periodicidad: "semestral",
                  descripcion: "",
                  lineas_permitidas: []
                });
                setShowRevistaModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white bg-black hover:bg-neutral-800 transition"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer" }}
            >
              <Plus size={16} /> Nueva Revista
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Revistas */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                      {["Nombre", "ISSN", "Periodicidad", "Estado", "Acciones"].map((h) => (
                        <th
                          key={h}
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "13px",
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
                    {revistas.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#aaa", fontFamily: "'Inter', sans-serif" }}>
                          No hay revistas creadas aún.
                        </td>
                      </tr>
                    ) : (
                      revistas.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedRevista(r)}
                          style={{
                            borderBottom: "1px solid #f9f9f9",
                            cursor: "pointer",
                            background: selectedRevista?.id === r.id ? "#fcfcfc" : "none"
                          }}
                          className="hover:bg-neutral-50 transition"
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333", fontWeight: 600 }}>{r.nombre}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555" }}>{r.issn}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#777", textTransform: "capitalize" }}>{r.periodicidad}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: r.activo ? "#3ecf8e" : "#e05252",
                                background: r.activo ? "rgba(62,207,142,0.1)" : "rgba(224,82,82,0.1)",
                                padding: "2px 8px",
                                borderRadius: "10px"
                              }}
                            >
                              {r.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingRevista(r);
                                  setRevistaForm({
                                    nombre: r.nombre,
                                    issn: r.issn || "",
                                    periodicidad: r.periodicidad || "semestral",
                                    descripcion: r.descripcion || "",
                                    lineas_permitidas: Array.isArray(r.lineas_permitidas) ? r.lineas_permitidas : []
                                  });
                                  setShowRevistaModal(true);
                                }}
                                className="p-1 text-gray-500 hover:text-black hover:bg-neutral-100 rounded transition"
                              >
                                <Edit size={14} />
                              </button>
                              {r.activo && (
                                <button
                                  onClick={() => handleDesactivarRevista(r.id)}
                                  className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition"
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  Desactivar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Revista Detail Panel */}
            <div className="lg:col-span-1">
              {selectedRevista ? (
                <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }} className="flex flex-col gap-6">
                  <div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>
                      {selectedRevista.nombre}
                    </h4>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      ISSN: {selectedRevista.issn} · Periodicidad: {selectedRevista.periodicidad}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Descripción</h5>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555", lineHeight: 1.6 }}>
                      {selectedRevista.descripcion || "Sin descripción proporcionada."}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Líneas de Investigación Permitidas</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(selectedRevista.lineas_permitidas) && selectedRevista.lineas_permitidas.length > 0 ? (
                        selectedRevista.lineas_permitidas.map((id: number) => {
                          const matchingLinea = lineas.find(l => l.id === id);
                          return (
                            <span key={id} className="px-2.5 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {matchingLinea ? matchingLinea.nombre : `Línea #${id}`}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">Todas las líneas aceptadas</span>
                      )}
                    </div>
                  </div>

                  <hr style={{ borderColor: "#f6f6f6" }} />

                  {/* Volúmenes y Números */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">Volúmenes / Números</h5>
                      <button
                        onClick={() => setShowVolumenModal(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <Plus size={12} /> Nuevo Volumen
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                      {(() => {
                        const volumesMap: Record<number, { volumen: number; anio: number; numeros: any[] }> = {};
                        revistaNumeros.forEach((n) => {
                          if (!volumesMap[n.volumen]) {
                            volumesMap[n.volumen] = {
                              volumen: n.volumen,
                              anio: n.anio,
                              numeros: [],
                            };
                          }
                          if (n.numero !== null && n.numero !== undefined) {
                            volumesMap[n.volumen].numeros.push(n);
                          }
                        });
                        const volumesList = Object.values(volumesMap).sort((a, b) => b.volumen - a.volumen);

                        if (volumesList.length === 0) {
                          return <p className="text-xs text-gray-400 italic">No se han registrado volúmenes para esta revista.</p>;
                        }

                        return volumesList.map((vol: any) => (
                          <div key={vol.volumen} className="p-3 rounded border border-neutral-100 bg-neutral-50 flex flex-col gap-2">
                            <div className="flex justify-between items-center border-b border-neutral-200 pb-1.5">
                              <span className="text-sm font-bold text-neutral-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Volumen {vol.volumen} ({vol.anio})
                              </span>
                              <button
                                onClick={() => {
                                  setNumeroForm({
                                    volumen: vol.volumen.toString(),
                                    numero: "",
                                    anio: vol.anio.toString(),
                                    titulo_edicion: "",
                                    status: "futuro",
                                    fecha_publicacion: ""
                                  });
                                  setShowNumeroModal(true);
                                }}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                              >
                                <Plus size={10} /> Añadir Número
                              </button>
                            </div>
                            <div className="flex flex-col gap-1.5 pl-2">
                              {vol.numeros.length === 0 ? (
                                <span className="text-xs text-gray-400 italic">Sin números registrados.</span>
                              ) : (
                                vol.numeros.map((num: any) => (
                                  <div key={num.id} className="flex justify-between items-center bg-white p-2 rounded border border-neutral-100">
                                    <div>
                                      <p className="text-xs font-semibold text-neutral-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        Número {num.numero}
                                      </p>
                                      <p className="text-[10px] text-neutral-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {num.titulo_edicion}
                                      </p>
                                    </div>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                        num.status === 'publicado' ? 'text-green-700 bg-green-100' : 'text-amber-700 bg-amber-100'
                                      }`}
                                      style={{ fontFamily: "'Inter', sans-serif" }}
                                    >
                                      {num.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <hr style={{ borderColor: "#f6f6f6" }} />

                  {/* Artículos Aprobados para publicar */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Manuscritos Aprobados Pendientes de Edición</h5>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                      {revistaArticulos.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No hay artículos aprobados pendientes para esta revista.</p>
                      ) : (
                        revistaArticulos.map((art: any) => (
                          <div key={art.id} className="p-3 rounded border border-neutral-100 flex flex-col gap-1">
                            <p className="text-sm font-semibold text-neutral-800 line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                              {art.titulo_es}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">ID: {art.id}</span>
                              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">Listo para volumen</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fafafa", border: "1px dashed #e8e8e8", borderRadius: "6px", padding: "48px 24px", textAlign: "center", color: "#bbb" }}>
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                    Seleccione una revista de la lista para ver sus detalles, volúmenes y manuscritos aprobados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revista Form Modal */}
      {showRevistaModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "32px", borderRadius: "8px", width: "100%", maxWidth: "600px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>
              {editingRevista ? "Editar Revista" : "Crear Nueva Revista"}
            </h3>
            <form onSubmit={handleCreateOrUpdateRevista} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Nombre de la revista</label>
                <input required type="text" value={revistaForm.nombre} onChange={(e) => setRevistaForm({ ...revistaForm, nombre: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">ISSN</label>
                  <input required type="text" placeholder="2443-444X" value={revistaForm.issn} onChange={(e) => setRevistaForm({ ...revistaForm, issn: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Periodicidad</label>
                  <select value={revistaForm.periodicidad} onChange={(e) => setRevistaForm({ ...revistaForm, periodicidad: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Descripción</label>
                <textarea rows={3} value={revistaForm.descripcion} onChange={(e) => setRevistaForm({ ...revistaForm, descripcion: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none", resize: "none", fontFamily: "'Inter', sans-serif" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Líneas de Investigación Permitidas</label>
                <div style={{ maxHeight: "140px", overflowY: "auto", border: "1px solid #e8e8e8", borderRadius: "4px", padding: "10px" }} className="grid grid-cols-2 gap-2">
                  {lineas.map((l) => {
                    const isChecked = revistaForm.lineas_permitidas.includes(l.id);
                    return (
                      <label key={l.id} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? revistaForm.lineas_permitidas.filter(id => id !== l.id)
                              : [...revistaForm.lineas_permitidas, l.id];
                            setRevistaForm({ ...revistaForm, lineas_permitidas: updated });
                          }}
                        />
                        {l.nombre}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowRevistaModal(false); setEditingRevista(null); }} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#0b0b0b", color: "#fff", borderRadius: "4px", cursor: "pointer", border: "none" }}>
                  {editingRevista ? "Guardar Cambios" : "Crear Revista"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volumen Form Modal */}
      {showVolumenModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "32px", borderRadius: "8px", width: "100%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>Crear Nuevo Volumen</h3>
            <form onSubmit={handleCreateVolumen} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Volumen (Ej: 1)</label>
                <input required type="number" value={volumenForm.volumen} onChange={(e) => setVolumenForm({ ...volumenForm, volumen: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Año</label>
                <input required type="number" value={volumenForm.anio} onChange={(e) => setVolumenForm({ ...volumenForm, anio: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowVolumenModal(false)} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#0b0b0b", color: "#fff", borderRadius: "4px", cursor: "pointer", border: "none" }}>Crear Volumen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Numero Form Modal */}
      {showNumeroModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "32px", borderRadius: "8px", width: "100%", maxWidth: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>Crear Nuevo Número</h3>
            <form onSubmit={handleCreateNumero} className="flex flex-col gap-4">
              <div className="bg-neutral-50 p-3 rounded border border-neutral-100 flex justify-between items-center text-sm mb-1">
                <span className="text-neutral-600 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Volumen Asignado: {numeroForm.volumen}</span>
                <span className="text-neutral-600 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Año: {numeroForm.anio}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Número (Issue)</label>
                <input required type="number" value={numeroForm.numero} onChange={(e) => setNumeroForm({ ...numeroForm, numero: e.target.value })} placeholder="Ej: 1" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Título de la Edición</label>
                <input required type="text" placeholder="Enero-Junio, Edición Especial" value={numeroForm.titulo_edicion} onChange={(e) => setNumeroForm({ ...numeroForm, titulo_edicion: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Estado</label>
                  <select value={numeroForm.status} onChange={(e) => setNumeroForm({ ...numeroForm, status: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                    <option value="futuro">Futuro (Planificado)</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Fecha Publicación (Opcional)</label>
                  <input type="date" value={numeroForm.fecha_publicacion} onChange={(e) => setNumeroForm({ ...numeroForm, fecha_publicacion: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none", fontFamily: "'Inter', sans-serif" }} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowNumeroModal(false)} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#0b0b0b", color: "#fff", borderRadius: "4px", cursor: "pointer", border: "none" }}>Crear Número</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notifications */}
      {notification && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: notification.type === 'success' ? "#3ecf8e" : "#e05252", color: "#fff", padding: "12px 24px", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 1000, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          {notification.msg}
        </div>
      )}
    </DashboardLayout>
  );
}