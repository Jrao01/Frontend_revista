import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch, ArrowLeft, ChevronRight, ChevronDown,
  Clock, AlertTriangle, CheckCircle, Download, X, UserPlus, Upload, Plus, Search, User
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { api, BASE_URL } from "../../api/api";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  enviado:         { label: "Enviado",         color: "#6c8ebf", bg: "rgba(108,142,191,0.1)" },
  asignado:        { label: "Asignado",        color: "#9b7fd4", bg: "rgba(155,127,212,0.1)" },
  en_revision:     { label: "En Revisión",     color: "#9b7fd4", bg: "rgba(155,127,212,0.1)" },
  En_evaluacion:   { label: "En Evaluación",   color: "#9b7fd4", bg: "rgba(155,127,212,0.1)" },
  por_evaluar:     { label: "Por Evaluar",     color: "#e8c55e", bg: "rgba(232,197,94,0.1)" },
  por_corregir:    { label: "Por Corregir",    color: "#e8c55e", bg: "rgba(232,197,94,0.1)" },
  aprobado:        { label: "Aprobado",        color: "#3ecf8e", bg: "rgba(62,207,142,0.1)" },
  Corregido:       { label: "Corregido",       color: "#3ecf8e", bg: "rgba(62,207,142,0.1)" },
  rechazado:       { label: "Rechazado",       color: "#e05252", bg: "rgba(224,82,82,0.1)" },
  publicado:       { label: "Publicado",       color: "#3ecf8e", bg: "rgba(62,207,142,0.15)" },
};

