import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Plus, BookOpen, ArrowLeft, MessageSquare,
  Send, CheckCircle, ChevronRight, Clock, AlertTriangle,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type Manuscript, type ManuscriptStatus, STATUS_CONFIG } from "../../data/manuscripts";
import { StatusBadge } from "./components/StatusBadge";
import { WorkflowStepper } from "./components/WorkflowStepper";

/* ─── List Item ────────────────────────────────────── */

function ManuscriptListItem({
  manuscript,
  onClick,
}: {
  manuscript: Manuscript;
  onClick: () => void;
}) {
  const conf = STATUS_CONFIG[manuscript.status];
  const needsAction =
    manuscript.status === "major_revision" || manuscript.status === "minor_revision";
  const publicComments = manuscript.comments.filter((c) => !c.isPrivate).length;
  const lastUpdate = manuscript.timeline[manuscript.timeline.length - 1];

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
      <div style={{ height: "3px", background: conf.color, opacity: 0.7 }} />

      <div className="px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-start justify-between gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
              <StatusBadge status={manuscript.status} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#ccc" }}>
                {manuscript.id.toUpperCase()} · {manuscript.category}
              </span>
            </div>

            <h3
              style={{
                fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 600,
                color: "#0b0b0b", lineHeight: 1.35, letterSpacing: "-0.01em",
                marginBottom: "8px", overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}
            >
              {manuscript.title}
            </h3>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#ccc" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa" }}>
                  {manuscript.submittedDate}
                </span>
              </div>
              {manuscript.wordCount && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>
                  {manuscript.wordCount.toLocaleString()} palabras
                </span>
              )}
              {publicComments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare size={11} color="#bbb" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>
                    {publicComments}
                  </span>
                </div>
              )}
            </div>

            {needsAction && (
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                <AlertTriangle size={12} color="#e8c55e" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#c8962a" }}>
                  {manuscript.status === "major_revision" ? "Revisión mayor pendiente" : "Revisión menor pendiente"}
                </span>
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChevronRight size={14} color="#aaa" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Detail View ─────────────────────────────────── */

function ManuscriptDetail({
  manuscript,
  onBack,
}: {
  manuscript: Manuscript;
  onBack: () => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);
  const { addComment } = useManuscripts();
  const { user } = useAuth();

  const publicComments = manuscript.comments.filter((c) => !c.isPrivate);
  const needsRevision =
    manuscript.status === "major_revision" || manuscript.status === "minor_revision";

  const handleReply = () => {
    if (!replyText.trim() || !user) return;
    addComment(manuscript.id, {
      author: user.name,
      role: "investigador",
      content: replyText,
      date: new Date().toISOString().split("T")[0],
    });
    setReplyText("");
    setReplySent(true);
    setTimeout(() => setReplySent(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-5"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", padding: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        <ArrowLeft size={14} /> Volver a mis manuscritos
      </button>

      {/* Header */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={manuscript.status} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>
              {manuscript.id.toUpperCase()} · {manuscript.category} · {manuscript.type}
            </span>
          </div>
          {manuscript.doi && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#3ecf8e" }}>
              {manuscript.doi}
            </span>
          )}
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: "10px" }}>
          {manuscript.title}
        </h2>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: "Autores", value: [manuscript.submittedByName, ...manuscript.coauthors].join(", ") },
            { label: "Institución", value: manuscript.institution },
            { label: "Enviado", value: manuscript.submittedDate },
            manuscript.wordCount ? { label: "Extensión", value: `${manuscript.wordCount.toLocaleString()} palabras` } : null,
          ].filter(Boolean).map((item) => (
            <span key={item!.label} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>
              <strong style={{ color: "#555" }}>{item!.label}:</strong> {item!.value}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {manuscript.keywords.map((kw) => (
            <span key={kw} style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#888", background: "#f5f5f5", padding: "3px 10px", borderRadius: "3px" }}>
              {kw}
            </span>
          ))}
        </div>

        <WorkflowStepper manuscript={manuscript} />
      </div>

      {/* Alerts */}
      {needsRevision && (
        <div style={{ background: "rgba(232,197,94,0.08)", border: "1px solid rgba(232,197,94,0.35)", borderRadius: "8px", padding: "14px 18px", marginBottom: "14px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <AlertTriangle size={15} color="#e8c55e" style={{ flexShrink: 0, marginTop: "2px" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#8a7020", lineHeight: 1.5 }}>
            <strong>{manuscript.status === "major_revision" ? "Revisión mayor requerida." : "Revisión menor requerida."}</strong> Revisa los comentarios del equipo editorial y responde punto por punto.
          </p>
        </div>
      )}

      {manuscript.status === "published" && manuscript.articleSlug && (
        <div style={{ background: "rgba(62,207,142,0.07)", border: "1px solid rgba(62,207,142,0.25)", borderRadius: "8px", padding: "14px 18px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={15} color="#3ecf8e" />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#2a7a55", flex: 1 }}>
            Artículo publicado · <strong>{manuscript.doi}</strong>
          </p>
          <Link to={`/articulo/${manuscript.articleSlug}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#3ecf8e", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            Ver →
          </Link>
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "18px" }}>
          Historial del proceso
        </p>
        {manuscript.timeline.map((entry, i) => {
          const isLast = i === manuscript.timeline.length - 1;
          return (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: "18px" }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: isLast ? STATUS_CONFIG[entry.status].color : "#ddd",
                  border: isLast ? `2px solid ${STATUS_CONFIG[entry.status].color}` : "2px solid #ddd",
                  marginTop: "4px", flexShrink: 0,
                  boxShadow: isLast ? `0 0 0 4px ${STATUS_CONFIG[entry.status].color}18` : "none",
                }} />
                {!isLast && <div style={{ width: "1px", flex: 1, background: "#f0f0f0", minHeight: "24px" }} />}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : "18px", flex: 1 }}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={entry.status} size="sm" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa" }}>{entry.date} · {entry.actor}</span>
                </div>
                {entry.note && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#666", lineHeight: 1.6, marginTop: "3px" }}>{entry.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comments */}
      {publicComments.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "18px" }}>
            Comentarios del equipo editorial
          </p>
          <div className="flex flex-col gap-4">
            {publicComments.map((comment) => {
              const accentColor = comment.role === "editor" ? "#6c8ebf" : comment.role === "investigador" ? "#3ecf8e" : "#9b7fd4";
              return (
                <div key={comment.id} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: "14px" }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#333" }}>{comment.author}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb" }}>
                      {comment.role === "editor" ? "Editor" : comment.role === "investigador" ? "Autor" : "Revisor"} · {comment.date}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#444", lineHeight: 1.7 }}>{comment.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reply box */}
      {needsRevision && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
            Responder a los revisores
          </p>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta detallada punto por punto a cada comentario del revisor..."
            style={{
              width: "100%", minHeight: "110px", padding: "12px 14px",
              border: "1px solid #e8e8e8", borderRadius: "6px",
              fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#333",
              outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0b0b0b")}
            onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded"
              style={{
                background: replyText.trim() ? "#0b0b0b" : "#f0f0f0",
                color: replyText.trim() ? "#fff" : "#ccc",
                fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500,
                border: "none", cursor: replyText.trim() ? "pointer" : "not-allowed", transition: "all 0.2s",
              }}
            >
              <Send size={13} /> Enviar respuesta
            </button>
            {replySent && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#3ecf8e" }}
              >
                ✓ Enviado al editor
              </motion.span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Overview ─────────────────────────────────────── */

function Overview({
  manuscripts,
  onSelectManuscript,
}: {
  manuscripts: Manuscript[];
  onSelectManuscript: (id: string) => void;
}) {
  const statusCounts = manuscripts.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: "Total enviados", value: manuscripts.length, color: "#6c8ebf" },
    { label: "En revisión", value: (statusCounts.editor_review || 0) + (statusCounts.peer_review || 0), color: "#9b7fd4" },
    { label: "Acción requerida", value: (statusCounts.major_revision || 0) + (statusCounts.minor_revision || 0), color: "#e8c55e" },
    { label: "Publicados", value: (statusCounts.published || 0) + (statusCounts.accepted || 0), color: "#3ecf8e" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "16px 18px" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: "4px" }}>
              {s.value}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#888" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "12px" }}>
        Envíos recientes
      </p>
      <div className="flex flex-col gap-3">
        {manuscripts.slice(0, 4).map((m) => (
          <ManuscriptListItem key={m.id} manuscript={m} onClick={() => onSelectManuscript(m.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────── */

export function InvestigadorDashboard() {
  const [section, setSection] = useState("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();
  const { getByEmail, getManuscript } = useManuscripts();

  const myManuscripts = user ? getByEmail(user.email) : [];
  const needsAction = myManuscripts.filter(
    (m) => m.status === "major_revision" || m.status === "minor_revision"
  ).length;

  const selectedManuscript = selectedId ? getManuscript(selectedId) : null;

  const navItems = [
    { id: "overview", label: "Resumen", icon: <BookOpen size={14} /> },
    { id: "manuscripts", label: "Mis Manuscritos", icon: <FileText size={14} />, badge: needsAction },
    { id: "submit", label: "Nuevo Envío", icon: <Plus size={14} /> },
  ];

  const handleSectionChange = (s: string) => {
    setSection(s);
    setSelectedId(null);
  };

  const handleSelectManuscript = (id: string) => {
    setSelectedId(id);
    if (section !== "manuscripts") setSection("manuscripts");
  };

  const getTitle = () => {
    if (section === "manuscripts") return selectedManuscript ? "Detalle del manuscrito" : "Mis Manuscritos";
    if (section === "submit") return "Nuevo Envío";
    return "Panel del Investigador";
  };

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={section}
      onSectionChange={handleSectionChange}
      title={getTitle()}
      subtitle={
        section === "overview" ? `Bienvenido, ${user?.name?.split(" ")[0]}` :
        section === "manuscripts" && !selectedManuscript ? `${myManuscripts.length} manuscrito${myManuscripts.length !== 1 ? "s" : ""}` :
        undefined
      }
    >
      <AnimatePresence mode="wait">
        {section === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <Overview manuscripts={myManuscripts} onSelectManuscript={handleSelectManuscript} />
          </motion.div>
        )}

        {section === "manuscripts" && !selectedManuscript && (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {myManuscripts.length === 0 ? (
              <div className="text-center py-16">
                <FileText size={28} color="#e0e0e0" className="mx-auto mb-3" />
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", fontStyle: "italic", color: "#ccc", marginBottom: "16px" }}>
                  Aún no has enviado ningún manuscrito.
                </p>
                <button
                  onClick={() => setSection("submit")}
                  className="px-5 py-2.5 rounded inline-flex items-center gap-2"
                  style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "13px", border: "none", cursor: "pointer" }}
                >
                  <Plus size={13} /> Enviar primero
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myManuscripts.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, delay: i * 0.05 }}>
                    <ManuscriptListItem manuscript={m} onClick={() => setSelectedId(m.id)} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {section === "manuscripts" && selectedManuscript && (
          <ManuscriptDetail key={`detail-${selectedManuscript.id}`} manuscript={selectedManuscript} onBack={() => setSelectedId(null)} />
        )}

        {section === "submit" && (
          <motion.div key="submit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 28px" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", marginBottom: "8px" }}>
                Enviar nuevo manuscrito
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", marginBottom: "20px", lineHeight: 1.6 }}>
                Usa el formulario completo de envío para subir tu trabajo.
              </p>
              <Link to="/publicar" className="inline-flex items-center gap-2 px-5 py-3 rounded" style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                <Plus size={14} /> Ir al formulario
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
