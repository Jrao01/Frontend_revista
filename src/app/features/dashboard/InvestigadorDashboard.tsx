import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Plus, BookOpen, ArrowLeft,
  CheckCircle, ChevronRight, ChevronDown, Clock, AlertTriangle, Download, Eye, User, Upload, X, Search
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { api, BASE_URL } from "../../api/api";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; step: number }> = {
  enviado:         { label: "Enviado",         color: "#6c8ebf", bg: "rgba(108,142,191,0.1)",  step: 1 },
  asignado:        { label: "Asignado",        color: "#9b7fd4", bg: "rgba(155,127,212,0.1)",  step: 2 },
  en_revision:     { label: "En Revisión",     color: "#9b7fd4", bg: "rgba(155,127,212,0.1)",  step: 2 },
  En_evaluacion:   { label: "En Evaluación",   color: "#9b7fd4", bg: "rgba(155,127,212,0.1)",  step: 3 },
  por_evaluar:     { label: "Por Evaluar",     color: "#e8c55e", bg: "rgba(232,197,94,0.1)",   step: 3 },
  por_corregir:    { label: "Por Corregir",    color: "#e8c55e", bg: "rgba(232,197,94,0.1)",   step: 3 },
  aprobado:        { label: "Aprobado",        color: "#3ecf8e", bg: "rgba(62,207,142,0.1)",   step: 4 },
  Corregido:       { label: "Corregido",       color: "#3ecf8e", bg: "rgba(62,207,142,0.1)",   step: 4 },
  rechazado:       { label: "Rechazado",       color: "#e05252", bg: "rgba(224,82,82,0.1)",    step: 4 },
  publicado:       { label: "Publicado",       color: "#3ecf8e", bg: "rgba(62,207,142,0.15)",  step: 5 },
};

const NORMAL_STEPS = [
  { key: "submitted", label: "Enviado" },
  { key: "assigned",  label: "Asignado" },
  { key: "review",    label: "Revisión" },
  { key: "decision",  label: "Aprobado" },
  { key: "published", label: "Publicado" },
];

const REJECTED_STEPS = [
  { key: "submitted", label: "Enviado" },
  { key: "assigned",  label: "Asignado" },
  { key: "review",    label: "Revisión" },
  { key: "rejected",   label: "Rechazado" },
];

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

