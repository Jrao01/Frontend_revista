import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, CheckCircle, ArrowLeft, Star, ChevronRight, Clock } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type Manuscript, STATUS_CONFIG } from "../../data/manuscripts";
import { StatusBadge } from "./components/StatusBadge";

/* ─── Star Rating ──────────────────────────────────── */

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => !readonly && onChange?.(n)}
          style={{ background: "none", border: "none", cursor: readonly ? "default" : "pointer", padding: "1px" }}
        >
          <Star size={15} color={n <= value ? "#e8c55e" : "#e0e0e0"} fill={n <= value ? "#e8c55e" : "none"} />
        </button>
      ))}
    </div>
  );
}

const REVIEW_CRITERIA = [
  { id: "originality", label: "Originalidad y Contribución" },
  { id: "methodology", label: "Rigor Metodológico" },
  { id: "clarity", label: "Claridad y Escritura" },
  { id: "relevance", label: "Relevancia Científica" },
  { id: "references", label: "Referencias y Bibliografía" },
];

type Recommendation = "accept" | "minor_revision" | "major_revision" | "reject";

const REC_OPTIONS: { value: Recommendation; label: string; color: string }[] = [
  { value: "accept", label: "Aceptar sin cambios", color: "#3ecf8e" },
  { value: "minor_revision", label: "Revisión menor", color: "#f0a14e" },
  { value: "major_revision", label: "Revisión mayor", color: "#e8c55e" },
  { value: "reject", label: "Rechazar", color: "#e05252" },
];

/* ─── List Item ────────────────────────────────────── */

