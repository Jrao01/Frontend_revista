import { useState } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Users, FileText, Settings, Star, TrendingUp,
  ChevronDown, ChevronRight, Shield, UserCheck, Edit3, Gavel, Eye, BookOpen, Plus, Search, Check, Download, Edit, Layers, Calendar, X
} from "lucide-react";
import ApprovedArticlesList from "./ApprovedArticlesList.tsx";
import AreaLineManagement from "./AreaLineManagement.tsx";
import { DashboardLayout } from "../../components/DashboardLayout.tsx";
import { useAuth, ROLE_CONFIG, type UserRole } from "../../context/AuthContext.tsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { useEffect } from "react";
import {FileCheck} from "lucide-react"
import { api, BASE_URL } from "../../api/api";
const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  editor: Edit3,
  revisor: Gavel,
  investigador: Eye,
};

const ARTICLE_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  enviado: { label: 'Enviado', color: '#6c8ebf', bg: 'rgba(108,142,191,0.1)' },
  En_evaluacion: { label: 'En Evaluación', color: '#9b7fd4', bg: 'rgba(155,127,212,0.1)' },
  por_evaluar: { label: 'Por Evaluar', color: '#e07b54', bg: 'rgba(224,123,84,0.1)' },
  aprobado: { label: 'Aprobado', color: '#3ecf8e', bg: 'rgba(62,207,142,0.1)' },
  rechazado: { label: 'Rechazado', color: '#e05252', bg: 'rgba(224,82,82,0.1)' },
  asignado: { label: 'Asignado', color: '#0b90c8', bg: 'rgba(11,144,200,0.1)' },
  publicado: { label: 'Publicado', color: '#0b0b0b', bg: 'rgba(11,11,11,0.08)' },
  por_corregir: { label: 'Por Corregir', color: '#e8c55e', bg: 'rgba(232,197,94,0.1)' },
  Corregido: { label: 'Corregido', color: '#3ecf8e', bg: 'rgba(62,207,142,0.1)' },
  en_revision: { label: 'En Revisión', color: '#9b7fd4', bg: 'rgba(155,127,212,0.1)' },
};

function formatAuthors(m: any): string {
  const principal = m.autor_principal;
  const coautores = m.autores_secundarios
    ? m.autores_secundarios.map((as: any) => {
        const u = as.usuario || as.Usuario;
        return u ? `${u.nombre} ${u.apellido}` : "";
      }).filter(Boolean)
    : [];
  const allAuthors = [
    principal ? `${principal.nombre} ${principal.apellido}` : `Autor #${m.autor_principal_id}`,
    ...coautores
  ].filter(Boolean);
  return allAuthors.join(", ");
}