function WorkflowStepper({ status }: { status: string }) {
  const isRejected = status === "rechazado";
  const steps = isRejected ? REJECTED_STEPS : NORMAL_STEPS;
  const totalSteps = steps.length;
  const currentStep = isRejected ? totalSteps : (STATUS_MAP[status] || STATUS_MAP.enviado).step;

  return (
    <div style={{ padding: "20px 0 8px" }}>
      <div className="flex items-start">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const completed = currentStep > stepNum;
          const active = currentStep === stepNum;
          return (
            <div key={step.key} className="flex items-start flex-1">
              <div className="flex flex-col items-center" style={{ flex: "0 0 auto", minWidth: 0 }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: isRejected && active ? "#e05252" : completed ? "#3ecf8e" : active ? "#0b0b0b" : "#f2f2f2",
                  border: active ? `2px solid ${isRejected ? "#e05252" : "#0b0b0b"}` : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontFamily: "'Inter', sans-serif", fontWeight: 700,
                  color: completed || active ? "#fff" : "#ccc",
                  flexShrink: 0,
                }}>
                  {completed ? "✓" : stepNum}
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "11px", marginTop: "5px",
                  color: isRejected && active ? "#e05252" : active ? "#0b0b0b" : completed ? "#3ecf8e" : "#bbb",
                  textAlign: "center", fontWeight: active ? 600 : 400,
                  maxWidth: "56px", lineHeight: 1.3,
                }}>
                  {step.label}
                </p>
              </div>
              {i < totalSteps - 1 && (
                <div style={{
                  flex: 1, height: "2px", marginTop: "14px",
                  background: isRejected && active ? "#e05252" : completed ? "#3ecf8e" : "#f0f0f0"
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FILE_LABELS: Record<string, string> = {
  manuscrito_original: "Manuscrito Original",
  manuscrito_anonimizado: "Manuscrito Anonimizado",
  ficha_autores:       "Ficha de Autores",
  material_suplementario: "Material Complementario",
};

/* ─── Detail View ─────────────────────────────────── */

function ManuscriptDetail({ articulo, onBack, onRefresh }: { articulo: any; onBack: () => void; onRefresh?: () => void }) {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [loadingEvals, setLoadingEvals] = useState(true);
  const [reUploadFiles, setReUploadFiles] = useState<{ field: string; file: File | null }[]>([]);
  const [reUploadVersion, setReUploadVersion] = useState(2);
  const [uploading, setUploading] = useState(false);
  const [openVersions, setOpenVersions] = useState<Record<number, boolean>>({});

  const toggleVersion = (v: number) => {
    setOpenVersions((prev) => ({ ...prev, [v]: !prev[v] }));
  };

  const REUPLOAD_FIELDS = [
    { field: "manuscrito_corregido", label: "Manuscrito Corregido (versión revisada)" },
  ];

  const handleReUploadFile = (field: string, file: File | null) => {
    setReUploadFiles((prev) => {
      const existing = prev.find((f) => f.field === field);
      if (existing) {
        return prev.map((f) => (f.field === field ? { ...f, file } : f));
      }
      return [...prev, { field, file }];
    });
  };

  const handleReUploadSubmit = async () => {
    const selectedFiles = reUploadFiles.filter((f) => f.file);
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("version", String(reUploadVersion));
      for (const { field, file } of selectedFiles) {
        if (file) fd.append(field, file);
      }
      await api.articulos.reUpload(articulo.id, fd);
      setReUploadFiles([]);
      setReUploadVersion(2);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchEvals = async () => {
      try {
        const data = await api.articulos.fetchMyEvaluations(articulo.id);
        setEvaluaciones(Array.isArray(data) ? data : []);
      } catch {
        setEvaluaciones([]);
      } finally {
        setLoadingEvals(false);
      }
    };
    fetchEvals();
  }, [articulo.id]);

  const archivos = articulo.archivos_articulos || [];
  const linea = articulo.lineas_investigacion || articulo.linea;
  const vol = articulo.numero_revista?.volumen?.numero_volumen;
  const num = articulo.numero_revista?.numero;
  const anio = articulo.numero_revista?.anio;

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", padding: 0 }}
      >
        <ArrowLeft size={14} /> Volver a mis manuscritos
      </button>

      {/* Header card */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "28px 32px", marginBottom: "16px" }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={articulo.status} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
              #{articulo.id}
              {linea && ` · ${linea.nombre}`}
              {vol && ` · Vol. ${vol} Nº ${num}`}
              {anio && ` (${anio})`}
            </span>
          </div>
          {articulo.doi && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#3ecf8e", flexShrink: 0 }}>
              DOI: {articulo.doi}
            </span>
          )}
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "10px" }}>
          {articulo.titulo_es}
        </h2>
        {articulo.titulo_en && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999", fontStyle: "italic", marginBottom: "10px" }}>
            {articulo.titulo_en}
          </p>
        )}

        <div className="flex flex-wrap gap-4" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>
          {articulo.fecha_recepcion && <span>Enviado: {articulo.fecha_recepcion}</span>}
          {articulo.fecha_publicacion && <span>Publicado: {articulo.fecha_publicacion}</span>}
        </div>

        {articulo.palabras_clave && (
          <div className="flex flex-wrap gap-2 mt-3">
            {articulo.palabras_clave.split(",").map((kw: string, i: number) => (
              <span key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888", background: "#f5f5f5", padding: "3px 10px", borderRadius: "3px" }}>
                {kw.trim()}
              </span>
            ))}
          </div>
        )}

        <WorkflowStepper status={articulo.status} />
      </div>

      {/* Archivos agrupados por versión (acordeón) */}
      {archivos.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
            Archivos adjuntos ({archivos.length})
          </p>
          {(() => {
            const grouped: Record<number, any[]> = {};
            archivos.forEach((a: any) => {
              const v = a.version || 1;
              if (!grouped[v]) grouped[v] = [];
              grouped[v].push(a);
            });
            const sorted = Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
            return sorted.map(([version, files]) => (
              <div key={version} style={{ marginBottom: "10px" }}>
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
                  <div className="flex flex-col gap-2">
                    {files.map((arch: any) => (
                      <div key={arch.id} className="flex items-center justify-between py-2 px-3 rounded" style={{ background: "#fafafa" }}>
                        <div className="flex items-center gap-3">
                          <FileText size={16} color="#888" />
                          <div>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333", fontWeight: 500 }}>
                              {FILE_LABELS[arch.tipo_archivo] || arch.tipo_archivo}
                            </p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>
                              {arch.es_anonimo ? "Anónimo" : ""}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`${BASE_URL}/api/descargar/${arch.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                          style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#3ecf8e", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(62,207,142,0.2)", background: "rgba(62,207,142,0.05)" }}
                        >
                          <Download size={12} /> Descargar
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      )}

      {/* Resumen */}
      {articulo.resumen_es && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            Resumen
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#444", lineHeight: 1.7 }}>
            {articulo.resumen_es}
          </p>
        </div>
      )}

      {/* Evaluaciones */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
          Evaluaciones {evaluaciones.length > 0 && `(${evaluaciones.length})`}
        </p>
        {loadingEvals ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", padding: "12px 0" }}>Cargando evaluaciones...</p>
        ) : evaluaciones.length === 0 ? (
          <div className="flex items-center gap-3 py-4">
            <Eye size={16} color="#ccc" />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
              Aún no hay evaluaciones para este artículo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {evaluaciones.map((ev: any) => {
              const veredictoColor = ev.veredicto === "aprobado" ? "#3ecf8e" : ev.veredicto === "rechazado" ? "#e05252" : ev.veredicto === "corregir" ? "#e8c55e" : "#bbb";
              const veredictoLabel = ev.veredicto === "aprobado" ? "Aprobado" : ev.veredicto === "rechazado" ? "Rechazado" : ev.veredicto === "corregir" ? "Corregir" : "Pendiente";
              return (
                <div key={ev.id} style={{ borderLeft: `3px solid ${veredictoColor}`, paddingLeft: "16px" }}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "#333" }}>
                      Revisor: {ev.revisor?.nombre} {ev.revisor?.apellido || ""}
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600,
                      color: veredictoColor, background: `${veredictoColor}18`, padding: "2px 8px", borderRadius: "8px",
                    }}>
                      {veredictoLabel}
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

      {/* Re-subida de archivos cuando está "por corregir" */}
      {articulo.status === "por_corregir" && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} color="#e8c55e" />
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b" }}>
              Corregir y Re-enviar Archivos
            </p>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", marginBottom: "20px", lineHeight: 1.6 }}>
            El editor ha solicitado correcciones. Sube los archivos corregidos con una nueva versión.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {REUPLOAD_FIELDS.map(({ field, label }) => {
              const file = reUploadFiles.find((f) => f.field === field)?.file;
              const fileName = file?.name || "";
              return (
                <label key={field} style={{
                  display: "flex", flexDirection: "column" as const, gap: "6px",
                  padding: "14px 16px", border: `2px dashed ${fileName ? "#3ecf8e" : "#e0e0e0"}`,
                  borderRadius: "6px", cursor: "pointer", background: fileName ? "rgba(62,207,142,0.04)" : "#fafafa",
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#555" }}>{label}</span>
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleReUploadFile(field, f);
                  }} />
                  {fileName ? (
                    <div className="flex items-center gap-2">
                      <FileText size={14} color="#3ecf8e" />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#3ecf8e" }}>{fileName}</span>
                      <button onClick={(e) => { e.preventDefault(); handleReUploadFile(field, null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", marginLeft: "auto" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload size={14} color="#ccc" />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>Seleccionar archivo...</span>
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#555", display: "block", marginBottom: "4px" }}>
                Versión
              </label>
              <input
                type="number" min={2} value={reUploadVersion}
                onChange={(e) => setReUploadVersion(Math.max(2, parseInt(e.target.value) || 2))}
                style={{ width: "80px", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "8px 10px", outline: "none" }}
              />
            </div>
            <button
              onClick={handleReUploadSubmit}
              disabled={uploading || reUploadFiles.filter((f) => f.file).length === 0}
              style={{
                marginTop: "18px", background: uploading || reUploadFiles.filter((f) => f.file).length === 0 ? "#999" : "#0b0b0b",
                border: "none", borderRadius: "4px", padding: "10px 22px",
                fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, color: "#fff",
                cursor: uploading || reUploadFiles.filter((f) => f.file).length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Subiendo..." : "Subir archivos corregidos"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── List Item ────────────────────────────────────── */

function ManuscriptListItem({ articulo, onClick }: { articulo: any; onClick: () => void }) {
  const st = STATUS_MAP[articulo.status] || { label: articulo.status, color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
  const needsAction = ["por_corregir", "por_evaluar"].includes(articulo.status);
  const linea = articulo.lineas_investigacion || articulo.linea;
  const vol = articulo.numero_revista?.volumen?.numero_volumen;
  const num = articulo.numero_revista?.numero;
  const archivos = articulo.archivos_articulos || [];

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      style={{
        width: "100%", background: "#fff", border: "1px solid #efefef",
        borderRadius: "8px", padding: "0", cursor: "pointer", textAlign: "left",
        overflow: "hidden", display: "block",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = "#efefef";
      }}
    >
      <div style={{ height: "3px", background: st.color, opacity: 0.7 }} />
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={articulo.status} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#ccc" }}>#{articulo.id}</span>
              {linea && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#bbb" }}>· {linea.nombre}</span>}
              {vol && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#bbb" }}>· Vol. {vol} Nº {num}</span>}
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600,
              color: "#0b0b0b", lineHeight: 1.35, marginBottom: "8px",
              overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {articulo.titulo_es}
            </h3>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#ccc" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>
                  Enviado {articulo.fecha_recepcion || "—"}
                </span>
              </div>
              {archivos.length > 0 && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                  {archivos.length} archivo{archivos.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {needsAction && (
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                <AlertTriangle size={12} color="#e8c55e" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#c8962a" }}>
                  Requiere tu atención
                </span>
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0, paddingTop: "2px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={15} color="#aaa" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Overview ─────────────────────────────────────── */

function Overview({ articulos, onSelect }: { articulos: any[]; onSelect: (id: number) => void }) {
  const statusCounts = articulos.reduce((acc: Record<string, number>, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total enviados", value: articulos.length, color: "#6c8ebf" },
    { label: "En revisión", value: (statusCounts.en_revision || 0) + (statusCounts.En_evaluacion || 0) + (statusCounts.asignado || 0) + (statusCounts.por_evaluar || 0), color: "#9b7fd4" },
    { label: "Requieren acción", value: statusCounts.por_corregir || 0, color: "#e8c55e" },
    { label: "Publicados", value: (statusCounts.publicado || 0) + (statusCounts.aprobado || 0), color: "#3ecf8e" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: "6px" }}>
              {s.value}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "14px" }}>
        Tus envíos recientes
      </p>

      <div className="flex flex-col gap-3">
        {articulos.slice(0, 4).map((a: any) => (
          <ManuscriptListItem key={a.id} articulo={a} onClick={() => onSelect(a.id)} />
        ))}
        {articulos.length > 4 && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", paddingTop: "4px" }}>
            +{articulos.length - 4} más en "Mis Manuscritos"
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────── */

export function InvestigadorDashboard() {
  const [section, setSection] = useState("overview");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { user } = useAuth();
  const [articulos, setArticulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [statusFilter, setStatusFilter] = useState("");
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const fetchArticulos = async () => {
    try {
      const data = await api.articulos.fetchMyManuscripts();
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

  const needsAction = articulos.filter((a) => ["por_corregir", "por_evaluar"].includes(a.status)).length;
  const selectedArticulo = selectedId ? articulos.find((a) => a.id === selectedId) || null : null;

  const handleSelect = (id: number) => {
    setSelectedId(id);
    if (section !== "manuscripts") setSection("manuscripts");
  };

  const handleBack = () => setSelectedId(null);

  const handleSectionChange = (s: string) => {
    setSection(s);
    setSelectedId(null);
    if (s === "profile") fetchPerfil();
  };

  const navItems = [
    { id: "overview", label: "Resumen", icon: <BookOpen size={14} /> },
    { id: "manuscripts", label: "Mis Manuscritos", icon: <FileText size={14} />, badge: needsAction },
    { id: "submit", label: "Nuevo Envío", icon: <Plus size={14} /> },
    { id: "profile", label: "Mi Perfil", icon: <User size={14} /> },
  ];

  let headerTitle = "Panel del Investigador";
  let headerSubtitle: string | undefined = `Bienvenido, ${user?.name?.split(" ")[0]}`;
  if (section === "manuscripts") {
    headerTitle = selectedArticulo ? "Detalle del manuscrito" : "Mis Manuscritos";
    headerSubtitle = selectedArticulo ? undefined : `${articulos.length} envío${articulos.length !== 1 ? "s" : ""}`;
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
      onSectionChange={handleSectionChange}
      title={headerTitle}
      subtitle={headerSubtitle}
    >
      <AnimatePresence mode="wait">
        {/* OVERVIEW */}
        {section === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {loading ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb", textAlign: "center", padding: "60px 0" }}>Cargando...</p>
            ) : (
              <Overview articulos={articulos} onSelect={handleSelect} />
            )}
          </motion.div>
        )}

        {/* MANUSCRIPTS — LIST */}
        {section === "manuscripts" && !selectedArticulo && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {loading ? (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb", textAlign: "center", padding: "60px 0" }}>Cargando...</p>
            ) : articulos.length === 0 ? (
              <div className="text-center py-20">
                <FileText size={32} color="#e0e0e0" className="mx-auto mb-4" />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "18px", color: "#ccc", marginBottom: "16px" }}>
                  Aún no has enviado ningún manuscrito.
                </p>
                <button
                  onClick={() => setSection("submit")}
                  className="px-5 py-2.5 rounded inline-flex items-center gap-2"
                  style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "15px", border: "none", cursor: "pointer" }}
                >
                  <Plus size={13} /> Enviar primer manuscrito
                </button>
              </div>
            ) : (
              <>
                {/* Search + Status Filter */}
                <div style={{ marginBottom: "16px" }}>
                  <div className="flex items-center gap-2 p-3 rounded mb-2" style={{ background: "#fff", border: "1px solid #efefef" }}>
                    <Search size={16} color="#ccc" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por título, palabras clave..."
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
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "4px",
                      fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none", background: "#fff",
                    }}
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(STATUS_MAP).map(([key, v]) => (
                      <option key={key} value={key}>{v.label}</option>
                    ))}
                  </select>
                </div>
                {(() => {
                  const q = searchQuery.toLowerCase().trim();
                  let filtered = q
                    ? articulos.filter((a: any) =>
                        (a.titulo_es || "").toLowerCase().includes(q)
                        || (a.palabras_clave || "").toLowerCase().includes(q)
                        || (a.resumen_es || "").toLowerCase().includes(q)
                      )
                    : articulos;
                  if (statusFilter) filtered = filtered.filter((a: any) => a.status === statusFilter);
                  const totalP = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                  return (
                    <>
                      <div className="flex flex-col gap-3">
                        {paginated.length === 0 ? (
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", padding: "40px" }}>
                            {searchQuery ? "No se encontraron resultados." : "No hay manuscritos que mostrar."}
                          </p>
                        ) : (
                          paginated.map((a: any, i: number) => (
                            <motion.div
                              key={a.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, delay: i * 0.05 }}
                            >
                              <ManuscriptListItem articulo={a} onClick={() => setSelectedId(a.id)} />
                            </motion.div>
                          ))
                        )}
                      </div>
                      {totalP > 1 && (
                        <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid #f0f0f0" }}>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#999" }}>
                            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
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
                              onClick={() => setCurrentPage(p => Math.min(totalP, p + 1))}
                              disabled={currentPage === totalP}
                              style={{
                                padding: "6px 14px", borderRadius: "4px", border: "1px solid #e0e0e0",
                                background: currentPage === totalP ? "#fafafa" : "#fff",
                                color: currentPage === totalP ? "#ccc" : "#333",
                                cursor: currentPage === totalP ? "not-allowed" : "pointer",
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
              </>
            )}
          </motion.div>
        )}

        {/* MANUSCRIPTS — DETAIL */}
        {section === "manuscripts" && selectedArticulo && (
          <ManuscriptDetail key={`detail-${selectedArticulo.id}`} articulo={selectedArticulo} onBack={handleBack} onRefresh={fetchArticulos} />
        )}

        {/* SUBMIT */}
        {section === "submit" && (
          <motion.div key="submit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "32px" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "8px" }}>
                Enviar nuevo manuscrito
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888", marginBottom: "24px", lineHeight: 1.6 }}>
                Usa el formulario de envío para subir tu trabajo. Una vez recibido, un editor lo revisará y lo asignará al flujo de revisión por pares.
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
                {/* Avatar + Name */}
                <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "32px", marginBottom: "16px" }}>
                  <div className="flex items-center gap-5 mb-6">
                    <div style={{
                      width: "72px", height: "72px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #3ecf8e 0%, #0b0b0b 100%)",
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

                {/* CV Download / Upload */}
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

                {/* Artículos del usuario */}
                {perfil.articulos_principales && perfil.articulos_principales.length > 0 && (
                  <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
                      Mis artículos ({perfil.articulos_principales.length})
                    </p>
                    <div className="flex flex-col gap-3">
                      {perfil.articulos_principales.map((art: any) => {
                        const st = STATUS_MAP[art.status] || { label: art.status, color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
                        return (
                          <div key={art.id} className="flex items-center justify-between py-3 px-4 rounded" style={{ background: "#fafafa" }}>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={art.status} />
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333" }}>{art.titulo_es}</span>
                            </div>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>
                              {art.fecha_recepcion || "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
