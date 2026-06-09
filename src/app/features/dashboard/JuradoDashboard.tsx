import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, CheckCircle, ArrowLeft, Download, FileText, ChevronDown, ChevronRight, Plus, Search, User, Upload, X } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { api, BASE_URL } from "../../api/api";

function formatKeywords(palabras_clave: string): string[] {
  if (!palabras_clave) return [];
  return palabras_clave.split(",").map((k: string) => k.trim()).filter(Boolean);
}

function downloadUrl(archivoId: number): string {
  return `${BASE_URL}/api/descargar/${archivoId}`;
}

async function downloadFile(archivoId: number, filename: string) {
  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(`${BASE_URL}/api/descargar/${archivoId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || "Error al descargar");
    }
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    alert(err.message || "No se pudo descargar el archivo");
  }
}

/* ─── List Item ────────────────────────────────────── */

function AssignedListItem({
  evaluacion,
  onClick,
}: {
  evaluacion: any;
  onClick: () => void;
}) {
  const articulo = evaluacion.articulo;
  const hasVeredicto = !!evaluacion.veredicto;
  const keywords = formatKeywords(articulo.palabras_clave);

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      style={{
        width: "100%", background: "#fff",
        border: hasVeredicto ? "1px solid rgba(62,207,142,0.2)" : "1px solid #efefef",
        borderRadius: "8px", padding: "0", cursor: "pointer", textAlign: "left",
        overflow: "hidden", display: "block",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ height: "3px", background: hasVeredicto ? "#3ecf8e" : "#9b7fd4", opacity: 0.7 }} />
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {hasVeredicto ? (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff", background: "#3ecf8e", padding: "2px 7px", borderRadius: "10px", letterSpacing: "0.08em" }}>
                  COMPLETADA
                </span>
              ) : (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff", background: "#9b7fd4", padding: "2px 7px", borderRadius: "10px", letterSpacing: "0.08em" }}>
                  PENDIENTE
                </span>
              )}
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600,
              color: "#0b0b0b", lineHeight: 1.35, letterSpacing: "-0.01em", marginBottom: "10px",
            }}>
              {articulo.titulo_es}
            </h3>

            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span key={kw} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888", background: "#f5f5f5", padding: "2px 8px", borderRadius: "3px" }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: hasVeredicto ? "rgba(62,207,142,0.1)" : "#f5f5f5",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {hasVeredicto
                ? <CheckCircle size={15} color="#3ecf8e" />
                : <FileText size={15} color="#aaa" />
              }
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: hasVeredicto ? "#3ecf8e" : "#9b7fd4", fontWeight: 600 }}>
              {hasVeredicto ? "Ver" : "Evaluar"}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Review Form ──────────────────────────────────── */

const VEREDICTO_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "aprobado", label: "Aprobar", color: "#3ecf8e" },
  { value: "corregir", label: "Correcciones menores", color: "#f0a14e" },
  { value: "rechazado", label: "Rechazar", color: "#e05252" },
];

function ReviewDetail({
  evaluacion,
  onBack,
  onSubmitted,
}: {
  evaluacion: any;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const articulo = evaluacion.articulo;
  const keywords = formatKeywords(articulo.palabras_clave);
  const alreadySubmitted = !!evaluacion.veredicto;

  const [veredicto, setVeredicto] = useState(evaluacion.veredicto || "");
  const [observacionesAutor, setObservacionesAutor] = useState(evaluacion.observaciones_autor || "");
  const [observacionesEditor, setObservacionesEditor] = useState(evaluacion.observaciones_editor || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openVersions, setOpenVersions] = useState<Record<number, boolean>>({});

  const toggleVersion = (v: number) => {
    setOpenVersions((prev) => ({ ...prev, [v]: !prev[v] }));
  };

  const canSubmit = veredicto && observacionesAutor.trim().length >= 20 && !alreadySubmitted;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/api/evaluaciones/${evaluacion.id}/veredicto`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          veredicto,
          observaciones_autor: observacionesAutor,
          observaciones_editor: observacionesEditor || null,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text);
      }
      setSubmitted(true);
      onSubmitted();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888", padding: 0 }}
      >
        <ArrowLeft size={14} /> Volver a mis asignaciones
      </button>

      {(alreadySubmitted || submitted) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-5 rounded-lg mb-6"
          style={{ background: "rgba(62,207,142,0.07)", border: "1px solid rgba(62,207,142,0.25)" }}
        >
          <CheckCircle size={20} color="#3ecf8e" />
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", fontWeight: 600, color: "#2a7a55" }}>
              Evaluación enviada correctamente
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#5a9a75" }}>
              Tu evaluación ha sido recibida por el equipo editorial.
            </p>
          </div>
        </motion.div>
      )}

      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "28px 32px", marginBottom: "16px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "12px" }}>
          {articulo.titulo_es}
        </h2>
        {articulo.resumen_es && (
          <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
              Resumen
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#555", lineHeight: 1.7 }}>
              {articulo.resumen_es}
            </p>
          </div>
        )}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span key={kw} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", background: "#efefef", padding: "2px 8px", borderRadius: "3px" }}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Archivos anonimizados agrupados por versión (acordeón) */}
      {articulo.archivos_articulos?.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "16px 24px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
            Manuscritos Anonimizados
          </p>
          {(() => {
            const anonFiles = articulo.archivos_articulos.filter((a: any) => a.tipo_archivo === "manuscrito_anonimizado");
            const grouped: Record<number, any[]> = {};
            anonFiles.forEach((a: any) => {
              const v = a.version || 1;
              if (!grouped[v]) grouped[v] = [];
              grouped[v].push(a);
            });
            const sorted = Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
            return sorted.map(([version, files]) => (
              <div key={version} style={{ marginBottom: "6px" }}>
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
                      <button
                        key={arch.id}
                        onClick={() => downloadFile(arch.id, `${arch.tipo_archivo}-v${arch.version}.txt`)}
                        className="flex items-center justify-between p-3 rounded w-full text-left"
                        style={{
                          background: "#fafafa", border: "1px solid #f0f0f0",
                          cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333",
                        }}
                      >
                        <span className="font-semibold text-neutral-700">
                          {arch.es_anonimo ? "Manuscrito Anonimizado" : "Manuscrito"}
                        </span>
                        <Download size={14} color="#6c8ebf" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      )}

      {!alreadySubmitted && !submitted && (
        <>
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
              Veredicto
            </p>
            <div className="grid grid-cols-3 gap-3">
              {VEREDICTO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVeredicto(opt.value)}
                  style={{
                    padding: "14px 16px", borderRadius: "8px",
                    border: `2px solid ${veredicto === opt.value ? opt.color : "#efefef"}`,
                    background: veredicto === opt.value ? `${opt.color}10` : "#fafafa",
                    cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "15px",
                    fontWeight: veredicto === opt.value ? 600 : 400,
                    color: veredicto === opt.value ? opt.color : "#666",
                    textAlign: "center", transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
            <div className="mb-5">
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                Observaciones para el autor <span style={{ color: "#e05252" }}>*</span>
              </label>
              <textarea
                value={observacionesAutor}
                onChange={(e) => setObservacionesAutor(e.target.value)}
                placeholder="Retroalimentación constructiva para los autores..."
                style={{
                  width: "100%", minHeight: "120px", padding: "12px 14px",
                  border: "1px solid #e8e8e8", borderRadius: "6px",
                  fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333",
                  outline: "none", resize: "vertical", lineHeight: 1.7,
                  boxSizing: "border-box",
                }}
              />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: observacionesAutor.length >= 20 ? "#3ecf8e" : "#bbb", marginTop: "4px" }}>
                {observacionesAutor.length} caracteres (mínimo 20)
              </p>
            </div>

            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                Nota confidencial al editor <span style={{ color: "#aaa" }}>(opcional)</span>
              </label>
              <textarea
                value={observacionesEditor}
                onChange={(e) => setObservacionesEditor(e.target.value)}
                placeholder="Información no compartida con los autores..."
                style={{
                  width: "100%", minHeight: "80px", padding: "12px 14px",
                  border: "1px solid #e8e8e8", borderRadius: "6px",
                  fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333",
                  outline: "none", resize: "vertical", lineHeight: 1.7,
                  background: "#fafafa", boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-4 rounded-lg flex items-center justify-center gap-2"
            style={{
              background: canSubmit && !submitting ? "#9b7fd4" : "#f0f0f0",
              color: canSubmit && !submitting ? "#fff" : "#ccc",
              fontFamily: "'Inter', sans-serif", fontSize: "17px", fontWeight: 600,
              border: "none", cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
            }}
          >
            <CheckCircle size={16} />
            {submitting ? "Enviando..." : "Enviar evaluación al editor"}
          </button>
          {!canSubmit && !submitting && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb", textAlign: "center", marginTop: "8px" }}>
              Elige un veredicto y escribe al menos 20 caracteres.
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

/* ─── Main ─────────────────────────────────────────── */

export function JuradoDashboard() {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("assigned");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [perfil, setPerfil] = useState<any>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const fetchEvaluaciones = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await api.evaluaciones.fetchByRevisor(user.id);
      setEvaluaciones(Array.isArray(data) ? data : []);
    } catch {
      setEvaluaciones([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvaluaciones();
  }, [fetchEvaluaciones]);

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

  const pending = evaluaciones.filter((e: any) => !e.veredicto);
  const completed = evaluaciones.filter((e: any) => !!e.veredicto);
  const selectedEval = selectedId ? evaluaciones.find((e: any) => e.id === selectedId) : null;

  const navItems = [
    { id: "assigned", label: "Por Evaluar", icon: <ClipboardList size={14} />, badge: pending.length },
    { id: "completed", label: "Completadas", icon: <CheckCircle size={14} /> },
    { id: "submit", label: "Nuevo Envío", icon: <Plus size={14} /> },
    { id: "profile", label: "Mi Perfil", icon: <User size={14} /> },
  ];

  const handleSectionChange = (s: string) => {
    setSection(s);
    setSelectedId(null);
    if (s === "profile") fetchPerfil();
  };

  const currentList = section === "assigned" ? pending : completed;

  const searchFiltered = currentList.filter((e: any) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const art = e.articulo;
    return (art.titulo_es || "").toLowerCase().includes(q)
      || (art.palabras_clave || "").toLowerCase().includes(q);
  });
  const totalPages = Math.ceil(searchFiltered.length / ITEMS_PER_PAGE);
  const paginatedList = searchFiltered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  let headerTitle = section === "assigned" ? "Artículos por Evaluar" : section === "completed" ? "Evaluaciones Completadas" : section === "profile" ? "Mi Perfil" : "Nuevo Envío";
  if (selectedEval) headerTitle = "Evaluación del artículo";

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={section}
      onSectionChange={handleSectionChange}
      title={headerTitle}
      subtitle={selectedEval ? undefined : `Bienvenido, ${user?.name?.split(" ")[0]}`}
    >
      <AnimatePresence mode="wait">
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

        {!selectedEval && section !== "submit" && section !== "profile" && (
          <motion.div
            key={`list-${section}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search */}
            <div style={{ marginBottom: "16px" }}>
              <div className="flex items-center gap-2 p-3 rounded" style={{ background: "#fff", border: "1px solid #efefef" }}>
                <Search size={16} color="#ccc" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={section === "assigned" ? "Buscar en pendientes por título o palabras clave..." : "Buscar en completadas..."}
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

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Asignados", value: evaluaciones.length, color: "#9b7fd4" },
                { label: "Pendientes", value: pending.length, color: "#e8c55e" },
                { label: "Completados", value: completed.length, color: "#3ecf8e" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: "4px" }}>
                    {s.value}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#bbb" }}>Cargando...</p>
              </div>
            ) : searchFiltered.length === 0 ? (
              <div className="text-center py-20">
                <CheckCircle size={32} color="#e0e0e0" className="mx-auto mb-4" />
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", fontStyle: "italic", color: "#ccc" }}>
                  {searchQuery
                    ? "No se encontraron resultados con ese filtro."
                    : section === "assigned"
                      ? "No tienes artículos pendientes por evaluar."
                      : "Aún no has completado ninguna evaluación."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {paginatedList.map((e: any, i: number) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, delay: i * 0.05 }}
                    >
                      <AssignedListItem
                        evaluacion={e}
                        onClick={() => setSelectedId(e.id)}
                      />
                    </motion.div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid #f0f0f0" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#999" }}>
                      {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, searchFiltered.length)} de {searchFiltered.length}
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

        {selectedEval && (
          <ReviewDetail
            key={`detail-${selectedEval.id}`}
            evaluacion={selectedEval}
            onBack={() => setSelectedId(null)}
            onSubmitted={fetchEvaluaciones}
          />
        )}

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
                      background: "linear-gradient(135deg, #9b7fd4 0%, #0b0b0b 100%)",
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
                      <a href={`${BASE_URL}/${perfil.cv}`} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-5 py-3 rounded"
                         style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, textDecoration: "none" }}>
                        <Download size={15} /> Descargar CV
                      </a>
                    )}
                    <label className="inline-flex items-center gap-2 px-5 py-3 rounded cursor-pointer" style={{ background: perfil.cv ? "#f0f0f0" : "#0b0b0b", color: perfil.cv ? "#333" : "#fff", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500 }}>
                      <Upload size={15} /> {perfil.cv ? "Actualizar CV" : "Subir CV"}
                      <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) setCvFile(file); }} />
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
                        <button onClick={() => setCvFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
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
      </AnimatePresence>
    </DashboardLayout>
  );
}