function ArticleStatusBadge({ status }: { status: string }) {
  const conf = ARTICLE_STATUS_MAP[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
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
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleChanging, setUserRoleChanging] = useState<string | null>(null);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  // --- Real API & Form States ---
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [revistas, setRevistas] = useState<any[]>([]);
  const [lineas, setLineas] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [revistaAreaId, setRevistaAreaId] = useState<number | "">("");
  const [revistaProgramaId, setRevistaProgramaId] = useState<number | "">("");
  
  // Modals / forms visibility
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRevistaModal, setShowRevistaModal] = useState(false);
  const [showNumeroModal, setShowNumeroModal] = useState(false);
  const [showVolumenModal, setShowVolumenModal] = useState(false);
  const [showNumeroArticulosModal, setShowNumeroArticulosModal] = useState(false);
  const [selectedNumeroArticulos, setSelectedNumeroArticulos] = useState<any[]>([]);
  const [selectedNumeroInfo, setSelectedNumeroInfo] = useState<any>(null);
  const [loadingNumeroArticulos, setLoadingNumeroArticulos] = useState(false);
  const [showArticleDetailModal, setShowArticleDetailModal] = useState(false);
  const [selectedArticleDetail, setSelectedArticleDetail] = useState<any>(null);
  const [loadingArticleDetail, setLoadingArticleDetail] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRevista, setFilterRevista] = useState("");
  const [filterLinea, setFilterLinea] = useState("");
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [manuscriptsPage, setManuscriptsPage] = useState(1);
  const MANUSCRIPTS_PER_PAGE = 25;
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

  // Expandable revista list state
  const [expandedRevistas, setExpandedRevistas] = useState<Set<number>>(new Set());
  const [revistaVolumenes, setRevistaVolumenes] = useState<Record<number, any[]>>({});

  // For volumen modal - revista selector
  const [volumenRevistaId, setVolumenRevistaId] = useState<number | "">("");

  // For numero modal - revista + volumen selectors
  const [numeroRevistaId, setNumeroRevistaId] = useState<number | "">("");
  const [numeroVolumenes, setNumeroVolumenes] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const data = await api.usuarios.fetchAll();
      setRealUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchRevistas = async () => {
    try {
      const data = await api.revistas.fetchAllAdmin();
      setRevistas(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchLineas = async () => {
    try {
      const data = await api.lineas.fetchAll();
      setLineas(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchAreas = async () => {
    try {
      const data = await api.areas.fetchAll();
      setAreas(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchProgramas = async () => {
    try {
      const data = await api.programas.fetchAll();
      setProgramas(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchArticles = async () => {
    try {
      const data = await api.articulos.fetchAll();
      setAllArticles(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      const data = await api.stats.dashboard();
      setStatsData(data);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
    fetchRevistas();
    fetchLineas();
    fetchAreas();
    fetchProgramas();
    fetchArticles();
    fetchStats();
  }, []);

  useEffect(() => { setManuscriptsPage(1); }, [filterTitle, filterAuthor, filterStatus, filterRevista, filterLinea]);

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
      const res = await fetch(`${BASE_URL}/api/usuarios/crear-admin`, {
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
    try {
      let data;
      if (editingRevista) {
        data = await api.revistas.update(editingRevista.id, revistaForm);
      } else {
        data = await api.revistas.create(revistaForm);
      }
      showToast("success", editingRevista ? "Revista actualizada" : "Revista creada exitosamente");
      setShowRevistaModal(false);
      setEditingRevista(null);
      setRevistaForm({ nombre: "", issn: "", periodicidad: "semestral", descripcion: "", lineas_permitidas: [] });
      setRevistaAreaId("");
      setRevistaProgramaId("");
      fetchRevistas();
    } catch (err: any) {
      showToast("error", err.message || "Error de conexión");
    }
  };

  const handleDesactivarRevista = async (revId: number) => {
    if (!confirm("¿Está seguro de que desea desactivar esta revista?")) return;
    try {
      await api.revistas.deactivate(revId);
      showToast("success", "Revista desactivada correctamente");
      fetchRevistas();
    } catch (err: any) {
      showToast("error", err.message || "Error de conexión");
    }
  };

  const handleActivarRevista = async (revId: number) => {
    try {
      await api.revistas.activate(revId);
      showToast("success", "Revista activada correctamente");
      fetchRevistas();
    } catch (err: any) {
      showToast("error", err.message || "Error de conexión");
    }
  };

  const groupNumerosByVolumen = (volumenes: any[]) => {
    return volumenes.sort((a: any, b: any) => b.numero_volumen - a.numero_volumen);
  };

  const toggleRevistaExpand = async (revId: number) => {
    const next = new Set(expandedRevistas);
    if (next.has(revId)) {
      next.delete(revId);
    } else {
      next.add(revId);
      if (!revistaVolumenes[revId]) {
        try {
          const data = await api.revistas.fetchVolumenes(revId);
          setRevistaVolumenes(prev => ({ ...prev, [revId]: groupNumerosByVolumen(Array.isArray(data) ? data : []) }));
        } catch (e) {
          setRevistaVolumenes(prev => ({ ...prev, [revId]: [] }));
        }
      }
    }
    setExpandedRevistas(next);
  };

  const refreshRevistaVolumenes = async (revId: number) => {
    try {
      const data = await api.revistas.fetchVolumenes(revId);
      setRevistaVolumenes(prev => ({ ...prev, [revId]: groupNumerosByVolumen(Array.isArray(data) ? data : []) }));
    } catch (e) {}
  };

  const openArticleDetail = async (articleId: number) => {
    setLoadingArticleDetail(true);
    setShowArticleDetailModal(true);
    try {
      const data = await api.articulos.fetchAdminDetail(articleId);
      setSelectedArticleDetail(data);
    } catch (e) {
      setSelectedArticleDetail(null);
    } finally {
      setLoadingArticleDetail(false);
    }
  };

  const handleToggleNumeroStatus = async (revId: number, volId: number, numId: number, currentStatus: string) => {
    const newStatus = currentStatus === "publicado" ? "futuro" : "publicado";
    try {
      const vol = revistaVolumenes[revId]?.find((v: any) => v.id === volId);
      const num = vol?.numeros?.find((n: any) => n.id === numId);
      await api.revistas.updateNumero(revId, volId, numId, {
        numero: num?.numero,
        anio: num?.anio,
        titulo_edicion: num?.titulo_edicion,
        status: newStatus,
      });
      await refreshRevistaVolumenes(revId);
      showToast("success", `Número marcado como ${newStatus}`);
    } catch (err: any) {
      showToast("error", err.message || "Error al cambiar estado");
    }
  };

  const fetchVolumenesForNumeroModal = async (revId: number) => {
    try {
      const data = await api.revistas.fetchVolumenes(revId);
      setNumeroVolumenes(
        (Array.isArray(data) ? data : []).map((v: any) => ({
          numero_volumen: v.numero_volumen,
          id: v.id
        })).sort((a: any, b: any) => b.numero_volumen - a.numero_volumen)
      );
    } catch (e) {
      setNumeroVolumenes([]);
    }
  };

  const handleCreateVolumen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volumenRevistaId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/revistas/${volumenRevistaId}/volumenes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          numero_volumen: parseInt(volumenForm.volumen)
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Volumen creado exitosamente");
        setShowVolumenModal(false);
        setVolumenRevistaId("");
        setVolumenForm({ volumen: "", anio: new Date().getFullYear().toString() });
        if (expandedRevistas.has(volumenRevistaId)) {
          refreshRevistaVolumenes(volumenRevistaId);
        }
      } else {
        showToast("error", data.message || "Error al crear volumen");
      }
    } catch (err) {
      showToast("error", "Error de conexión");
    }
  };

  const handleCreateNumero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroRevistaId || !numeroForm.volumen) return;
    try {
      const res = await fetch(`${BASE_URL}/api/revistas/${numeroRevistaId}/volumenes/${numeroForm.volumen}/numeros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          numero: parseInt(numeroForm.numero),
          anio: parseInt(numeroForm.anio) || new Date().getFullYear(),
          titulo_edicion: numeroForm.titulo_edicion,
          status: "futuro",
          fecha_publicacion: numeroForm.fecha_publicacion || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Número de revista creado exitosamente");
        setShowNumeroModal(false);
        setNumeroRevistaId("");
        setNumeroVolumenes([]);
        setNumeroForm({
          volumen: "",
          numero: "",
          anio: new Date().getFullYear().toString(),
          titulo_edicion: "",
          status: "futuro",
          fecha_publicacion: ""
        });
        if (expandedRevistas.has(numeroRevistaId)) {
          refreshRevistaVolumenes(numeroRevistaId);
        }
      } else {
        showToast("error", data.message || "Error al crear número");
      }
    } catch (err) {
      showToast("error", "Error de conexión");
    }
  };

  const totalManuscripts = allArticles.length;
  const publishedCount = allArticles.filter((m) => m.status === "publicado").length;
  const inReviewCount = allArticles.filter((m) =>
    ["en_revision", "En_evaluacion", "por_evaluar"].includes(m.status)
  ).length;
  const pendingCount = allArticles.filter((m) => m.status === "enviado").length;

  // Chart data
  const statusData = Object.entries(
    allArticles.reduce((acc, m) => {
      const conf = ARTICLE_STATUS_MAP[m.status] || { label: m.status };
      acc[conf.label] = (acc[conf.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const categoryData = Object.entries(
    allArticles.reduce((acc, m) => {
      const key = m.linea_id ? `Línea ${m.linea_id}` : 'Sin clasificar';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.slice(0, 15), value }));

  const PIE_COLORS = ["#3ecf8e", "#6c8ebf", "#9b7fd4", "#e07b54", "#e8c55e", "#e05252"];

  const filteredArticles = allArticles.filter((m) => {
    const qTitle = filterTitle.toLowerCase().trim();
    const qAuthor = filterAuthor.toLowerCase().trim();
    const authorName = formatAuthors(m).toLowerCase();
    const articleRevistaId = m.numero_revista?.volumen?.revista?.id;
    const articleLineaId = m.linea?.id;
    return (!qTitle || (m.titulo_es || '').toLowerCase().includes(qTitle))
      && (!qAuthor || authorName.includes(qAuthor))
      && (!filterStatus || m.status === filterStatus)
      && (!filterRevista || articleRevistaId === parseInt(filterRevista, 10))
      && (!filterLinea || articleLineaId === parseInt(filterLinea, 10));
  });

  const navItems = [
    { id: "overview", label: "Resumen General", icon: <LayoutDashboard size={14} /> },
    { id: "manuscripts", label: "Todos los Manuscritos", icon: <FileText size={14} />, badge: pendingCount },
    { id: "users", label: "Gestión de Usuarios", icon: <Users size={14} /> },
    { id: "analytics", label: "Analíticas", icon: <TrendingUp size={14} /> },
    { id: "revistas", label: "Revistas", icon: <BookOpen size={14} /> },
    { id: "articles", label: "Gestión de Artículos", icon: <FileCheck size={14} /> },
    { id: "areas", label: "Programas, Áreas y Líneas", icon: <Layers size={14} /> },
    { id: "submit", label: "Nuevo Envío", icon: <Plus size={14} /> },
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
        : section === "submit" ? "Nuevo Envío"
        : "Programas, Áreas y Líneas de Investigación"
      }
      subtitle={`Bienvenido, ${user?.name?.split(" ")[0]}`}
    >
      {/* OVERVIEW */}
      {section === "overview" && (
        <div>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total manuscritos", value: totalManuscripts, color: "#0b0b0b" },
              { label: "Pendientes revisión", value: pendingCount, color: "#6c8ebf" },
              { label: "En revisión", value: inReviewCount, color: "#9b7fd4" },
              { label: "Publicados", value: publishedCount, color: "#3ecf8e" },
            ].map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "20px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 600, color: kpi.color, lineHeight: 1, marginBottom: "6px" }}>
                  {kpi.value}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, color: "#444" }}>
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          {/* Users stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(["investigador", "editor", "revisor", "admin"] as const).map((role) => {
              const count = realUsers.filter((u) => u.rol === role).length;
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
            {allArticles.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-4 py-3" style={{ borderBottom: "1px solid #f9f9f9" }}>
                <ArticleStatusBadge status={m.status} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.titulo_es || 'Sin título'}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                    {formatAuthors(m)} · {m.fecha_recepcion || ''}
                  </p>
                </div>
              </div>
            ))}
            {allArticles.length === 0 && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "20px" }}>
                No hay actividad registrada aún
              </p>
            )}
          </div>
        </div>
)}
{section === "articles" && (
  <ApprovedArticlesList />
)}
{/* SUBMIT */}
{section === "submit" && (
  <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "32px" }}>
    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "8px" }}>
      Enviar nuevo manuscrito
    </h3>
    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888", marginBottom: "24px", lineHeight: 1.6 }}>
      Usa el formulario de envío para subir un trabajo. Una vez recibido, un editor lo revisará y lo asignará al flujo de revisión por pares.
    </p>
    <Link
      to="/publicar"
      className="inline-flex items-center gap-2 px-5 py-3 rounded"
      style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, textDecoration: "none" }}
    >
      <Plus size={14} /> Ir al formulario de envío
    </Link>
  </div>
)}
{/* AREAS SECTION */}
{section === "areas" && (
  <AreaLineManagement />
)}


      {/* MANUSCRIPTS */}
      {section === "manuscripts" && (
        <div>
          <div className="flex flex-wrap items-end gap-3 mb-4 p-3 rounded" style={{ background: "#fafafa", border: "1px solid #efefef" }}>
            <div className="flex-1 min-w-[160px]">
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
                Título
              </label>
              <input
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                placeholder="Buscar por título..."
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none",
                }}
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
                Autor
              </label>
              <input
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                placeholder="Buscar por autor..."
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none",
                }}
              />
            </div>
            <div className="min-w-[130px]">
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none", background: "#fff",
                }}
              >
                <option value="">Todos</option>
                {Object.entries(ARTICLE_STATUS_MAP).map(([key, v]) => (
                  <option key={key} value={key}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[150px]">
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
                Revista
              </label>
              <select
                value={filterRevista}
                onChange={(e) => setFilterRevista(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none", background: "#fff",
                }}
              >
                <option value="">Todas</option>
                {revistas.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}{!r.activo ? " (Deshabilitado)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[150px]">
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
                Línea
              </label>
              <select
                value={filterLinea}
                onChange={(e) => setFilterLinea(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none", background: "#fff",
                }}
              >
                <option value="">Todas</option>
                {lineas.filter(l => l.status !== false).map(l => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            </div>
            {(filterTitle || filterAuthor || filterStatus || filterRevista || filterLinea) && (
              <button
                onClick={() => { setFilterTitle(""); setFilterAuthor(""); setFilterStatus(""); setFilterRevista(""); setFilterLinea(""); }}
                className="self-end p-2 rounded"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {(() => {
            const totalP = Math.ceil(filteredArticles.length / 25);
            const paginated = filteredArticles.slice((manuscriptsPage - 1) * 25, manuscriptsPage * 25);
            return (
              <>
                <div className="flex flex-col gap-3">
                  {paginated.map((m) => {
                    const st = ARTICLE_STATUS_MAP[m.status] || { label: m.status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
                    return (
                      <div key={m.id} onClick={() => openArticleDetail(m.id)} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "18px", cursor: "pointer", transition: "box-shadow 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <ArticleStatusBadge status={m.status} />
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                                #{m.id}
                              </span>
                            </div>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "4px" }}>
                              {m.titulo_es || 'Sin título'}
                            </p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
                              {formatAuthors(m)}
                              {m.linea ? ` · ${m.linea.nombre}` : ''}
                              {m.numero_revista?.volumen?.revista ? ` · ${m.numero_revista.volumen.revista.nombre}` : ''}
                              {m.numero_revista ? ` Vol. ${m.numero_revista.volumen?.numero_volumen || '?'} Nº ${m.numero_revista.numero || '?'}` : ''}
                              {m.fecha_recepcion ? ` · ${m.fecha_recepcion}` : ''}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 flex-col items-end">
                            {m.status === "publicado" && (
                              <Link
                                to={`/articulo/${m.id}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#3ecf8e", textDecoration: "none" }}
                              >
                                Ver artículo →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {paginated.length === 0 && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "40px" }}>
                      {allArticles.length === 0 ? "No hay artículos registrados aún" : "No se encontraron artículos con los filtros seleccionados"}
                    </p>
                  )}
                </div>
                {totalP > 1 && (
                  <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid #f0f0f0" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#999" }}>
                      {((manuscriptsPage - 1) * 25) + 1}–{Math.min(manuscriptsPage * 25, filteredArticles.length)} de {filteredArticles.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setManuscriptsPage(p => Math.max(1, p - 1))}
                        disabled={manuscriptsPage === 1}
                        style={{
                          padding: "6px 14px", borderRadius: "4px", border: "1px solid #e0e0e0",
                          background: manuscriptsPage === 1 ? "#fafafa" : "#fff",
                          color: manuscriptsPage === 1 ? "#ccc" : "#333",
                          cursor: manuscriptsPage === 1 ? "not-allowed" : "pointer",
                          fontFamily: "'Inter', sans-serif", fontSize: "13px",
                        }}
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setManuscriptsPage(p => Math.min(totalP, p + 1))}
                        disabled={manuscriptsPage === totalP}
                        style={{
                          padding: "6px 14px", borderRadius: "4px", border: "1px solid #e0e0e0",
                          background: manuscriptsPage === totalP ? "#fafafa" : "#fff",
                          color: manuscriptsPage === totalP ? "#ccc" : "#333",
                          cursor: manuscriptsPage === totalP ? "not-allowed" : "pointer",
                          fontFamily: "'Inter', sans-serif", fontSize: "13px",
                        }}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
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
                            href={`${BASE_URL}/${(u as any).cv}`}
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
          {statsLoading ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "60px 0" }}>Cargando estadísticas...</p>
          ) : !statsData ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "60px 0" }}>Error al cargar estadísticas</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Artículos", value: statsData.totals.articulos, color: "#6c8ebf" },
                  { label: "Usuarios Registrados", value: statsData.totals.usuarios, color: "#9b7fd4" },
                  { label: "Evaluaciones Realizadas", value: statsData.totals.evaluaciones, color: "#e07b54" },
                  { label: "Artículos Publicados", value: statsData.articulosPorStatus?.find((s: any) => s.status === 'publicado')?.cantidad || 0, color: "#3ecf8e" },
                ].map((card) => (
                  <div key={card.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "20px" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "28px", fontWeight: 700, color: card.color }}>{card.value}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Monthly submissions */}
              <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
                  Envíos y publicaciones mensuales
                </p>
                {statsData.monthlyData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={statsData.monthlyData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="mes" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px", border: "1px solid #efefef" }} />
                      <Bar dataKey="submissions" name="Enviados" fill="#6c8ebf" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="published" name="Publicados" fill="#3ecf8e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#999", textAlign: "center", marginTop: "12px" }}>
                    No hay datos mensuales registrados aún
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Status pie */}
                <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "24px" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
                    Estado actual
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statsData.articulosPorStatus?.map((s: any) => ({
                        name: ARTICLE_STATUS_MAP[s.status]?.label || s.status,
                        value: s.cantidad
                      })) || []} dataKey="value" cx="50%" cy="50%" outerRadius={75}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                        style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px" }}
                      >
                        {(statsData.articulosPorStatus || []).map((_: any, i: number) => (
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
                    Por línea de investigación
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statsData.articulosPorLinea?.map((l: any) => ({
                      name: (l.linea_nombre || 'Sin línea').slice(0, 15),
                      value: l.cantidad
                    })) || []} layout="vertical">
                      <XAxis type="number" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#555" }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px" }} />
                      <Bar dataKey="value" fill="#9b7fd4" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* REVISTAS */}
      {section === "revistas" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>
              Administre las revistas científicas, sus volúmenes y números.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingRevista(null);
                  setRevistaForm({ nombre: "", issn: "", periodicidad: "semestral", descripcion: "", lineas_permitidas: [] });
                  setRevistaAreaId("");
                  setRevistaProgramaId("");
                  setShowRevistaModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white bg-black hover:bg-neutral-800 transition"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer" }}
              >
                <Plus size={16} /> Nueva Revista
              </button>
              <button
                onClick={() => {
                  setVolumenRevistaId("");
                  setVolumenForm({ volumen: "", anio: new Date().getFullYear().toString() });
                  setShowVolumenModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer" }}
              >
                <Plus size={16} /> Nuevo Volumen
              </button>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "6px", padding: "20px" }}>
            <div className="flex items-center justify-between mb-4">
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b" }}>
                Estructura de Revistas
              </h4>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#999" }}>
                {revistas.length} revista(s)
              </span>
            </div>

            {revistas.length === 0 ? (
              <div className="text-center py-12" style={{ border: "1px dashed #e0e0e0", borderRadius: "6px" }}>
                <BookOpen size={32} color="#ddd" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999" }}>No hay revistas creadas aún</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {revistas.map((r) => {
                  const isExpanded = expandedRevistas.has(r.id);
                  const volumenes = revistaVolumenes[r.id] || [];
                  return (
                    <div key={r.id} style={{ border: "1px solid #f0f0f0", borderRadius: "6px", overflow: "hidden" }}>
                      {/* REVISTA ROW */}
                      <div
                        className="flex items-center gap-2 p-3 cursor-pointer"
                        style={{ background: "#fafafa", borderBottom: isExpanded ? "1px solid #f0f0f0" : "none" }}
                        onClick={() => toggleRevistaExpand(r.id)}
                      >
                        <div style={{ color: "#888", transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                          <ChevronRight size={14} />
                        </div>
                        <BookOpen size={14} color="#3ecf8e" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600, color: "#0b0b0b", flex: 1 }}>
                          {r.nombre}
                        </span>
                        {r.issn && (
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>
                            ISSN {r.issn}
                          </span>
                        )}
                        <span style={{ fontSize: "12px", color: "#bbb" }}>
                          {volumenes.length} volumen(es)
                        </span>
                        <span
                          style={{
                            fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: 600,
                            color: r.activo ? "#3ecf8e" : "#e05252",
                            background: r.activo ? "rgba(62,207,142,0.1)" : "rgba(224,82,82,0.1)",
                            textDecoration: r.activo ? "none" : "line-through",
                            opacity: r.activo ? 1 : 0.7,
                          }}
                        >
                          {r.activo ? "Activo" : "Deshabilitado"}
                        </span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingRevista(r);
                              const lineasPermitidas = Array.isArray(r.lineas_permitidas) ? r.lineas_permitidas : [];
                              setRevistaForm({ nombre: r.nombre, issn: r.issn || "", periodicidad: r.periodicidad || "semestral", descripcion: r.descripcion || "", lineas_permitidas: lineasPermitidas });
                              if (lineasPermitidas.length > 0) {
                                const firstLinea = lineas.find(l => l.id === lineasPermitidas[0]);
                                if (firstLinea) {
                                  setRevistaProgramaId(firstLinea.programa_id);
                                  const prog = programas.find(p => p.id === firstLinea.programa_id);
                                  if (prog) setRevistaAreaId(prog.area_id);
                                }
                              }
                              setShowRevistaModal(true);
                            }}
                            className="p-1 rounded"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#666")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                            title="Editar revista"
                          >
                            <Edit size={12} />
                          </button>
                          {r.activo ? (
                            <button
                              onClick={() => handleDesactivarRevista(r.id)}
                              className="p-1 rounded"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#e05252")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                              title="Desactivar revista"
                            >
                              <span style={{ fontSize: "10px", fontWeight: 700 }}>OFF</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivarRevista(r.id)}
                              className="p-1 rounded"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#3ecf8e")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                              title="Activar revista"
                            >
                              <span style={{ fontSize: "10px", fontWeight: 700 }}>ON</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* VOLUMENES */}
                      {isExpanded && (
                        <div style={{ padding: "6px 12px 10px 36px" }}>
                          {volumenes.length === 0 ? (
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#ccc", padding: "8px 0", textAlign: "center" }}>
                              Sin volúmenes
                            </p>
                          ) : (
                            volumenes.map((vol: any) => {
                              const isVolExpanded = expandedRevistas.has(r.id) && vol.numeros.length > 0;
                              return (
                                <div key={vol.numero_volumen} style={{ marginBottom: "1px" }}>
                                  <div className="flex items-center gap-2 p-2 rounded" style={{ background: "#f8f8f8" }}>
                                    <Calendar size={11} color="#888" />
                                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#444", flex: 1 }}>
                                      Volumen {vol.numero_volumen}
                                    </span>
                                    <span style={{ fontSize: "11px", color: "#ccc" }}>
                                      {vol.numeros.length} número(s)
                                    </span>
                                    <button
                                      onClick={() => {
                                        setNumeroRevistaId(r.id);
                                        fetchVolumenesForNumeroModal(r.id);
                                        setNumeroForm({ volumen: String(vol.id), numero: "", anio: new Date().getFullYear().toString(), titulo_edicion: "", status: "futuro", fecha_publicacion: "" });
                                        setShowNumeroModal(true);
                                      }}
                                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                      style={{ fontFamily: "'Inter', sans-serif", cursor: "pointer" }}
                                    >
                                      <Plus size={10} /> Número
                                    </button>
                                  </div>
                                  {/* NUMEROS */}
                                  {vol.numeros.length > 0 && (
                                    <div style={{ paddingLeft: "22px", paddingBottom: "4px" }}>
                                      {vol.numeros.map((num: any) => (
                                        <div key={num.id} className="flex items-center gap-2 py-1 px-2 rounded" onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                          <FileText size={10} color="#aaa" />
                                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#555", flex: 1 }}>
                                            Nº {num.numero} — {num.anio}
                                            {num.titulo_edicion && <span style={{ color: "#999", marginLeft: "4px" }}>({num.titulo_edicion})</span>}
                                          </span>
                                          <button
                                            onClick={() => handleToggleNumeroStatus(r.id, vol.id, num.id, num.status)}
                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider cursor-pointer border-0 transition-all ${
                                              num.status === 'publicado' ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                                            }`}
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                            title={`Cambiar a ${num.status === 'publicado' ? 'futuro' : 'publicado'}`}
                                          >
                                            {num.status}
                                          </button>
                                          <button
                                            onClick={async () => {
                                              setSelectedNumeroInfo({ ...num, volumen: vol.numero_volumen, revista: r.nombre });
                                              setLoadingNumeroArticulos(true);
                                              setShowNumeroArticulosModal(true);
                                              try {
                                                const data = await api.articulos.fetchByNumero(num.id);
                                                setSelectedNumeroArticulos(Array.isArray(data) ? data : []);
                                              } catch {
                                                setSelectedNumeroArticulos([]);
                                              } finally {
                                                setLoadingNumeroArticulos(false);
                                              }
                                            }}
                                            className="p-1 rounded"
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#3ecf8e")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                                            title="Ver artículos"
                                          >
                                            <Eye size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Artículos del Número */}
      {showNumeroArticulosModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowNumeroArticulosModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: "28px 32px", borderRadius: "8px", width: "100%", maxWidth: "600px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", maxHeight: "80vh", overflow: "auto" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b" }}>
                  Artículos — Nº {selectedNumeroInfo?.numero}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888" }}>
                  {selectedNumeroInfo?.revista} · Vol. {selectedNumeroInfo?.volumen} · {selectedNumeroInfo?.anio}
                </p>
              </div>
              <button onClick={() => setShowNumeroArticulosModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                <X size={18} />
              </button>
            </div>
            {loadingNumeroArticulos ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "24px 0" }}>Cargando...</p>
            ) : selectedNumeroArticulos.length === 0 ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "24px 0" }}>
                No hay artículos asignados a este número.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedNumeroArticulos.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                        {a.titulo_es}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>
                        {formatAuthors(a)}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600,
                      color: "#3ecf8e", background: "rgba(62,207,142,0.1)", padding: "2px 8px", borderRadius: "10px",
                    }}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Área</label>
                <select value={revistaAreaId} onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setRevistaAreaId(val);
                  setRevistaProgramaId("");
                  setRevistaForm({ ...revistaForm, lineas_permitidas: [] });
                }} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                  <option value="">Seleccionar área...</option>
                  {areas.filter(a => a.status !== false).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Programa</label>
                <select value={revistaProgramaId} onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setRevistaProgramaId(val);
                  setRevistaForm({ ...revistaForm, lineas_permitidas: [] });
                }} disabled={!revistaAreaId} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none", opacity: revistaAreaId ? 1 : 0.5 }}>
                  <option value="">Seleccionar programa...</option>
                  {programas.filter(p => p.area_id === revistaAreaId && p.status !== false).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Líneas de Investigación Permitidas</label>
                <div style={{ maxHeight: "140px", overflowY: "auto", border: "1px solid #e8e8e8", borderRadius: "4px", padding: "10px" }} className="grid grid-cols-2 gap-2">
                  {lineas.filter(l => revistaProgramaId && l.programa_id === revistaProgramaId && l.status !== false).map((l) => {
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
                  {(!revistaProgramaId || lineas.filter(l => l.programa_id === revistaProgramaId && l.status !== false).length === 0) && (
                    <p className="text-xs text-gray-400 col-span-2">{!revistaAreaId ? "Selecciona un área y programa primero" : "No hay líneas disponibles para este programa"}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowRevistaModal(false); setEditingRevista(null); setRevistaAreaId(""); setRevistaProgramaId(""); }} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Revista</label>
                <select required value={volumenRevistaId} onChange={(e) => setVolumenRevistaId(e.target.value ? Number(e.target.value) : "")} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                  <option value="">Seleccionar revista...</option>
                  {revistas.filter(r => r.activo).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Número de Volumen (Ej: 1)</label>
                <input required type="number" min="1" value={volumenForm.volumen} onChange={(e) => setVolumenForm({ ...volumenForm, volumen: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowVolumenModal(false); setVolumenRevistaId(""); }} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
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
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Revista</label>
                <div style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", background: "#f8f8f8", color: "#555", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                  {revistas.find((r: any) => r.id === numeroRevistaId)?.nombre || "—"}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Volumen</label>
                <div style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", background: "#f8f8f8", color: "#555", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                  {numeroVolumenes.find((v: any) => v.id === Number(numeroForm.volumen))?.numero_volumen ? `Volumen ${numeroVolumenes.find((v: any) => v.id === Number(numeroForm.volumen)).numero_volumen}` : "—"}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Número (Issue)</label>
                <input required type="number" min="1" value={numeroForm.numero} onChange={(e) => setNumeroForm({ ...numeroForm, numero: e.target.value })} placeholder="Ej: 1" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Título de la Edición</label>
                <input required type="text" placeholder="Enero-Junio, Edición Especial" value={numeroForm.titulo_edicion} onChange={(e) => setNumeroForm({ ...numeroForm, titulo_edicion: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Año</label>
                <input type="number" value={numeroForm.anio} onChange={(e) => setNumeroForm({ ...numeroForm, anio: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Fecha Publicación (Opcional)</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={numeroForm.fecha_publicacion} onChange={(e) => setNumeroForm({ ...numeroForm, fecha_publicacion: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none", fontFamily: "'Inter', sans-serif" }} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowNumeroModal(false); setNumeroRevistaId(""); setNumeroVolumenes([]); }} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
                <button type="submit" style={{ padding: "8px 20px", background: "#0b0b0b", color: "#fff", borderRadius: "4px", cursor: "pointer", border: "none" }}>Crear Número</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {showArticleDetailModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={() => { setShowArticleDetailModal(false); setSelectedArticleDetail(null); }}>
          <div style={{ background: "#fff", borderRadius: "8px", width: "100%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            {loadingArticleDetail ? (
              <div style={{ padding: "48px", textAlign: "center", fontFamily: "'Inter', sans-serif", color: "#888" }}>Cargando detalles...</div>
            ) : !selectedArticleDetail ? (
              <div style={{ padding: "48px", textAlign: "center", fontFamily: "'Inter', sans-serif", color: "#888" }}>No se pudo cargar el artículo.</div>
            ) : (
              <div>
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #efefef", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>Detalle del Artículo</h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888" }}>ID #{selectedArticleDetail.id}</p>
                  </div>
                  <button onClick={() => { setShowArticleDetailModal(false); setSelectedArticleDetail(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#888" }}>×</button>
                </div>
                <div style={{ padding: "24px 32px" }}>
                  {/* Status & Titles */}
                  <div style={{ marginBottom: "20px" }}>
                    <ArticleStatusBadge status={selectedArticleDetail.status} />
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginTop: "10px", lineHeight: 1.3 }}>{selectedArticleDetail.titulo_es}</h4>
                    {selectedArticleDetail.titulo_en && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginTop: "4px", fontStyle: "italic" }}>{selectedArticleDetail.titulo_en}</p>}
                  </div>

                  {/* Grid Info */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#444" }}>
                    <div><span style={{ color: "#888" }}>Autor(es):</span> {formatAuthors(selectedArticleDetail)}</div>
                    <div><span style={{ color: "#888" }}>Línea:</span> {selectedArticleDetail.lineas_investigacion?.nombre || '—'}</div>
                    <div><span style={{ color: "#888" }}>Revista:</span> {selectedArticleDetail.revista?.nombre || '—'}</div>
                    <div><span style={{ color: "#888" }}>Número:</span> {selectedArticleDetail.numero_revista ? `Vol. ${selectedArticleDetail.numero_revista.volumen?.numero_volumen || '?'} Nº ${selectedArticleDetail.numero_revista.numero || '?'}` : 'No asignado'}</div>
                    <div><span style={{ color: "#888" }}>Fecha recepción:</span> {selectedArticleDetail.fecha_recepcion || '—'}</div>
                    <div><span style={{ color: "#888" }}>Fecha publicación:</span> {selectedArticleDetail.fecha_publicacion || '—'}</div>
                    <div><span style={{ color: "#888" }}>DOI:</span> {selectedArticleDetail.doi || '—'}</div>
                    <div><span style={{ color: "#888" }}>Páginas:</span> {selectedArticleDetail.pages || '—'}</div>
                    <div><span style={{ color: "#888" }}>Palabras clave:</span> {selectedArticleDetail.palabras_clave || '—'}</div>
                    <div><span style={{ color: "#888" }}>Views:</span> {selectedArticleDetail.views || 0}</div>
                  </div>

                  {/* Coauthors */}
                  {selectedArticleDetail.autores_secundarios && selectedArticleDetail.autores_secundarios.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h5 style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Coautores</h5>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                        {selectedArticleDetail.autores_secundarios.map((as: any) => (
                          <span key={as.id} style={{ padding: "4px 10px", background: "#f5f5f5", borderRadius: "12px", fontSize: "13px", color: "#555", fontFamily: "'Inter', sans-serif" }}>
                            {as.usuario?.nombre} {as.usuario?.apellido}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Abstracts */}
                  {(selectedArticleDetail.resumen_es || selectedArticleDetail.resumen_en) && (
                    <div style={{ marginBottom: "20px", padding: "16px", background: "#fafafa", borderRadius: "6px" }}>
                      {selectedArticleDetail.resumen_es && (
                        <div style={{ marginBottom: "12px" }}>
                          <h5 style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Resumen</h5>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#444", lineHeight: 1.6 }}>{selectedArticleDetail.resumen_es}</p>
                        </div>
                      )}
                      {selectedArticleDetail.resumen_en && (
                        <div>
                          <h5 style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Abstract</h5>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#444", lineHeight: 1.6, fontStyle: "italic" }}>{selectedArticleDetail.resumen_en}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Files */}
                  {selectedArticleDetail.ArchivoArticulos && selectedArticleDetail.ArchivoArticulos.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h5 style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Archivos Relacionados ({selectedArticleDetail.ArchivoArticulos.length})</h5>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px" }}>
                        {selectedArticleDetail.ArchivoArticulos.map((file: any) => (
                          <a key={file.id} href={`${BASE_URL}/${file.url}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#f8f8f8", borderRadius: "4px", textDecoration: "none", color: "#333", fontFamily: "'Inter', sans-serif", fontSize: "13px" }}>
                            <FileText size={14} color="#888" />
                            <span style={{ textTransform: "capitalize" }}>{file.tipo_archivo.replace(/_/g, ' ')}</span>
                            <span style={{ marginLeft: "auto", color: "#888", fontSize: "12px" }}>v{file.version}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evaluations */}
                  {selectedArticleDetail.evaluaciones && selectedArticleDetail.evaluaciones.length > 0 && (
                    <div>
                      <h5 style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Evaluaciones ({selectedArticleDetail.evaluaciones.length})</h5>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                        {selectedArticleDetail.evaluaciones.map((ev: any) => (
                          <div key={ev.id} style={{ padding: "14px", border: "1px solid #efefef", borderRadius: "6px", background: "#fdfdfd" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#333" }}>
                                {ev.revisor ? `${ev.revisor.nombre} ${ev.revisor.apellido}` : `Revisor #${ev.revisor_id}`}
                              </span>
                              <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: 600 }}>{ev.veredicto || 'Pendiente'}</span>
                            </div>
                            {ev.observaciones_editor && (
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#555", marginBottom: "4px" }}><span style={{ color: "#888" }}>Editor:</span> {ev.observaciones_editor}</p>
                            )}
                            {ev.observaciones_autor && (
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#555" }}><span style={{ color: "#888" }}>Autor:</span> {ev.observaciones_autor}</p>
                            )}
                            {ev.fecha_evaluacion && (
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa", marginTop: "6px" }}>{new Date(ev.fecha_evaluacion).toLocaleDateString('es-ES')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedArticleDetail.evaluaciones || selectedArticleDetail.evaluaciones.length === 0) && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb", textAlign: "center", padding: "16px" }}>Sin evaluaciones registradas.</p>
                  )}
                </div>
              </div>
            )}
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