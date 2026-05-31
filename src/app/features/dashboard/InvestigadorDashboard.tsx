import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Plus, BookOpen, ArrowLeft, MessageSquare,
  Send, CheckCircle, ChevronRight, Clock, AlertTriangle
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type Manuscript, type ManuscriptStatus, STATUS_CONFIG, WORKFLOW_STEPS } from "../../data/manuscripts";

/* ─── Helpers ─────────────────────────────────────── */

function StatusBadge({ status }: { status: ManuscriptStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{
      fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600,
      color: c.color, background: c.bg, border: `1px solid ${c.color}30`,
      padding: "3px 10px", borderRadius: "12px", letterSpacing: "0.07em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}

function WorkflowStepper({ manuscript }: { manuscript: Manuscript }) {
  const currentStep = STATUS_CONFIG[manuscript.status].step;
  const isRejected = manuscript.status === "rejected";

  return (
    <div style={{ padding: "24px 0 8px" }}>
      <div className="flex items-start">
        {WORKFLOW_STEPS.map((step, i) => {
          const stepNum = i + 1;
          const completed = currentStep > stepNum;
          const active = currentStep === stepNum;
          const rejected = isRejected && stepNum >= currentStep;

          return (
            <div key={step.key} className="flex items-start flex-1">
              {/* Node + label */}
              <div className="flex flex-col items-center" style={{ flex: "0 0 auto", minWidth: 0 }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: rejected ? "rgba(224,82,82,0.08)"
                    : completed ? "#3ecf8e"
                    : active ? "#0b0b0b"
                    : "#f2f2f2",
                  border: active ? "2px solid #0b0b0b" : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", fontFamily: "'Inter', sans-serif", fontWeight: 700,
                  color: completed ? "#fff" : active ? "#fff" : "#ccc",
                  flexShrink: 0,
                  transition: "all 0.35s ease",
                }}>
                  {completed ? "✓" : stepNum}
                </div>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "12px", marginTop: "6px",
                  color: active ? "#0b0b0b" : completed ? "#3ecf8e" : "#bbb",
                  textAlign: "center", fontWeight: active ? 600 : 400,
                  maxWidth: "60px", lineHeight: 1.3,
                }}>
                  {step.label}
                </p>
              </div>
              {/* Connector */}
              {i < WORKFLOW_STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: "2px", marginTop: "16px",
                  background: completed ? "#3ecf8e" : "#f0f0f0",
                  transition: "background 0.35s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
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
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6"
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Inter', sans-serif", fontSize: "16px",
          color: "#888", padding: 0, transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        <ArrowLeft size={14} /> Volver a mis manuscritos
      </button>

      {/* Header card */}
      <div style={{
        background: "#fff", border: "1px solid #efefef", borderRadius: "8px",
        padding: "28px 32px", marginBottom: "16px",
      }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={manuscript.status} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
              {manuscript.id.toUpperCase()} · {manuscript.category} · {manuscript.type}
            </span>
          </div>
          {manuscript.doi && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#3ecf8e", flexShrink: 0 }}>
              DOI: {manuscript.doi}
            </span>
          )}
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600,
          color: "#0b0b0b", lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: "10px",
        }}>
          {manuscript.title}
        </h2>

        <div className="flex flex-wrap gap-4">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Autores:</strong> {[manuscript.submittedByName, ...manuscript.coauthors].join(", ")}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Institución:</strong> {manuscript.institution}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Enviado:</strong> {manuscript.submittedDate}
          </span>
          {manuscript.wordCount && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
              <strong style={{ color: "#555" }}>Extensión:</strong> {manuscript.wordCount.toLocaleString()} palabras · {manuscript.pages} páginas
            </span>
          )}
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mt-4">
          {manuscript.keywords.map((kw) => (
            <span key={kw} style={{
              fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888",
              background: "#f5f5f5", padding: "3px 10px", borderRadius: "3px",
            }}>
              {kw}
            </span>
          ))}
        </div>

        {/* Workflow stepper */}
        <WorkflowStepper manuscript={manuscript} />
      </div>

      {/* Revision alert */}
      {needsRevision && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(232,197,94,0.08)", border: "1px solid rgba(232,197,94,0.35)",
            borderRadius: "8px", padding: "16px 20px", marginBottom: "16px",
            display: "flex", alignItems: "flex-start", gap: "12px",
          }}
        >
          <AlertTriangle size={16} color="#e8c55e" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 600, color: "#8a7020", marginBottom: "3px" }}>
              {manuscript.status === "major_revision" ? "Revisión mayor requerida" : "Revisión menor requerida"}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#a08830", lineHeight: 1.5 }}>
              El equipo editorial ha solicitado cambios en tu manuscrito. Revisa los comentarios abajo y envía tu respuesta.
            </p>
          </div>
        </motion.div>
      )}

      {/* Published banner */}
      {manuscript.status === "published" && manuscript.articleSlug && (
        <div style={{
          background: "rgba(62,207,142,0.07)", border: "1px solid rgba(62,207,142,0.25)",
          borderRadius: "8px", padding: "16px 20px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <CheckCircle size={16} color="#3ecf8e" />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#2a7a55", flex: 1 }}>
            Tu artículo está publicado · DOI permanente: <strong>{manuscript.doi}</strong>
          </p>
          <Link
            to={`/articulo/${manuscript.articleSlug}`}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#3ecf8e", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Ver artículo →
          </Link>
        </div>
      )}

      {/* Timeline */}
      <div style={{
        background: "#fff", border: "1px solid #efefef", borderRadius: "8px",
        padding: "24px 32px", marginBottom: "16px",
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700,
          color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px",
        }}>
          Historial del proceso
        </p>

        <div>
          {manuscript.timeline.map((entry, i) => {
            const isLast = i === manuscript.timeline.length - 1;
            return (
              <div key={i} className="flex gap-4">
                {/* Left: dot + line */}
                <div className="flex flex-col items-center" style={{ flexShrink: 0, width: "20px" }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: isLast ? STATUS_CONFIG[entry.status].color : "#ddd",
                    border: isLast ? `2px solid ${STATUS_CONFIG[entry.status].color}` : "2px solid #ddd",
                    flexShrink: 0, marginTop: "4px",
                    boxShadow: isLast ? `0 0 0 4px ${STATUS_CONFIG[entry.status].color}18` : "none",
                    transition: "all 0.3s",
                  }} />
                  {!isLast && (
                    <div style={{ width: "1px", flex: 1, background: "#f0f0f0", minHeight: "28px" }} />
                  )}
                </div>

                {/* Right: content */}
                <div style={{ paddingBottom: isLast ? 0 : "20px", flex: 1 }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusBadge status={entry.status} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>
                      {entry.date}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#ccc" }}>
                      · {entry.actor} ({entry.actorRole})
                    </span>
                  </div>
                  {entry.note && (
                    <p style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "16px",
                      color: "#666", lineHeight: 1.6, marginTop: "4px",
                    }}>
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments */}
      {publicComments.length > 0 && (
        <div style={{
          background: "#fff", border: "1px solid #efefef", borderRadius: "8px",
          padding: "24px 32px", marginBottom: "16px",
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700,
            color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px",
          }}>
            Comentarios del equipo editorial
          </p>

          <div className="flex flex-col gap-4">
            {publicComments.map((comment) => {
              const isEditor = comment.role === "editor";
              const accentColor = isEditor ? "#6c8ebf" : comment.role === "investigador" ? "#3ecf8e" : "#9b7fd4";
              return (
                <div key={comment.id} style={{
                  borderLeft: `3px solid ${accentColor}`,
                  paddingLeft: "16px",
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "50%",
                      background: `${accentColor}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: accentColor, fontFamily: "'Inter', sans-serif" }}>
                        {comment.author.charAt(0)}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600, color: "#333" }}>
                      {comment.author}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                      {comment.role === "editor" ? "Editor" : comment.role === "investigador" ? "Autor" : "Revisor"} · {comment.date}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#444", lineHeight: 1.7 }}>
                    {comment.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reply box */}
      {needsRevision && (
        <div style={{
          background: "#fff", border: "1px solid #efefef", borderRadius: "8px",
          padding: "24px 32px",
        }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700,
            color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px",
          }}>
            Responder a los revisores
          </p>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe tu respuesta detallada punto por punto a cada comentario del revisor..."
            style={{
              width: "100%", minHeight: "120px", padding: "12px 14px",
              border: "1px solid #e8e8e8", borderRadius: "6px",
              fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333",
              outline: "none", resize: "vertical", lineHeight: 1.7,
              boxSizing: "border-box", transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0b0b0b")}
            onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
          />

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded"
              style={{
                background: replyText.trim() ? "#0b0b0b" : "#f0f0f0",
                color: replyText.trim() ? "#fff" : "#ccc",
                fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500,
                border: "none", cursor: replyText.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              <Send size={13} /> Enviar respuesta
            </button>
            {replySent && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#3ecf8e" }}
              >
                ✓ Respuesta enviada al editor
              </motion.span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

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
      {/* Color accent top bar */}
      <div style={{ height: "3px", background: conf.color, opacity: 0.7 }} />

      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <StatusBadge status={manuscript.status} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#ccc" }}>
                {manuscript.id.toUpperCase()}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#ccc" }}>·</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                {manuscript.category}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#ccc" }}>·</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                {manuscript.type}
              </span>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600,
              color: "#0b0b0b", lineHeight: 1.35, letterSpacing: "-0.01em",
              marginBottom: "10px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {manuscript.title}
            </h3>

            {/* Bottom row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#ccc" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>
                  Enviado {manuscript.submittedDate}
                </span>
              </div>
              {manuscript.wordCount && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                  {manuscript.wordCount.toLocaleString()} palabras
                </span>
              )}
              {publicComments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare size={11} color="#bbb" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                    {publicComments} {publicComments === 1 ? "comentario" : "comentarios"}
                  </span>
                </div>
              )}
              {lastUpdate && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                  Última act. {lastUpdate.date}
                </span>
              )}
            </div>

            {/* Action required */}
            {needsAction && (
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                <AlertTriangle size={12} color="#e8c55e" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "#c8962a" }}>
                  Requiere tu atención — {manuscript.status === "major_revision" ? "Revisión mayor pendiente" : "Revisión menor pendiente"}
                </span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div style={{ flexShrink: 0, paddingTop: "2px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ChevronRight size={15} color="#aaa" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
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
    { label: "Requieren acción", value: (statusCounts.major_revision || 0) + (statusCounts.minor_revision || 0), color: "#e8c55e" },
    { label: "Publicados", value: (statusCounts.published || 0) + (statusCounts.accepted || 0), color: "#3ecf8e" },
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
        {manuscripts.slice(0, 4).map((m) => (
          <ManuscriptListItem
            key={m.id}
            manuscript={m}
            onClick={() => onSelectManuscript(m.id)}
          />
        ))}
        {manuscripts.length > 4 && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb", textAlign: "center", paddingTop: "4px" }}>
            +{manuscripts.length - 4} más en "Mis Manuscritos"
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────── */

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

  const handleSelectManuscript = (id: string) => {
    setSelectedId(id);
    if (section !== "manuscripts") setSection("manuscripts");
  };

  const handleBack = () => {
    setSelectedId(null);
  };

  const handleSectionChange = (s: string) => {
    setSection(s);
    setSelectedId(null);
  };

  const navItems = [
    { id: "overview", label: "Resumen", icon: <BookOpen size={14} /> },
    { id: "manuscripts", label: "Mis Manuscritos", icon: <FileText size={14} />, badge: needsAction },
    { id: "submit", label: "Nuevo Envío", icon: <Plus size={14} /> },
  ];

  // Determine header title
  let headerTitle = "Panel del Investigador";
  let headerSubtitle: string | undefined = `Bienvenido, ${user?.name?.split(" ")[0]}`;
  if (section === "manuscripts") {
    headerTitle = selectedManuscript ? "Detalle del manuscrito" : "Mis Manuscritos";
    headerSubtitle = selectedManuscript ? undefined : `${myManuscripts.length} envío${myManuscripts.length !== 1 ? "s" : ""}`;
  } else if (section === "submit") {
    headerTitle = "Nuevo Envío";
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
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Overview manuscripts={myManuscripts} onSelectManuscript={handleSelectManuscript} />
          </motion.div>
        )}

        {/* MANUSCRIPTS — LIST */}
        {section === "manuscripts" && !selectedManuscript && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {myManuscripts.length === 0 ? (
              <div className="text-center py-20">
                <FileText size={32} color="#e0e0e0" className="mx-auto mb-4" />
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "22px", fontStyle: "italic", color: "#ccc", marginBottom: "16px" }}>
                  Aún no has enviado ningún manuscrito.
                </p>
                <button
                  onClick={() => setSection("submit")}
                  className="px-5 py-2.5 rounded inline-flex items-center gap-2"
                  style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "16px", border: "none", cursor: "pointer" }}
                >
                  <Plus size={13} /> Enviar primer manuscrito
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myManuscripts.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <ManuscriptListItem
                      manuscript={m}
                      onClick={() => setSelectedId(m.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* MANUSCRIPTS — DETAIL */}
        {section === "manuscripts" && selectedManuscript && (
          <ManuscriptDetail
            key={`detail-${selectedManuscript.id}`}
            manuscript={selectedManuscript}
            onBack={handleBack}
          />
        )}

        {/* SUBMIT */}
        {section === "submit" && (
          <motion.div
            key="submit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
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
      </AnimatePresence>
    </DashboardLayout>
  );
}
