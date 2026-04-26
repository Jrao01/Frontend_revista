import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch, CheckSquare, ArrowLeft, Users, ChevronRight, Clock, MessageSquare, AlertTriangle, CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useManuscripts } from "../../context/ManuscriptContext";
import { type Manuscript, type ManuscriptStatus, STATUS_CONFIG, NEXT_STATUS, ALL_USERS } from "../../data/manuscripts";
import { StatusBadge } from "./components/StatusBadge";

const JURADO_POOL = ALL_USERS.filter((u) => u.role === "jurado");

/* ─── List Item ────────────────────────────────────── */

function ManuscriptListItem({ manuscript, onClick }: { manuscript: Manuscript; onClick: () => void }) {
  const conf = STATUS_CONFIG[manuscript.status];
  const isNew = manuscript.status === "submitted";
  const pendingJurados = manuscript.assignedJurados.filter((j) => !j.submitted).length;

  return (
    <motion.button
      layout onClick={onClick} whileHover={{ y: -1 }} transition={{ duration: 0.15 }}
      style={{
        width: "100%", background: "#fff",
        border: `1px solid ${isNew ? "#6c8ebf30" : "#efefef"}`,
        borderRadius: "8px", padding: "0", cursor: "pointer", textAlign: "left",
        overflow: "hidden", display: "block",
        boxShadow: isNew ? "0 2px 12px rgba(108,142,191,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isNew ? "0 2px 12px rgba(108,142,191,0.08)" : "0 1px 3px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ height: "3px", background: conf.color, opacity: 0.6 }} />
      <div className="px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={manuscript.status} />
              {isNew && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 700, color: "#fff", background: "#6c8ebf", padding: "2px 7px", borderRadius: "10px" }}>
                  NUEVO
                </span>
              )}
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb" }}>
                {manuscript.id.toUpperCase()} · {manuscript.category}
              </span>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.35, marginBottom: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {manuscript.title}
            </h3>

            <div className="flex items-center gap-3 flex-wrap">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#888" }}>
                {manuscript.submittedByName}
              </span>
              <div className="flex items-center gap-1.5">
                <Clock size={11} color="#ccc" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>{manuscript.submittedDate}</span>
              </div>
              {manuscript.assignedJurados.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users size={11} color="#bbb" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>
                    {manuscript.assignedJurados.filter((j) => j.submitted).length}/{manuscript.assignedJurados.length}
                  </span>
                </div>
              )}
            </div>

            {pendingJurados > 0 && manuscript.status === "peer_review" && (
              <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid #f5f5f5" }}>
                <AlertTriangle size={11} color="#9b7fd4" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9b7fd4" }}>
                  {pendingJurados} revisor{pendingJurados > 1 ? "es" : ""} pendiente{pendingJurados > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={14} color="#aaa" />
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Detail View ─────────────────────────────────── */

function ManuscriptDetail({ manuscript, onBack }: { manuscript: Manuscript; onBack: () => void }) {
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
      addComment(manuscript.id, { author: user?.name ?? "Editor", role: "editor", content: decisionNote, date: new Date().toISOString().split("T")[0] });
    }
    setDecisionSent(STATUS_CONFIG[status].label);
    setDecisionNote("");
  };

  const availableJurados = JURADO_POOL.filter((j) => !manuscript.assignedJurados.find((a) => a.email === j.email));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.22 }}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-5"
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", padding: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        <ArrowLeft size={14} /> Volver a la lista
      </button>

      {/* Header */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <StatusBadge status={manuscript.status} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>{manuscript.id.toUpperCase()} · {manuscript.category}</span>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "10px" }}>
          {manuscript.title}
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          {[
            { label: "Autor", value: manuscript.submittedByName },
            { label: "Institución", value: manuscript.institution },
            { label: "Enviado", value: manuscript.submittedDate },
            { label: "Tipo", value: manuscript.type },
          ].map((item) => (
            <span key={item.label} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>
              <strong style={{ color: "#555" }}>{item.label}:</strong> {item.value}
            </span>
          ))}
        </div>
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

      {/* Jurados */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Jurados ({manuscript.assignedJurados.length})
          </p>
          <div className="relative">
            <button
              onClick={() => setShowJuradoMenu(!showJuradoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded"
              style={{ background: "#f5f5f5", border: "1px solid #e8e8e8", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#555" }}
            >
              <Users size={12} /> + Asignar
            </button>
            {showJuradoMenu && (
              <div style={{ position: "absolute", right: 0, top: "34px", background: "#fff", border: "1px solid #e8e8e8", borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "200px", zIndex: 50, overflow: "hidden" }}>
                {availableJurados.length === 0 ? (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#bbb", padding: "12px 14px" }}>Todos asignados</p>
                ) : (
                  availableJurados.map((j) => (
                    <button
                      key={j.email}
                      onClick={() => { assignJurado(manuscript.id, j.email, j.name); setShowJuradoMenu(false); }}
                      style={{ width: "100%", textAlign: "left", padding: "9px 14px", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #f9f9f9", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#333", fontWeight: 500 }}>{j.name}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#aaa" }}>{j.institution}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {manuscript.assignedJurados.length === 0 ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#ccc", fontStyle: "italic" }}>
            Sin jurados asignados. Asigna al menos 2 para revisión por pares.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {manuscript.assignedJurados.map((j) => (
              <div key={j.email} className="flex items-center justify-between p-3 rounded" style={{ background: "#f9f9f9", border: "1px solid #efefef" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: j.submitted ? "#3ecf8e" : "#e8c55e" }} />
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#333" }}>{j.name}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb" }}>{j.submitted ? "✓ Entregado" : "Pendiente"}</p>
                  </div>
                </div>
                <button onClick={() => removeJurado(manuscript.id, j.email)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#e05252", background: "none", border: "none", cursor: "pointer" }}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "18px" }}>
          Historial
        </p>
        {manuscript.timeline.map((entry, i) => {
          const isLast = i === manuscript.timeline.length - 1;
          return (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center" style={{ flexShrink: 0, width: "18px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: isLast ? STATUS_CONFIG[entry.status].color : "#ddd", border: isLast ? `2px solid ${STATUS_CONFIG[entry.status].color}` : "2px solid #ddd", marginTop: "4px", flexShrink: 0, boxShadow: isLast ? `0 0 0 4px ${STATUS_CONFIG[entry.status].color}18` : "none" }} />
                {!isLast && <div style={{ width: "1px", flex: 1, background: "#f0f0f0", minHeight: "22px" }} />}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : "16px", flex: 1 }}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={entry.status} size="sm" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa" }}>{entry.date} · {entry.actor}</span>
                </div>
                {entry.note && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#666", lineHeight: 1.6, marginTop: "3px" }}>{entry.note}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comments */}
      {manuscript.comments.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px", marginBottom: "14px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "18px" }}>
            Comentarios ({manuscript.comments.length})
          </p>
          <div className="flex flex-col gap-4">
            {manuscript.comments.map((c) => {
              const accentColor = c.role === "editor" ? "#6c8ebf" : c.role === "investigador" ? "#3ecf8e" : "#9b7fd4";
              return (
                <div key={c.id} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: "14px" }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#333" }}>{c.author}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb" }}>
                      {c.role === "editor" ? "Editor" : c.role === "investigador" ? "Autor" : "Revisor"} · {c.date}
                    </span>
                    {c.isPrivate && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#e07b54", background: "rgba(224,123,84,0.1)", padding: "1px 6px", borderRadius: "3px" }}>Privado</span>}
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#444", lineHeight: 1.7 }}>{c.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision */}
      {nextStatuses.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>
            Decisión editorial
          </p>
          {decisionSent ? (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded" style={{ background: "rgba(62,207,142,0.06)", border: "1px solid rgba(62,207,142,0.2)" }}>
              <CheckCircle size={14} color="#3ecf8e" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#3ecf8e" }}>Decisión: <strong>{decisionSent}</strong></span>
            </motion.div>
          ) : (
            <>
              <textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Nota para el autor (opcional)..."
                style={{ width: "100%", minHeight: "72px", padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: "6px", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#333", outline: "none", resize: "vertical", lineHeight: 1.6, marginBottom: "12px", boxSizing: "border-box", transition: "border-color 0.2s" }}
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
                      className="px-3 py-2 rounded"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
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

/* ─── Filter tabs ──────────────────────────────────── */

const FILTER_TABS: { id: string; label: string; statuses: ManuscriptStatus[] }[] = [
  { id: "all", label: "Todos", statuses: [] },
  { id: "inbox", label: "Entrada", statuses: ["submitted"] },
  { id: "in_progress", label: "En progreso", statuses: ["editor_review", "peer_review", "major_revision", "minor_revision"] },
  { id: "completed", label: "Completados", statuses: ["accepted", "rejected", "published"] },
];

/* ─── Main ─────────────────────────────────────────── */

export function EditorDashboard() {
  const [section, setSection] = useState("manuscripts");
  const [filterTab, setFilterTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { user } = useAuth();
  const { manuscripts } = useManuscripts();

  const inboxCount = manuscripts.filter((m) => m.status === "submitted").length;
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

  const handleSectionChange = (s: string) => { setSection(s); setSelectedId(null); };

  const stats = [
    { label: "Bandeja", value: inboxCount, color: "#6c8ebf" },
    { label: "En progreso", value: manuscripts.filter((m) => ["editor_review","peer_review","major_revision","minor_revision"].includes(m.status)).length, color: "#9b7fd4" },
    { label: "Este mes", value: 3, color: "#3ecf8e" },
    { label: "Total", value: manuscripts.length, color: "#0b0b0b" },
  ];

  return (
    <DashboardLayout
      navItems={navItems} activeSection={section} onSectionChange={handleSectionChange}
      title={section === "manuscripts" ? (selectedManuscript ? "Gestión del manuscrito" : "Manuscritos") : "Estadísticas"}
      subtitle={section === "manuscripts" && !selectedManuscript ? `${manuscripts.length} en total` : undefined}
    >
      <AnimatePresence mode="wait">
        {section === "manuscripts" && !selectedManuscript && (
          <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {stats.map((s) => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "16px 18px" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#888" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {FILTER_TABS.map((tab) => {
                const count = tab.statuses.length ? manuscripts.filter((m) => tab.statuses.includes(m.status)).length : manuscripts.length;
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id)}
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "#666", background: isActive ? "#0b0b0b" : "transparent",
                      border: `1px solid ${isActive ? "#0b0b0b" : "#e0e0e0"}`, borderRadius: "20px",
                      padding: "4px 12px", cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              {filteredManuscripts.length === 0 ? (
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "18px", fontStyle: "italic", color: "#ccc", textAlign: "center", paddingTop: "32px" }}>
                  No hay manuscritos en esta categoría.
                </p>
              ) : (
                filteredManuscripts.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: i * 0.04 }}>
                    <ManuscriptListItem manuscript={m} onClick={() => setSelectedId(m.id)} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {section === "manuscripts" && selectedManuscript && (
          <ManuscriptDetail key={`detail-${selectedManuscript.id}`} manuscript={selectedManuscript} onBack={() => setSelectedId(null)} />
        )}

        {section === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: "Por estado", data: Object.entries(manuscripts.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {} as Record<string, number>)), colorFn: (k: string) => STATUS_CONFIG[k as ManuscriptStatus].color },
                { title: "Por categoría", data: Object.entries(manuscripts.reduce((acc, m) => { acc[m.category] = (acc[m.category] || 0) + 1; return acc; }, {} as Record<string, number>)), colorFn: () => "#6c8ebf" },
              ].map(({ title, data, colorFn }) => (
                <div key={title} style={{ background: "#fff", border: "1px solid #efefef", borderRadius: "8px", padding: "20px 24px" }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "18px" }}>{title}</p>
                  {data.map(([key, count]) => {
                    const pct = Math.round(((count as number) / manuscripts.length) * 100);
                    const label = title === "Por estado" ? STATUS_CONFIG[key as ManuscriptStatus].label : key;
                    return (
                      <div key={key} style={{ marginBottom: "12px" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#555" }}>{label}</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>{count as number} ({pct}%)</span>
                        </div>
                        <div style={{ height: "4px", background: "#f5f5f5", borderRadius: "3px", overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} style={{ height: "100%", background: colorFn(key), borderRadius: "3px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
