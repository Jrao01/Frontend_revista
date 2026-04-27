import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch, CheckSquare, ArrowLeft, Users, ChevronRight,
  Clock, MessageSquare, AlertTriangle, CheckCircle
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type Manuscript, type ManuscriptStatus, STATUS_CONFIG, NEXT_STATUS, ALL_USERS } from "../../data/manuscripts";

const JURADO_POOL = ALL_USERS.filter((u) => u.role === "jurado");

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

/* ─── List Item ────────────────────────────────────── */

function ManuscriptListItem({
  manuscript,
  onClick,
}: {
  manuscript: Manuscript;
  onClick: () => void;
}) {
  const conf = STATUS_CONFIG[manuscript.status];
  const isNew = manuscript.status === "submitted";
  const pendingJurados = manuscript.assignedJurados.filter((j) => !j.submitted).length;
  const publicComments = manuscript.comments.filter((c) => !c.isPrivate).length;

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
      {/* Color top bar */}
      <div style={{ height: "3px", background: conf.color, opacity: 0.6 }} />

      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <StatusBadge status={manuscript.status} />
              {isNew && (
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700,
                  color: "#fff", background: "#6c8ebf", padding: "2px 7px",
                  borderRadius: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  NUEVO
                </span>
              )}
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                {manuscript.id.toUpperCase()} · {manuscript.category} · {manuscript.type}
              </span>
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600,
              color: "#0b0b0b", lineHeight: 1.35, letterSpacing: "-0.01em", marginBottom: "10px",
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {manuscript.title}
            </h3>

            {/* Author + date */}
            <div className="flex items-center gap-4 flex-wrap">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888" }}>
                {manuscript.submittedByName} — {manuscript.institution}
              </span>
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#ccc" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                  {manuscript.submittedDate}
                </span>
              </div>
              {manuscript.assignedJurados.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users size={11} color="#bbb" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                    {manuscript.assignedJurados.filter((j) => j.submitted).length}/{manuscript.assignedJurados.length} revisiones
                  </span>
                </div>
              )}
              {publicComments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare size={11} color="#bbb" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
                    {publicComments}
                  </span>
                </div>
              )}
            </div>

            {/* Pending jurados alert */}
            {pendingJurados > 0 && manuscript.status === "peer_review" && (
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #f5f5f5" }}>
                <AlertTriangle size={11} color="#9b7fd4" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#9b7fd4" }}>
                  {pendingJurados} revisor{pendingJurados > 1 ? "es" : ""} pendiente{pendingJurados > 1 ? "s" : ""} de entregar
                </span>
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0 }}>
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

/* ─── Detail View ─────────────────────────────────── */