const FILE_LABELS: Record<string, string> = {
  manuscrito_original: "Manuscrito Original",
  manuscrito_anonimizado: "Manuscrito Anonimizado",
  ficha_autores:       "Ficha de Autores",
  material_suplementario: "Material Complementario",
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_MAP[status] || { label: status, color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
  return (
    <span style={{
      fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600,
      color: c.color, background: c.bg, border: `1px solid ${c.color}30`,
      padding: "3px 10px", borderRadius: "12px", letterSpacing: "0.07em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}

/* ─── List Item ────────────────────────────────────── */

function formatAuthorsEd(a: any): string {
  const principal = a.autor_principal;
  const coautores = a.autores_secundarios
    ? a.autores_secundarios.map((as: any) => {
        const u = as.usuario || as.Usuario;
        return u ? `${u.nombre} ${u.apellido}` : "";
      }).filter(Boolean)
    : [];
  const allAuthors = [
    principal ? `${principal.nombre} ${principal.apellido}` : `Autor #${a.autor_principal_id}`,
    ...coautores
  ].filter(Boolean);
  return allAuthors.join(", ");
}

function ArticleListItem({ articulo, onClick }: { articulo: any; onClick: () => void }) {
  const st = STATUS_MAP[articulo.status] || { label: articulo.status, color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
  const isNew = articulo.status === "enviado";
  const linea = articulo.lineas_investigacion || articulo.linea;
  const evCount = articulo.evaluaciones?.length || 0;

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      style={{
        width: "100%", background: "#fff",
        border: `1px solid ${isNew ? "#6c8ebf30" : "#efefef"}`,
        borderRadius: "8px", padding: "0", cursor: "pointer", textAlign: "left",
        overflow: "hidden", display: "block",
        boxShadow: isNew ? "0 2px 12px rgba(108,142,191,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)";
        (e.currentTarget as HTMLElement).style.borderColor = "#d8d8d8";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = isNew ? "0 2px 12px rgba(108,142,191,0.08)" : "0 1px 3px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = isNew ? "#6c8ebf30" : "#efefef";
      }}
    >
      <div style={{ height: "3px", background: st.color, opacity: 0.6 }} />
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <StatusBadge status={articulo.status} />
              {isNew && (
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700,
                  color: "#fff", background: "#6c8ebf", padding: "2px 7px",
                  borderRadius: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  NUEVO
                </span>
              )}
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#bbb" }}>
                #{articulo.id} {linea ? `· ${linea.nombre}` : ""}
              </span>
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600,
              color: "#0b0b0b", lineHeight: 1.35, marginBottom: "10px",
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {articulo.titulo_es}
            </h3>

            <div className="flex items-center gap-4 flex-wrap">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>
                {formatAuthorsEd(articulo)}
              </span>
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#ccc" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                  {articulo.fecha_recepcion || "—"}
                </span>
              </div>
              {evCount > 0 && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                  {evCount} evaluación{evCount > 1 ? "es" : ""}
                </span>
              )}
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={15} color="#aaa" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Detail View ─────────────────────────────────── */

/* ─── Modal overlay ────────────────────────────────── */

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.4)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "10px", padding: "32px",
        maxWidth: "520px", width: "100%", position: "relative",
        fontFamily: "'Inter', sans-serif",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ─── Detail View ─────────────────────────────────── */

function ArticleDetail({ articulo, onBack, onRefresh }: { articulo: any; onBack: () => void; onRefresh: () => void }) {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAnonymizeModal, setShowAnonymizeModal] = useState(false);
  const [rejectForm, setRejectForm] = useState({ observaciones_editor: "", observaciones_autor: "" });
  const [rejecting, setRejecting] = useState(false);
  const [revisores, setRevisores] = useState<any[]>([]);
  const [revisoresSearch, setRevisoresSearch] = useState("");
  const [selectedRevisores, setSelectedRevisores] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [anonymizeFile, setAnonymizeFile] = useState<File | null>(null);
  const [anonymizing, setAnonymizing] = useState(false);
  const [openVersions, setOpenVersions] = useState<Record<number, boolean>>({});

  const toggleVersion = (v: number) => {
    setOpenVersions((prev) => ({ ...prev, [v]: !prev[v] }));
  };

  useEffect(() => {
    const fetchEvals = async () => {
      try {
        const data = await api.evaluaciones?.fetchByArticulo(articulo.id);
        setEvaluaciones(Array.isArray(data) ? data : []);
      } catch {
        setEvaluaciones([]);
      } finally {
        setLoadingEvals(false);
      }
    };
    fetchEvals();
  }, [articulo.id]);

  useEffect(() => {
    if (showAssignModal) {
      api.usuarios.fetchAll().then((users) => {
        setRevisores(Array.isArray(users) ? users.filter((u: any) => u.rol === "revisor") : []);
      }).catch(() => setRevisores([]));
    }
  }, [showAssignModal]);

  const handleReject = async () => {
    setRejecting(true);
    try {
      await api.articulos.rechazar(articulo.id, rejectForm);
      setShowRejectModal(false);
      setRejectForm({ observaciones_editor: "", observaciones_autor: "" });
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRejecting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.editor.cambiarStatus(articulo.id, status);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignReviewers = async () => {
    if (selectedRevisores.length === 0) return;
    setAssigning(true);
    try {
      await fetch(`${BASE_URL}/api/editor/${articulo.id}/asignar-jurados`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ juradosIds: selectedRevisores }),
      });
      setShowAssignModal(false);
      setSelectedRevisores([]);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleAnonymize = async () => {
    if (!anonymizeFile) return;
    setAnonymizing(true);
    try {
      const fd = new FormData();
      fd.append("manuscrito_anonimo", anonymizeFile);
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/api/editor/${articulo.id}/anonimizar`, {
        method: "PUT", body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text);
      }
      setShowAnonymizeModal(false);
      setAnonymizeFile(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAnonymizing(false);
    }
  };

  const handleReasignReviewers = async () => {
    if (!confirm("¿Re-enviar este artículo a los revisores para una nueva ronda de evaluación?")) return;
    try {
      const resp = await fetch(`${BASE_URL}/api/editor/${articulo.id}/re-asignar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleRevisor = (id: number) => {
    setSelectedRevisores((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const archivos = articulo.archivos_articulos || [];
  const autor = articulo.autor_principal;
  const linea = articulo.lineas_investigacion || articulo.linea;
  const vol = articulo.numero_revista?.volumen?.numero_volumen;
  const num = articulo.numero_revista?.numero;

  const hasAnonymizedFile = archivos.some((a: any) => a.tipo_archivo === "manuscrito_anonimizado");
  const hasEvaluaciones = (articulo.evaluaciones?.length || 0) > 0;
  const canAcceptToReview = articulo.status === "enviado";
  const canAssignReviewers = ["en_revision", "En_evaluacion", "por_evaluar"].includes(articulo.status) && !hasEvaluaciones;
  const canReject = !["rechazado", "publicado", "aprobado"].includes(articulo.status) && !hasEvaluaciones;
  const canApprove = articulo.status === "Corregido";
  const canRequestCorrections = articulo.status === "Corregido";
  const canAnonymize = articulo.status === "enviado" && !hasAnonymizedFile;
  const canReasign = articulo.status === "Corregido" && hasEvaluaciones;

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.22 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", padding: 0 }}
      >
        <ArrowLeft size={14} /> Volver a la lista
      </button>

      {/* Header */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "28px 32px", marginBottom: "16px" }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={articulo.status} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
              #{articulo.id} {linea ? `· ${linea.nombre}` : ""} {vol ? `· Vol. ${vol} Nº ${num}` : ""}
            </span>
          </div>
          {articulo.doi && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#3ecf8e" }}>
              DOI: {articulo.doi}
            </span>
          )}
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "12px" }}>
          {articulo.titulo_es}
        </h2>
        {articulo.titulo_en && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999", fontStyle: "italic", marginBottom: "10px" }}>
            {articulo.titulo_en}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mb-4">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Autor(es):</strong> {formatAuthorsEd(articulo)}
          </span>
          {autor?.afiliacion_institucional && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>
              <strong style={{ color: "#555" }}>Institución:</strong> {autor.afiliacion_institucional}
            </span>
          )}
          {articulo.fecha_recepcion && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>
              <strong style={{ color: "#555" }}>Enviado:</strong> {articulo.fecha_recepcion}
            </span>
          )}
        </div>

        {/* Resumen */}
        {articulo.resumen_es && (
          <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Resumen</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555", lineHeight: 1.7 }}>{articulo.resumen_es}</p>
            {articulo.palabras_clave && (
              <div className="flex flex-wrap gap-2 mt-3">
                {articulo.palabras_clave.split(",").map((kw: string, i: number) => (
                  <span key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888", background: "#efefef", padding: "2px 8px", borderRadius: "3px" }}>
                    {kw.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Archivos agrupados por versión (acordeón) */}
        <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px", padding: "16px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
            Archivos ({archivos.length})
          </p>
          {archivos.length > 0 ? (
            (() => {
              const grouped: Record<number, any[]> = {};
              archivos.forEach((a: any) => {
                const v = a.version || 1;
                if (!grouped[v]) grouped[v] = [];
                grouped[v].push(a);
              });
              const sorted = Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
              return sorted.map(([version, files]) => (
                <div key={version} style={{ marginBottom: "8px" }}>
                  <button
                    onClick={() => toggleVersion(Number(version))}
                    className="flex items-center justify-between w-full"
                    style={{
                      background: "none", border: "none", cursor: "pointer", padding: "8px 0",
                      fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, color: "#444",
                    }}
                  >
                    <span>Versión {version} ({files.length} archivo{files.length !== 1 ? "s" : ""})</span>
                    {(openVersions[Number(version)] ?? true)
                      ? <ChevronDown size={16} color="#999" />
                      : <ChevronRight size={16} color="#999" />
                    }
                  </button>
                  {(openVersions[Number(version)] ?? true) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {files.map((arch: any) => (
                        <a
                          key={arch.id}
                          href={`${BASE_URL}/api/descargar/${arch.id}`}
                          className="flex items-center justify-between p-3 rounded bg-white border border-neutral-100 hover:border-black transition"
                          style={{ textDecoration: "none", color: "#333", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                        >
                          <span className="font-semibold text-neutral-700">{FILE_LABELS[arch.tipo_archivo] || arch.tipo_archivo}</span>
                          <Download size={14} className="text-neutral-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ));
            })()
          ) : (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#ccc", fontStyle: "italic" }}>
              Sin archivos adjuntos
            </p>
          )}
        </div>
      </div>

      {/* Acciones del editor */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
          Acciones del Editor
        </p>
        <div className="flex flex-wrap gap-3">
          {canAcceptToReview && (
            <button onClick={() => handleStatusChange("en_revision")} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
              <CheckCircle size={14} /> Aceptar y pasar a Revisión
            </button>
          )}
          {canAnonymize && (
            <button onClick={() => setShowAnonymizeModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#6c8ebf", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
              <Upload size={14} /> Subir Manuscrito Anonimizado
            </button>
          )}
          {canAssignReviewers && (
            <button onClick={() => setShowAssignModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#9b7fd4", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
              <UserPlus size={14} /> Asignar Revisor(es)
            </button>
          )}
          {canApprove && (
            <button onClick={() => handleStatusChange("aprobado")} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#3ecf8e", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
              <CheckCircle size={14} /> Aprobar
            </button>
          )}
          {canRequestCorrections && (
            <button onClick={() => handleStatusChange("por_corregir")} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#e8c55e", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
              <AlertTriangle size={14} /> Solicitar más correcciones
            </button>
          )}
          {canReasign && (
            <button onClick={handleReasignReviewers} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#9b7fd4", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
              <UserPlus size={14} /> Re-enviar a Revisión
            </button>
          )}
          {!canAcceptToReview && !canAssignReviewers && !canApprove && !canRequestCorrections && !canReasign && !canReject && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", fontStyle: "italic", padding: "4px 0" }}>
              No hay acciones disponibles para el estado actual ({articulo.status}).
            </p>
          )}
          {canReject && (
            <button onClick={() => setShowRejectModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#e05252", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: "pointer" }}>
              <X size={14} /> Rechazar
            </button>
          )}
        </div>
      </div>

      {/* Evaluaciones */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
          Evaluaciones {evaluaciones.length > 0 && `(${evaluaciones.length})`}
        </p>
        {loadingEvals ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", padding: "12px 0" }}>Cargando evaluaciones...</p>
        ) : evaluaciones.length === 0 ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#ccc", fontStyle: "italic" }}>
            Sin evaluaciones registradas.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {evaluaciones.map((ev: any) => {
              const vColor = ev.veredicto === "aprobado" ? "#3ecf8e" : ev.veredicto === "rechazado" ? "#e05252" : ev.veredicto === "corregir" ? "#e8c55e" : "#bbb";
              const vLabel = ev.veredicto === "aprobado" ? "Aprobado" : ev.veredicto === "rechazado" ? "Rechazado" : ev.veredicto === "corregir" ? "Corregir" : "Pendiente";
              return (
                <div key={ev.id} style={{ borderLeft: `3px solid ${vColor}`, paddingLeft: "16px" }}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "#333" }}>
                      {ev.revisor ? `Revisor: ${ev.revisor.nombre} ${ev.revisor.apellido || ""}` : "Editor"}
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600,
                      color: vColor, background: `${vColor}18`, padding: "2px 8px", borderRadius: "8px",
                    }}>
                      {vLabel}
                    </span>
                    {ev.fecha_evaluacion && (
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>
                        {new Date(ev.fecha_evaluacion).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  {ev.observaciones_editor && (
                    <div style={{ marginBottom: "6px" }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#999", marginBottom: "2px" }}>Observaciones del editor:</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#555", lineHeight: 1.6 }}>{ev.observaciones_editor}</p>
                    </div>
                  )}
                  {ev.observaciones_autor && (
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#999", marginBottom: "2px" }}>Observaciones para el autor:</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#555", lineHeight: 1.6 }}>{ev.observaciones_autor}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Rechazar */}
      {showRejectModal && (
        <Modal onClose={() => { setShowRejectModal(false); setRejectForm({ observaciones_editor: "", observaciones_autor: "" }); }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>Rechazar Artículo</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", marginBottom: "20px" }}>
            Este artículo será rechazado y se creará un registro en evaluaciones.
          </p>
          <div className="mb-4">
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
              Comentario interno (editor)
            </label>
            <textarea
              value={rejectForm.observaciones_editor}
              onChange={(e) => setRejectForm((p) => ({ ...p, observaciones_editor: e.target.value }))}
              style={{ width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "10px 12px", minHeight: "80px", resize: "vertical", outline: "none" }}
              placeholder="Notas internas para el equipo editorial..."
            />
          </div>
          <div className="mb-6">
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
              Comentario para el autor
            </label>
            <textarea
              value={rejectForm.observaciones_autor}
              onChange={(e) => setRejectForm((p) => ({ ...p, observaciones_autor: e.target.value }))}
              style={{ width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "10px 12px", minHeight: "80px", resize: "vertical", outline: "none" }}
              placeholder="Explica al autor por qué fue rechazado..."
            />
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => { setShowRejectModal(false); setRejectForm({ observaciones_editor: "", observaciones_autor: "" }); }} style={{ background: "transparent", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "8px 18px", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={handleReject} disabled={rejecting} style={{ background: rejecting ? "#999" : "#e05252", border: "none", borderRadius: "4px", padding: "8px 18px", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#fff", cursor: rejecting ? "not-allowed" : "pointer" }}>
              {rejecting ? "Rechazando..." : "Rechazar Artículo"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Subir Manuscrito Anonimizado */}
      {showAnonymizeModal && (
        <Modal onClose={() => { setShowAnonymizeModal(false); setAnonymizeFile(null); }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>Subir Manuscrito Anonimizado</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", marginBottom: "20px" }}>
            Sube una versión anonimizada (sin nombres de autores) del manuscrito para la revisión a doble ciego.
          </p>
          <label style={{
            display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "8px",
            padding: "24px", border: `2px dashed ${anonymizeFile ? "#3ecf8e" : "#e0e0e0"}`,
            borderRadius: "6px", cursor: "pointer", background: anonymizeFile ? "rgba(62,207,142,0.04)" : "#fafafa",
            marginBottom: "20px",
          }}>
            <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => {
              setAnonymizeFile(e.target.files?.[0] || null);
            }} />
            {anonymizeFile ? (
              <div className="flex items-center gap-2">
                <CheckCircle size={18} color="#3ecf8e" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#3ecf8e", fontWeight: 500 }}>
                  {anonymizeFile.name}
                </span>
              </div>
            ) : (
              <>
                <Upload size={24} color="#aaa" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#666" }}>
                  Selecciona el archivo PDF o DOCX
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>
                  Máximo 25MB
                </span>
              </>
            )}
          </label>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => { setShowAnonymizeModal(false); setAnonymizeFile(null); }} style={{ background: "transparent", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "8px 18px", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={handleAnonymize} disabled={anonymizing || !anonymizeFile} style={{ background: anonymizing || !anonymizeFile ? "#999" : "#6c8ebf", border: "none", borderRadius: "4px", padding: "8px 18px", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#fff", cursor: anonymizing || !anonymizeFile ? "not-allowed" : "pointer" }}>
              {anonymizing ? "Subiendo..." : "Subir y activar revisión"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Asignar Revisores */}
      {showAssignModal && (
        <Modal onClose={() => { setShowAssignModal(false); setSelectedRevisores([]); setRevisoresSearch(""); }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>Asignar Revisor(es)</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", marginBottom: "16px" }}>
            Busca y selecciona uno o más revisores.
          </p>

          <input
            type="text" value={revisoresSearch}
            onChange={(e) => setRevisoresSearch(e.target.value)}
            placeholder="Buscar revisor por nombre..."
            style={{ width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "10px 12px", outline: "none", marginBottom: "12px", boxSizing: "border-box" }}
          />

          {revisores.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", padding: "20px 0", textAlign: "center" }}>
              No hay usuarios con rol de revisor disponibles.
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-6" style={{ maxHeight: "260px", overflow: "auto" }}>
              {revisores.filter((rev: any) => {
                const q = revisoresSearch.toLowerCase();
                if (!q) return true;
                return (rev.nombre + " " + rev.apellido).toLowerCase().includes(q) || (rev.correo || "").toLowerCase().includes(q);
              }).map((rev: any) => {
                const isSelected = selectedRevisores.includes(rev.id);
                return (
                  <label key={rev.id} className="flex items-center gap-3 p-3 rounded cursor-pointer" style={{ background: isSelected ? "rgba(155,127,212,0.08)" : "#fafafa", border: `1px solid ${isSelected ? "#9b7fd4" : "#efefef"}` }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleRevisor(rev.id)} />
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#333" }}>
                        {rev.nombre} {rev.apellido}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>
                        {rev.correo}
                      </p>
                    </div>
                  </label>
                );
              })}
              {revisores.filter((rev: any) => {
                const q = revisoresSearch.toLowerCase();
                if (!q) return true;
                return (rev.nombre + " " + rev.apellido).toLowerCase().includes(q) || (rev.correo || "").toLowerCase().includes(q);
              }).length === 0 && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "12px 0" }}>
                  Sin resultados para "{revisoresSearch}"
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => { setShowAssignModal(false); setSelectedRevisores([]); setRevisoresSearch(""); }} style={{ background: "transparent", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "8px 18px", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={handleAssignReviewers} disabled={assigning || selectedRevisores.length === 0} style={{ background: assigning || selectedRevisores.length === 0 ? "#999" : "#9b7fd4", border: "none", borderRadius: "4px", padding: "8px 18px", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#fff", cursor: assigning || selectedRevisores.length === 0 ? "not-allowed" : "pointer" }}>
              {assigning ? "Asignando..." : `Asignar (${selectedRevisores.length})`}
            </button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}

/* ─── Filter Tabs ──────────────────────────────────── */

const FILTER_TABS = [
  { id: "all",         label: "Todos",              statuses: [] as string[] },
  { id: "inbox",       label: "Bandeja de entrada", statuses: ["enviado"] },
  { id: "in_progress", label: "En progreso",        statuses: ["asignado", "en_revision", "En_evaluacion", "por_evaluar", "por_corregir"] },
  { id: "completed",   label: "Completados",        statuses: ["aprobado", "rechazado", "publicado"] },
];

/* ─── Main ─────────────────────────────────────────── */

export function EditorDashboard() {
  const [section, setSection] = useState("manuscripts");
  const [filterTab, setFilterTab] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { user } = useAuth();
  const [articulos, setArticulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [perfil, setPerfil] = useState<any>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const fetchArticulos = async () => {
    try {
      const data = await api.articulos.fetchAll();
      setArticulos(Array.isArray(data) ? data : []);
    } catch {
      setArticulos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticulos(); }, []);

  const fetchPerfil = async () => {
    if (perfil) return;
    setLoadingPerfil(true);
    try {
      const data = await api.usuarios.fetchMyProfile();
      setPerfil(data);
    } catch {
      setPerfil(null);
    } finally {
      setLoadingPerfil(false);
    }
  };

  const inboxCount = articulos.filter((a) => a.status === "enviado").length;
  const inProgressCount = articulos.filter((a) =>
    ["asignado", "en_revision", "En_evaluacion", "por_evaluar", "por_corregir"].includes(a.status)
  ).length;

  const navItems = [
    { id: "manuscripts", label: "Manuscritos", icon: <GitBranch size={14} />, badge: inboxCount },
    { id: "submit", label: "Nuevo Envío", icon: <Plus size={14} /> },
    { id: "profile", label: "Mi Perfil", icon: <User size={14} /> },
  ];

  const filteredArticulos = articulos.filter((a) => {
    const tab = FILTER_TABS.find((t) => t.id === filterTab);
    if (!tab || tab.statuses.length === 0) return true;
    return tab.statuses.includes(a.status);
  });

  const q = searchQuery.toLowerCase().trim();
  const searchedArticulos = q
    ? filteredArticulos.filter((a: any) => {
        const autor = formatAuthorsEd(a);
        return (a.titulo_es || "").toLowerCase().includes(q)
          || autor.toLowerCase().includes(q)
          || (a.palabras_clave || "").toLowerCase().includes(q);
      })
    : filteredArticulos;

  const totalPages = Math.ceil(searchedArticulos.length / ITEMS_PER_PAGE);
  const paginatedArticulos = searchedArticulos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const selectedArticulo = selectedId ? articulos.find((a) => a.id === selectedId) || null : null;

  const stats = [
    { label: "Bandeja entrada", value: inboxCount, color: "#6c8ebf" },
    { label: "En progreso", value: inProgressCount, color: "#9b7fd4" },
    { label: "Total", value: articulos.length, color: "#0b0b0b" },
  ];

  let headerTitle = "Panel del Editor";
  let headerSubtitle: string | undefined = `Bienvenido, ${user?.name?.split(" ")[0]}`;
  if (section === "manuscripts") {
    headerTitle = selectedArticulo ? "Gestión del artículo" : "Manuscritos";
    headerSubtitle = selectedArticulo ? undefined : `${articulos.length} artículos en total`;
  } else if (section === "submit") {
    headerTitle = "Nuevo Envío";
    headerSubtitle = undefined;
  } else if (section === "profile") {
    headerTitle = "Mi Perfil";
    headerSubtitle = undefined;
  }

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={section}
      onSectionChange={(s) => { setSection(s); setSelectedId(null); if (s === "profile") fetchPerfil(); }}
      title={headerTitle}
      subtitle={headerSubtitle}
    >
      <AnimatePresence mode="wait">
        {/* MANUSCRIPTS — LIST */}
        {section === "manuscripts" && !selectedArticulo && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {stats.map((s) => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "18px" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {FILTER_TABS.map((tab) => {
                const count = tab.statuses.length
                  ? articulos.filter((a) => tab.statuses.includes(a.status)).length
                  : articulos.length;
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id)}
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "14px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "#666",
                      background: isActive ? "#0b0b0b" : "transparent",
                      border: `1px solid ${isActive ? "#0b0b0b" : "#e0e0e0"}`,
                      borderRadius: "20px", padding: "5px 14px", cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ marginBottom: "16px" }}>
              <div className="flex items-center gap-2 p-3 rounded" style={{ background: "#fff", border: "1px solid #efefef" }}>
                <Search size={16} color="#ccc" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título, autor, palabras clave..."
                  style={{
                    flex: 1, border: "none", outline: "none",
                    fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333",
                    background: "transparent",
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            {loading ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb", textAlign: "center", padding: "60px 0" }}>Cargando artículos...</p>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {paginatedArticulos.length === 0 ? (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#ccc", textAlign: "center", paddingTop: "40px" }}>
                      No hay artículos en esta categoría.
                    </p>
                  ) : (
                    paginatedArticulos.map((a: any, i: number) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.16, delay: i * 0.04 }}
                      >
                        <ArticleListItem articulo={a} onClick={() => setSelectedId(a.id)} />
                      </motion.div>
                    ))
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid #f0f0f0" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#999" }}>
                      {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, searchedArticulos.length)} de {searchedArticulos.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: "6px 14px", borderRadius: "4px", border: "1px solid #e0e0e0",
                          background: currentPage === 1 ? "#fafafa" : "#fff",
                          color: currentPage === 1 ? "#ccc" : "#333",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          fontFamily: "'Inter', sans-serif", fontSize: "13px",
                        }}
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "6px 14px", borderRadius: "4px", border: "1px solid #e0e0e0",
                          background: currentPage === totalPages ? "#fafafa" : "#fff",
                          color: currentPage === totalPages ? "#ccc" : "#333",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          fontFamily: "'Inter', sans-serif", fontSize: "13px",
                        }}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* SUBMIT */}
        {section === "submit" && (
          <motion.div key="submit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
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
          </motion.div>
        )}

        {/* PROFILE */}
        {section === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {loadingPerfil ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb", textAlign: "center", padding: "60px 0" }}>Cargando perfil...</p>
            ) : !perfil ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb", textAlign: "center", padding: "60px 0" }}>No se pudo cargar el perfil.</p>
            ) : (
              <div>
                <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "32px", marginBottom: "16px" }}>
                  <div className="flex items-center gap-5 mb-6">
                    <div style={{
                      width: "72px", height: "72px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #6c8ebf 0%, #0b0b0b 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#fff" }}>
                        {(perfil.nombre || "?")[0]}{(perfil.apellido || "")[0]}
                      </span>
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>
                        {perfil.nombre} {perfil.segundo_nombre || ""} {perfil.apellido} {perfil.segundo_apellido || ""}
                      </h2>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
                        {perfil.afiliacion_institucional}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "Correo electrónico", value: perfil.correo },
                      { label: "Cédula", value: perfil.cedula || "No registrada" },
                      { label: "ONCTI", value: perfil.oncti || "No registrado" },
                      { label: "Rol", value: perfil.rol?.charAt(0).toUpperCase() + (perfil.rol?.slice(1) || "") },
                      { label: "Afiliación institucional", value: perfil.afiliacion_institucional },
                      { label: "Miembro desde", value: perfil.created_at ? new Date(perfil.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                    ].map((field) => (
                      <div key={field.label}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                          {field.label}
                        </p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333" }}>
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
                    Curriculum Vitae
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {perfil.cv && (
                      <a
                        href={`${BASE_URL}/${perfil.cv}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded"
                        style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, textDecoration: "none" }}
                      >
                        <Download size={15} /> Descargar CV
                      </a>
                    )}
                    <label className="inline-flex items-center gap-2 px-5 py-3 rounded cursor-pointer" style={{ background: perfil.cv ? "#f0f0f0" : "#0b0b0b", color: perfil.cv ? "#333" : "#fff", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500 }}>
                      <Upload size={15} /> {perfil.cv ? "Actualizar CV" : "Subir CV"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setCvFile(file);
                        }}
                      />
                    </label>
                    {cvFile && (
                      <>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888" }}>{cvFile.name}</span>
                        <button
                          onClick={async () => {
                            setCvUploading(true);
                            try {
                              const fd = new FormData();
                              fd.append("cv", cvFile);
                              await api.usuarios.uploadCv(fd);
                              setCvFile(null);
                              const data = await api.usuarios.fetchMyProfile();
                              setPerfil(data);
                            } catch (e) { console.error(e); }
                            finally { setCvUploading(false); }
                          }}
                          disabled={cvUploading}
                          className="px-4 py-2 rounded text-sm"
                          style={{ background: "#3ecf8e", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                        >
                          {cvUploading ? "Subiendo..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => setCvFile(null)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                  {!perfil.cv && !cvFile && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb", marginTop: "8px" }}>
                      Formatos aceptados: PDF, DOC, DOCX
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* MANUSCRIPTS — DETAIL */}
        {section === "manuscripts" && selectedArticulo && (
          <ArticleDetail
            key={`detail-${selectedArticulo.id}`}
            articulo={selectedArticulo}
            onBack={() => setSelectedId(null)}
            onRefresh={fetchArticulos}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