function AssignedListItem({ manuscript, juradoEmail, onClick }: { manuscript: Manuscript; juradoEmail: string; onClick: () => void }) {
  const jurado = manuscript.assignedJurados.find((j) => j.email === juradoEmail);
  const submitted = jurado?.submitted ?? false;

  return (
    <motion.button
      layout onClick={onClick} whileHover={{ y: -1 }} transition={{ duration: 0.15 }}
      style={{
        width: "100%", background: "#fff",
        border: submitted ? "1px solid rgba(62,207,142,0.2)" : "1px solid #efefef",
        borderRadius: "8px", padding: "0", cursor: "pointer", textAlign: "left",
        overflow: "hidden", display: "block", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ height: "3px", background: submitted ? "#3ecf8e" : "#9b7fd4", opacity: 0.7 }} />
      <div className="px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={manuscript.status} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 700, color: "#fff", background: submitted ? "#3ecf8e" : "#9b7fd4", padding: "2px 7px", borderRadius: "10px" }}>
                {submitted ? "✓ ENVIADO" : "PENDIENTE"}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.35, marginBottom: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {manuscript.title}
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#888" }}>{manuscript.submittedByName}</span>
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#ccc" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>{manuscript.submittedDate}</span>
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: submitted ? "rgba(62,207,142,0.1)" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {submitted ? <CheckCircle size={14} color="#3ecf8e" /> : <ChevronRight size={14} color="#aaa" />}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Review Detail ────────────────────────────────── */

function ReviewDetail({ manuscript, juradoEmail, onBack }: { manuscript: Manuscript; juradoEmail: string; onBack: () => void }) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | "">("");
  const [authorComments, setAuthorComments] = useState("");
  const [confidentialNote, setConfidentialNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { addComment, submitJuradoReview } = useManuscripts();
  const { user } = useAuth();

  const jurado = manuscript.assignedJurados.find((j) => j.email === juradoEmail);
  const alreadySubmitted = jurado?.submitted ?? false;

  const avgRating = Object.values(ratings).length > 0
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1)
    : null;

  const allRated = REVIEW_CRITERIA.every((c) => (ratings[c.id] ?? 0) > 0);
  const canSubmit = allRated && recommendation && authorComments.trim().length >= 30 && !alreadySubmitted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addComment(manuscript.id, { author: user?.name ?? "Revisor", role: "jurado", content: authorComments, date: new Date().toISOString().split("T")[0] });
    if (confidentialNote.trim()) {
      addComment(manuscript.id, { author: user?.name ?? "Revisor", role: "jurado", content: `[CONFIDENCIAL] ${confidentialNote}`, date: new Date().toISOString().split("T")[0], isPrivate: true });
    }
    submitJuradoReview(manuscript.id, juradoEmail);
    setSubmitted(true);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-5"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", padding: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        <ArrowLeft size={14} /> Volver a mis asignaciones
      </button>

      {(alreadySubmitted || submitted) && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-lg mb-5" style={{ background: "rgba(62,207,142,0.07)", border: "1px solid rgba(62,207,142,0.25)" }}>
          <CheckCircle size={18} color="#3ecf8e" />
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#2a7a55" }}>Revisión enviada correctamente</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5a9a75" }}>Tu evaluación ha sido recibida por el editor.</p>
          </div>
        </motion.div>
      )}

      {/* Manuscript header */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <StatusBadge status={manuscript.status} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>{manuscript.category} · {manuscript.type}</span>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "10px" }}>
          {manuscript.title}
        </h2>
        <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px", padding: "14px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Resumen</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#555", lineHeight: 1.7 }}>{manuscript.abstract}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {manuscript.keywords.map((kw) => (
              <span key={kw} style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#888", background: "#efefef", padding: "2px 8px", borderRadius: "3px" }}>{kw}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Criteria */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Criterios de evaluación
          </p>
          {avgRating && (
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>Promedio:</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b" }}>
                {avgRating}<span style={{ fontSize: "12px", color: "#bbb" }}>/5</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {REVIEW_CRITERIA.map((crit) => (
            <div key={crit.id}>
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#444" }}>{crit.label}</span>
                <div className="flex items-center gap-2">
                  <StarRating value={ratings[crit.id] ?? 0} onChange={(v) => setRatings((p) => ({ ...p, [crit.id]: v }))} readonly={alreadySubmitted || submitted} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa", width: "28px" }}>{ratings[crit.id] ? `${ratings[crit.id]}/5` : "—"}</span>
                </div>
              </div>
              <div style={{ height: "3px", background: "#f5f5f5", borderRadius: "2px", overflow: "hidden" }}>
                <motion.div animate={{ width: `${((ratings[crit.id] ?? 0) / 5) * 100}%` }} transition={{ duration: 0.3 }} style={{ height: "100%", background: "#e8c55e", borderRadius: "2px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {!alreadySubmitted && !submitted && (
        <>
          {/* Recommendation */}
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
              Recomendación
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REC_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRecommendation(opt.value)}
                  style={{
                    padding: "12px 14px", borderRadius: "8px",
                    border: `2px solid ${recommendation === opt.value ? opt.color : "#efefef"}`,
                    background: recommendation === opt.value ? `${opt.color}10` : "#fafafa",
                    cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "13px",
                    fontWeight: recommendation === opt.value ? 600 : 400,
                    color: recommendation === opt.value ? opt.color : "#666",
                    textAlign: "left", transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
              Comentarios
            </p>
            <div className="mb-4">
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                Para los autores <span style={{ color: "#e05252" }}>*</span>
              </label>
              <textarea
                value={authorComments}
                onChange={(e) => setAuthorComments(e.target.value)}
                placeholder="Retroalimentación constructiva y detallada para los autores..."
                style={{ width: "100%", minHeight: "120px", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#333", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "#9b7fd4")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
              />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: authorComments.length >= 30 ? "#3ecf8e" : "#bbb", marginTop: "4px" }}>
                {authorComments.length} caracteres (mínimo 30)
              </p>
            </div>
            <div>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#555", display: "block", marginBottom: "6px" }}>
                Nota confidencial al editor <span style={{ color: "#aaa" }}>(opcional)</span>
              </label>
              <textarea
                value={confidentialNote}
                onChange={(e) => setConfidentialNote(e.target.value)}
                placeholder="Información no compartida con los autores..."
                style={{ width: "100%", minHeight: "70px", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#333", outline: "none", resize: "vertical", background: "#fafafa", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 rounded-lg flex items-center justify-center gap-2"
            style={{ background: canSubmit ? "#9b7fd4" : "#f0f0f0", color: canSubmit ? "#fff" : "#ccc", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, border: "none", cursor: canSubmit ? "pointer" : "not-allowed", transition: "background 0.2s" }}
          >
            <CheckCircle size={16} />
            Enviar evaluación al editor
          </button>
          {!canSubmit && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb", textAlign: "center", marginTop: "8px" }}>
              Completa todos los criterios, elige una recomendación y escribe al menos 30 caracteres.
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

/* ─── Main ─────────────────────────────────────────── */

export function JuradoDashboard() {
  const [section, setSection] = useState("assigned");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();
  const { getAssignedToJurado } = useManuscripts();

  const assigned = user ? getAssignedToJurado(user.email) : [];
  const pending = assigned.filter((m) => !m.assignedJurados.find((j) => j.email === user?.email)?.submitted);
  const completed = assigned.filter((m) => m.assignedJurados.find((j) => j.email === user?.email)?.submitted);

  const selectedManuscript = selectedId ? assigned.find((m) => m.id === selectedId) : null;

  const navItems = [
    { id: "assigned", label: "Por Revisar", icon: <ClipboardList size={14} />, badge: pending.length },
    { id: "completed", label: "Completadas", icon: <CheckCircle size={14} /> },
  ];

  const handleSectionChange = (s: string) => { setSection(s); setSelectedId(null); };
  const currentList = section === "assigned" ? pending : completed;

  return (
    <DashboardLayout
      navItems={navItems} activeSection={section} onSectionChange={handleSectionChange}
      title={selectedManuscript ? "Evaluación" : section === "assigned" ? "Por Revisar" : "Completadas"}
      subtitle={selectedManuscript ? undefined : `Bienvenido, ${user?.name?.split(" ")[0]}`}
    >
      <AnimatePresence mode="wait">
        {!selectedManuscript && (
          <motion.div key={`list-${section}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Asignados", value: assigned.length, color: "#9b7fd4" },
                { label: "Pendientes", value: pending.length, color: "#e8c55e" },
                { label: "Completados", value: completed.length, color: "#3ecf8e" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "16px" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#888" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {currentList.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle size={28} color="#e0e0e0" className="mx-auto mb-3" />
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", fontStyle: "italic", color: "#ccc" }}>
                  {section === "assigned" ? "¡Al día! No hay revisiones pendientes." : "Aún no completaste ninguna revisión."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {currentList.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: i * 0.05 }}>
                    <AssignedListItem manuscript={m} juradoEmail={user?.email ?? ""} onClick={() => setSelectedId(m.id)} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedManuscript && (
          <ReviewDetail
            key={`detail-${selectedManuscript.id}`}
            manuscript={selectedManuscript}
            juradoEmail={user?.email ?? ""}
            onBack={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
