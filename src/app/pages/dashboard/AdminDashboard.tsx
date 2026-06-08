import { useState } from "react";
import { Link } from "react-router";
import AreaLineManagement from "../../features/dashboard/AreaLineManagement";
import RevistasNavMenu from "../../features/dashboard/RevistasNavMenu";
import {
  LayoutDashboard, Users, FileText, Settings, Star, TrendingUp,
  ChevronDown, ChevronRight, Shield, UserCheck, Edit3, Gavel, Eye, BookOpen, Plus, Search, Check, Download, Edit, Calendar, AlertCircle, Loader2
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth, ROLE_CONFIG, type UserRole } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type Manuscript, type ManuscriptStatus, STATUS_CONFIG } from "../../data/manuscripts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { useEffect } from "react";
import { api, BASE_URL } from "../../api/api";
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
  const [areas, setAreas] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [revistaAreaId, setRevistaAreaId] = useState<number | "">("");
  const [revistaProgramaId, setRevistaProgramaId] = useState<number | "">("");
  
  // Hierarchical expand state
  const [expandedRevistas, setExpandedRevistas] = useState<Set<number>>(new Set());
  const [expandedVolumenes, setExpandedVolumenes] = useState<Set<number>>(new Set());
  const [volumenesData, setVolumenesData] = useState<Record<number, any[]>>({});
  const [numerosData, setNumerosData] = useState<Record<number, any[]>>({});
  const [creatingVolumenFor, setCreatingVolumenFor] = useState<number | null>(null);
  const [newVolumenNumero, setNewVolumenNumero] = useState("");
  
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
    apellido: "",
    correo: "",
    password: "",
    orcid: "",
    afiliacion_institucional: "",
    rol: "autor"
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

  // For volumen modal - revista selector
  const [volumenRevistaId, setVolumenRevistaId] = useState<number | "">("");

  // For numero modal - revista + volumen selectors
  const [numeroRevistaId, setNumeroRevistaId] = useState<number | "">("");
  const [numeroVolumenes, setNumeroVolumenes] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const data = await api.usuarios.fetchAll();
      setRealUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRevistas = async () => {
    try {
      const data = await api.revistas.fetchAll();
      setRevistas(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLineas = async () => {
    try {
      const data = await api.lineas.fetchAll();
      setLineas(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await api.areas.fetchAll();
      setAreas(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProgramas = async () => {
    try {
      const data = await api.programas.fetchAll();
      setProgramas(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRevistaDetails = async (revId: number) => {
    try {
      const articles = await api.articulos.fetchApproved(revId);
      setRevistaArticulos(articles);
      const volumes = await api.revistas.fetchVolumenes(revId);
      setRevistaNumeros(volumes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRevistas();
    fetchLineas();
    fetchAreas();
    fetchProgramas();
  }, []);

  useEffect(() => {
    if (selectedRevista) {
      fetchRevistaDetails(selectedRevista.id);
    }
  }, [selectedRevista]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleRevista = async (revId: number) => {
    const next = new Set(expandedRevistas);
    if (next.has(revId)) {
      next.delete(revId);
    } else {
      next.add(revId);
      if (!volumenesData[revId]) {
        try {
          const data = await api.revistas.fetchVolumenes(revId);
          setVolumenesData(prev => ({ ...prev, [revId]: Array.isArray(data) ? data : [] }));
        } catch (e) {
          setVolumenesData(prev => ({ ...prev, [revId]: [] }));
        }
      }
    }
    setExpandedRevistas(next);
  };

  const toggleVolumen = async (revId: number, volId: number) => {
    const next = new Set(expandedVolumenes);
    if (next.has(volId)) {
      next.delete(volId);
    } else {
      next.add(volId);
      if (!numerosData[volId]) {
        try {
          const res = await fetch(`${BASE_URL}/api/revistas/${revId}/volumenes/${volId}/numeros`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          });
          const json = await res.json();
          setNumerosData(prev => ({ ...prev, [volId]: Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [] }));
        } catch (e) {
          setNumerosData(prev => ({ ...prev, [volId]: [] }));
        }
      }
    }
    setExpandedVolumenes(next);
  };

  const handleCreateVolumenInline = async (revId: number) => {
    if (!newVolumenNumero) return;
    try {
      await fetch(`${BASE_URL}/api/revistas/${revId}/volumenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ numero_volumen: Number(newVolumenNumero) })
      });
      setNewVolumenNumero("");
      setCreatingVolumenFor(null);
      const data = await api.revistas.fetchVolumenes(revId);
      setVolumenesData(prev => ({ ...prev, [revId]: Array.isArray(data) ? data : [] }));
      showToast("success", "Volumen creado");
    } catch (e: any) {
      showToast("error", e.message || "Error al crear volumen");
    }
  };

  const refreshRevistaVolumenes = async (revId: number) => {
    try {
      const data = await api.revistas.fetchVolumenes(revId);
      setVolumenesData(prev => ({ ...prev, [revId]: Array.isArray(data) ? data : [] }));
    } catch (e) {}
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

  const handleCreateVolumenModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volumenRevistaId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/revistas/${volumenRevistaId}/volumenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ numero_volumen: parseInt(volumenForm.volumen) })
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

  const handleCreateNumeroModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroRevistaId || !numeroForm.volumen) return;
    try {
      const res = await fetch(`${BASE_URL}/api/revistas/${numeroRevistaId}/volumenes/${numeroForm.volumen}/numeros`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
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
        setNumeroRevistaId("");
        setNumeroVolumenes([]);
        setNumeroForm({ volumen: "", numero: "", anio: new Date().getFullYear().toString(), titulo_edicion: "", status: "futuro", fecha_publicacion: "" });
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
          apellido: "",
          correo: "",
          password: "",
          orcid: "",
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
      ? `${BASE_URL}/api/revistas/${editingRevista.id}`
      : `${BASE_URL}/api/revistas`;

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
        setRevistaAreaId("");
        setRevistaProgramaId("");
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
      const res = await fetch(`${BASE_URL}/api/revistas/${revId}/desactivar`, {
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

  const handleCreateNumero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRevista) return;
    try {
      const res = await fetch(`${BASE_URL}/api/revistas/${selectedRevista.id}/volumenes/${numeroForm.volumen}/numeros`, {
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
        showToast("success", "Nuevo volumen/número creado exitosamente");
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
        showToast("error", data.message || "Error al crear volumen/número");
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

  const PIE_COLORS = ["#3ecf8e", "#6c8ebf", "#9b7fd4", "#e07b54", "#e8c55e", "#e05252"];

  const navItems = [
    { id: "overview", label: "Resumen General", icon: <LayoutDashboard size={14} /> },
    { id: "manuscripts", label: "Todos los Manuscritos", icon: <FileText size={14} />, badge: pendingCount },
    { id: "users", label: "Gestión de Usuarios", icon: <Users size={14} /> },
    { id: "analytics", label: "Analíticas", icon: <TrendingUp size={14} /> },
    { id: "revistas", label: "Revistas", icon: <BookOpen size={14} /> },
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
        : "Gestión de Revistas"
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
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, color: "#444", marginBottom: "3px" }}>
                  {kpi.label}
                </p>
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
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Nombre</label>
                        <input required type="text" value={userForm.nombre} onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Apellido</label>
                        <input required type="text" value={userForm.apellido} onChange={(e) => setUserForm({ ...userForm, apellido: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                      <input required type="email" value={userForm.correo} onChange={(e) => setUserForm({ ...userForm, correo: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Contraseña</label>
                      <input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Rol</label>
                        <select value={userForm.rol} onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                          <option value="investigador">Investigador</option>
                          <option value="editor">Editor</option>
                          <option value="revisor">Revisor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">ORCID <span className="text-gray-300 normal-case font-normal">(opcional)</span></label>
                        <input type="text" value={userForm.orcid} onChange={(e) => setUserForm({ ...userForm, orcid: e.target.value })} placeholder="0000-0000-0000-0000" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Afiliación Institucional</label>
                      <input required type="text" value={userForm.afiliacion_institucional} onChange={(e) => setUserForm({ ...userForm, afiliacion_institucional: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
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
              <BarChart data={[]} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="month" tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: "'Inter', sans-serif", fontSize: 12, borderRadius: "4px", border: "1px solid #efefef" }} />
                <Bar dataKey="submissions" name="Enviados" fill="#6c8ebf" radius={[3, 3, 0, 0]} />
                <Bar dataKey="published" name="Publicados" fill="#3ecf8e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#999", textAlign: "center", marginTop: "12px" }}>
              Los datos se mostrarán cuando haya actividad registrada
            </p>
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
              <button
                onClick={() => {
                  setNumeroRevistaId("");
                  setNumeroVolumenes([]);
                  setNumeroForm({ volumen: "", numero: "", anio: new Date().getFullYear().toString(), titulo_edicion: "", status: "futuro", fecha_publicacion: "" });
                  setShowNumeroModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer" }}
              >
                <Plus size={16} /> Nuevo Número
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
                  const volumenes = volumenesData[r.id] || [];
                  return (
                    <div key={r.id} style={{ border: "1px solid #f0f0f0", borderRadius: "6px", overflow: "hidden" }}>
                      {/* REVISTA ROW */}
                      <div
                        className="flex items-center gap-2 p-3 cursor-pointer"
                        style={{ background: "#fafafa", borderBottom: isExpanded ? "1px solid #f0f0f0" : "none" }}
                        onClick={() => toggleRevista(r.id)}
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
                            color: r.activo !== false ? "#3ecf8e" : "#e05252",
                            background: r.activo !== false ? "rgba(62,207,142,0.1)" : "rgba(224,82,82,0.1)",
                          }}
                        >
                          {r.activo !== false ? "Activo" : "Inactivo"}
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
                              const numeros = vol.numeros || [];
                              return (
                                <div key={vol.id} style={{ marginBottom: "1px" }}>
                                  <div className="flex items-center gap-2 p-2 rounded" style={{ background: "#f8f8f8" }}>
                                    <Calendar size={11} color="#888" />
                                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#444", flex: 1 }}>
                                      Volumen {vol.numero_volumen}
                                    </span>
                                    <span style={{ fontSize: "11px", color: "#ccc" }}>
                                      {numeros.length} número(s)
                                    </span>
                                    <button
                                      onClick={() => {
                                        setNumeroRevistaId(r.id);
                                        setNumeroForm({ volumen: vol.numero_volumen.toString(), numero: "", anio: new Date().getFullYear().toString(), titulo_edicion: "", status: "futuro", fecha_publicacion: "" });
                                        setShowNumeroModal(true);
                                      }}
                                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                      style={{ fontFamily: "'Inter', sans-serif", cursor: "pointer" }}
                                    >
                                      <Plus size={10} /> Número
                                    </button>
                                  </div>
                                  {numeros.length > 0 && (
                                    <div style={{ paddingLeft: "22px", paddingBottom: "4px" }}>
                                      {numeros.map((num: any) => (
                                        <div key={num.id} className="flex items-center gap-2 py-1 px-2 rounded" onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                          <FileText size={10} color="#aaa" />
                                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#555", flex: 1 }}>
                                            Nº {num.numero} — {num.anio}
                                            {num.titulo_edicion && <span style={{ color: "#999", marginLeft: "4px" }}>({num.titulo_edicion})</span>}
                                          </span>
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
            <form onSubmit={handleCreateVolumenModal} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Revista</label>
                <select required value={volumenRevistaId} onChange={(e) => setVolumenRevistaId(e.target.value ? Number(e.target.value) : "")} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                  <option value="">Seleccionar revista...</option>
                  {revistas.filter(r => r.activo !== false).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
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
            <form onSubmit={handleCreateNumeroModal} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Revista</label>
                <select required value={numeroRevistaId} onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : "";
                  setNumeroRevistaId(val);
                  setNumeroForm({ ...numeroForm, volumen: "" });
                  if (val) fetchVolumenesForNumeroModal(val);
                  else setNumeroVolumenes([]);
                }} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                  <option value="">Seleccionar revista...</option>
                  {revistas.filter(r => r.activo !== false).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Volumen</label>
                <select required value={numeroForm.volumen} onChange={(e) => setNumeroForm({ ...numeroForm, volumen: e.target.value })} disabled={!numeroRevistaId} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none", opacity: numeroRevistaId ? 1 : 0.5 }}>
                  <option value="">Seleccionar volumen...</option>
                  {numeroVolumenes.map((v: any) => <option key={v.numero_volumen} value={v.numero_volumen}>Volumen {v.numero_volumen}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Número (Issue)</label>
                <input required type="number" min="1" value={numeroForm.numero} onChange={(e) => setNumeroForm({ ...numeroForm, numero: e.target.value })} placeholder="Ej: 1" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Título de la Edición</label>
                <input required type="text" placeholder="Enero-Junio, Edición Especial" value={numeroForm.titulo_edicion} onChange={(e) => setNumeroForm({ ...numeroForm, titulo_edicion: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Año</label>
                  <input required type="number" value={numeroForm.anio} onChange={(e) => setNumeroForm({ ...numeroForm, anio: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Estado</label>
                  <select value={numeroForm.status} onChange={(e) => setNumeroForm({ ...numeroForm, status: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none" }}>
                    <option value="futuro">Futuro (Planificado)</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Fecha Publicación (Opcional)</label>
                <input type="date" value={numeroForm.fecha_publicacion} onChange={(e) => setNumeroForm({ ...numeroForm, fecha_publicacion: e.target.value })} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e8e8e8", borderRadius: "4px", outline: "none", fontFamily: "'Inter', sans-serif" }} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowNumeroModal(false); setNumeroRevistaId(""); setNumeroVolumenes([]); }} style={{ padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "4px", cursor: "pointer", background: "none" }}>Cancelar</button>
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