function ManuscriptDetail({
  manuscript,
  onBack,
}: {
  manuscript: Manuscript;
  onBack: () => void;
}) {
  const [decisionNote, setDecisionNote] = useState("");
  const [showJuradoMenu, setShowJuradoMenu] = useState(false);
  const [decisionSent, setDecisionSent] = useState<string | null>(null);
  const { user } = useAuth();
  const { updateStatus, assignJurado, removeJurado, addComment } = useManuscripts();

  const nextStatuses = NEXT_STATUS[manuscript.status] ?? [];

  const statusActionLabels: Partial<Record<ManuscriptStatus, string>> = {
    editor_review: "Pasar a Revisión Editorial",
    peer_review: "Enviar a Revisión por Pares",
    major_revision: "Solicitar Revisión Mayor",
    minor_revision: "Solicitar Revisión Menor",
    accepted: "Aceptar manuscrito",
    rejected: "Rechazar manuscrito",
    published: "Publicar artículo",
  };

  const actionColors: Partial<Record<ManuscriptStatus, { bg: string; border: string; text: string }>> = {
    accepted: { bg: "rgba(62,207,142,0.1)", border: "rgba(62,207,142,0.4)", text: "#2a7a55" },
    rejected: { bg: "rgba(224,82,82,0.08)", border: "rgba(224,82,82,0.3)", text: "#c0392b" },
    published: { bg: "rgba(11,11,11,0.06)", border: "rgba(11,11,11,0.2)", text: "#0b0b0b" },
    peer_review: { bg: "rgba(155,127,212,0.08)", border: "rgba(155,127,212,0.3)", text: "#6a4fa8" },
    editor_review: { bg: "rgba(108,142,191,0.08)", border: "rgba(108,142,191,0.3)", text: "#4a6890" },
    major_revision: { bg: "rgba(232,197,94,0.1)", border: "rgba(232,197,94,0.4)", text: "#8a6a10" },
    minor_revision: { bg: "rgba(240,161,78,0.1)", border: "rgba(240,161,78,0.4)", text: "#8a5010" },
  };

  const handleDecision = (status: ManuscriptStatus) => {
    updateStatus(manuscript.id, status, user?.name ?? "Editor", "Editor", decisionNote || undefined);
    if (decisionNote.trim()) {
      addComment(manuscript.id, {
        author: user?.name ?? "Editor",
        role: "editor",
        content: decisionNote,
        date: new Date().toISOString().split("T")[0],
      });
    }
    setDecisionSent(STATUS_CONFIG[status].label);
    setDecisionNote("");
  };

  const availableJurados = JURADO_POOL.filter(
    (j) => !manuscript.assignedJurados.find((a) => a.email === j.email)
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888", padding: 0, transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        <ArrowLeft size={14} /> Volver a la lista
      </button>

      {/* Header */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "28px 32px", marginBottom: "16px" }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={manuscript.status} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>
              {manuscript.id.toUpperCase()} · {manuscript.category}
            </span>
          </div>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: "12px" }}>
          {manuscript.title}
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Autor:</strong> {manuscript.submittedByName}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Institución:</strong> {manuscript.institution}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Enviado:</strong> {manuscript.submittedDate}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
            <strong style={{ color: "#555" }}>Tipo:</strong> {manuscript.type}
          </span>
        </div>

        {/* Abstract */}
        <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px", padding: "16px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Resumen</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#555", lineHeight: 1.7 }}>
            {manuscript.abstract}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {manuscript.keywords.map((kw) => (
              <span key={kw} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", background: "#efefef", padding: "2px 8px", borderRadius: "3px" }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Jurados */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Jurados asignados ({manuscript.assignedJurados.length})
          </p>
          <div className="relative">
            <button
              onClick={() => setShowJuradoMenu(!showJuradoMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded"
              style={{ background: "#f5f5f5", border: "1px solid #e8e8e8", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555" }}
            >
              <Users size={12} /> + Asignar jurado
            </button>
            {showJuradoMenu && (
              <div style={{ position: "absolute", right: 0, top: "36px", background: "#fff", border: "1px solid #e8e8e8", borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "220px", zIndex: 50, overflow: "hidden" }}>
                {availableJurados.length === 0 ? (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb", padding: "14px 16px" }}>
                    Todos los jurados ya asignados
                  </p>
                ) : (
                  availableJurados.map((j) => (
                    <button
                      key={j.email}
                      onClick={() => { assignJurado(manuscript.id, j.email, j.name); setShowJuradoMenu(false); }}
                      style={{ width: "100%", textAlign: "left", padding: "10px 16px", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #f9f9f9", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333", fontWeight: 500 }}>{j.name}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>{j.institution}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {manuscript.assignedJurados.length === 0 ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#ccc", fontStyle: "italic" }}>
            Sin jurados asignados. Asigna al menos 2 para enviar a revisión por pares.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {manuscript.assignedJurados.map((j) => (
              <div key={j.email} className="flex items-center justify-between p-3 rounded" style={{ background: "#f9f9f9", border: "1px solid #efefef" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: j.submitted ? "#3ecf8e" : "#e8c55e", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, color: "#333" }}>{j.name}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                      {j.submitted ? "✓ Revisión entregada" : "Pendiente de entrega"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeJurado(manuscript.id, j.email)}
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#e05252", background: "none", border: "none", cursor: "pointer" }}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
          Historial del proceso
        </p>
        {manuscript.timeline.map((entry, i) => {
          const isLast = i === manuscript.timeline.length - 1;
          return (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: "20px" }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: isLast ? STATUS_CONFIG[entry.status].color : "#ddd",
                  border: isLast ? `2px solid ${STATUS_CONFIG[entry.status].color}` : "2px solid #ddd",
                  marginTop: "4px", flexShrink: 0,
                  boxShadow: isLast ? `0 0 0 4px ${STATUS_CONFIG[entry.status].color}18` : "none",
                }} />
                {!isLast && <div style={{ width: "1px", flex: 1, background: "#f0f0f0", minHeight: "28px" }} />}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : "20px", flex: 1 }}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={entry.status} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>{entry.date}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#ccc" }}>· {entry.actor}</span>
                </div>
                {entry.note && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", lineHeight: 1.6, marginTop: "4px" }}>
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comments */}
      {manuscript.comments.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
            Comentarios ({manuscript.comments.length})
          </p>
          <div className="flex flex-col gap-4">
            {manuscript.comments.map((c) => {
              const accentColor = c.role === "editor" ? "#6c8ebf" : c.role === "investigador" ? "#3ecf8e" : "#9b7fd4";
              return (
                <div key={c.id} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: "16px" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: `${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: accentColor, fontFamily: "'Inter', sans-serif" }}>{c.author.charAt(0)}</span>
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600, color: "#333" }}>{c.author}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb" }}>
                      {c.role === "editor" ? "Editor" : c.role === "investigador" ? "Autor" : "Revisor"} · {c.date}
                    </span>
                    {c.isPrivate && (
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#e07b54", background: "rgba(224,123,84,0.1)", padding: "1px 6px", borderRadius: "3px" }}>
                        Privado
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#444", lineHeight: 1.7 }}>{c.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision panel */}
      {nextStatuses.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px 32px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
            Decisión editorial
          </p>

          {decisionSent ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded"
              style={{ background: "rgba(62,207,142,0.06)", border: "1px solid rgba(62,207,142,0.2)" }}
            >
              <CheckCircle size={14} color="#3ecf8e" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#3ecf8e" }}>
                Decisión registrada: <strong>{decisionSent}</strong>
              </span>
            </motion.div>
          ) : (
            <>
              <textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Nota editorial para el autor (opcional)..."
                style={{
                  width: "100%", minHeight: "80px", padding: "10px 14px",
                  border: "1px solid #e8e8e8", borderRadius: "6px",
                  fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#333",
                  outline: "none", resize: "vertical", lineHeight: 1.6,
                  marginBottom: "14px", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0b0b0b")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
              />
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map((ns) => {
                  const colors = actionColors[ns] ?? { bg: "#f5f5f5", border: "#e0e0e0", text: "#555" };
                  return (
                    <button
                      key={ns}
                      onClick={() => handleDecision(ns)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded"
                      style={{
                        background: colors.bg, border: `1px solid ${colors.border}`,
                        color: colors.text, fontFamily: "'Inter', sans-serif",
                        fontSize: "15px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      {statusActionLabels[ns] ?? STATUS_CONFIG[ns].label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Filter Tabs ──────────────────────────────────── */

const FILTER_TABS: { id: string; label: string; statuses: ManuscriptStatus[] }[] = [
  { id: "all", label: "Todos", statuses: [] },
  { id: "inbox", label: "Bandeja de entrada", statuses: ["submitted"] },
  { id: "in_progress", label: "En progreso", statuses: ["editor_review", "peer_review", "major_revision", "minor_revision"] },
  { id: "completed", label: "Completados", statuses: ["accepted", "rejected", "published"] },
];

/* ─── Main ─────────────────────────────────────────── */

export function EditorDashboard() {
  const [section, setSection] = useState("manuscripts");
  const [filterTab, setFilterTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();
  const { manuscripts, updateStatus, assignJurado, removeJurado } = useManuscripts();

  const inboxCount = manuscripts.filter((m) => m.status === "submitted").length;
  const inProgressCount = manuscripts.filter((m) =>
    ["editor_review", "peer_review", "major_revision", "minor_revision"].includes(m.status)
  ).length;

  const navItems = [
    { id: "manuscripts", label: "Manuscritos", icon: <GitBranch size={14} />, badge: inboxCount },
    { id: "analytics", label: "Estadísticas", icon: <CheckSquare size={14} /> },
  ];

  const filteredManuscripts = manuscripts.filter((m) => {
    const tab = FILTER_TABS.find((t) => t.id === filterTab);
    if (!tab || tab.statuses.length === 0) return true;
    return tab.statuses.includes(m.status);
  });

  const selectedManuscript = selectedId ? manuscripts.find((m) => m.id === selectedId) : null;

  const handleSectionChange = (s: string) => {
    setSection(s);
    setSelectedId(null);
  };

  const stats = [
    { label: "Bandeja entrada", value: inboxCount, color: "#6c8ebf" },
    { label: "En progreso", value: inProgressCount, color: "#9b7fd4" },
    { label: "Este mes", value: 3, color: "#3ecf8e" },
    { label: "Total", value: manuscripts.length, color: "#0b0b0b" },
  ];

  let headerTitle = "Panel del Editor";
  let headerSubtitle: string | undefined = `Bienvenida, ${user?.name?.split(" ")[0]}`;
  if (section === "manuscripts") {
    headerTitle = selectedManuscript ? "Gestión del manuscrito" : "Manuscritos";
    headerSubtitle = selectedManuscript ? undefined : `${manuscripts.length} manuscritos en total`;
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
        {/* MANUSCRIPTS — LIST */}
        {section === "manuscripts" && !selectedManuscript && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
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
                  ? manuscripts.filter((m) => tab.statuses.includes(m.status)).length
                  : manuscripts.length;
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id)}
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "15px",
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

            {/* List */}
            <div className="flex flex-col gap-3">
              {filteredManuscripts.length === 0 ? (
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "18px", fontStyle: "italic", color: "#ccc", textAlign: "center", paddingTop: "40px" }}>
                  No hay manuscritos en esta categoría.
                </p>
              ) : (
                filteredManuscripts.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <ManuscriptListItem
                      manuscript={m}
                      onClick={() => setSelectedId(m.id)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* MANUSCRIPTS — DETAIL */}
        {section === "manuscripts" && selectedManuscript && (
          <ManuscriptDetail
            key={`detail-${selectedManuscript.id}`}
            manuscript={selectedManuscript}
            onBack={() => setSelectedId(null)}
          />
        )}

        {/* ANALYTICS */}
        {section === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="grid grid-cols-2 gap-6">
              <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
                  Distribución por estado
                </p>
                {Object.entries(
                  manuscripts.reduce((acc, m) => {
                    acc[m.status] = (acc[m.status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([status, count]) => {
                  const conf = STATUS_CONFIG[status as ManuscriptStatus];
                  const pct = Math.round((count / manuscripts.length) * 100);
                  return (
                    <div key={status} style={{ marginBottom: "14px" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555" }}>{conf.label}</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: "5px", background: "#f5f5f5", borderRadius: "3px", overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{ height: "100%", background: conf.color, borderRadius: "3px" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "24px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "20px" }}>
                  Distribución por categoría
                </p>
                {Object.entries(
                  manuscripts.reduce((acc, m) => {
                    acc[m.category] = (acc[m.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([cat, count]) => {
                  const pct = Math.round((count / manuscripts.length) * 100);
                  return (
                    <div key={cat} style={{ marginBottom: "14px" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555" }}>{cat}</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>{count}</span>
                      </div>
                      <div style={{ height: "5px", background: "#f5f5f5", borderRadius: "3px", overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{ height: "100%", background: "#6c8ebf", borderRadius: "3px" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
