import { useState, useEffect } from "react";
import { api } from "../../api/api";
import {
  Plus, ChevronRight, FolderOpen, Layers, Tag,
  AlertCircle, Loader2, BookOpen, Pencil, X, Check
} from "lucide-react";

interface Programa {
  id: number;
  nombre: string;
  area_id: number;
  status: boolean;
  lineas?: Linea[];
}

interface Area {
  id: number;
  nombre: string;
  color_institucional?: string;
  status: boolean;
  programas?: Programa[];
}

interface Linea {
  id: number;
  nombre: string;
  programa_id: number;
  status: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  fontFamily: "'Inter', sans-serif",
  fontSize: "14px",
  color: "#0b0b0b",
  outline: "none",
  background: "#fafafa",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "4px",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #efefef",
  borderRadius: "8px",
  padding: "20px",
};

export default function AreaLineManagement() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Area form
  const [areaNombre, setAreaNombre] = useState("");
  const [areaColor, setAreaColor] = useState("#3ecf8e");
  const [areaError, setAreaError] = useState("");
  const [creatingArea, setCreatingArea] = useState(false);

  // Programa form
  const [progAreaId, setProgAreaId] = useState("");
  const [progNombre, setProgNombre] = useState("");
  const [progError, setProgError] = useState("");
  const [creatingProg, setCreatingProg] = useState(false);

  // Linea form
  const [lineaProgId, setLineaProgId] = useState("");
  const [lineaNombre, setLineaNombre] = useState("");
  const [lineaError, setLineaError] = useState("");
  const [creatingLinea, setCreatingLinea] = useState(false);

  // Edit state
  const [editingArea, setEditingArea] = useState<number | null>(null);
  const [editAreaNombre, setEditAreaNombre] = useState("");
  const [editAreaColor, setEditAreaColor] = useState("");
  const [editingPrograma, setEditingPrograma] = useState<number | null>(null);
  const [editProgNombre, setEditProgNombre] = useState("");
  const [editProgAreaId, setEditProgAreaId] = useState("");
  const [editingLinea, setEditingLinea] = useState<number | null>(null);
  const [editLineaNombre, setEditLineaNombre] = useState("");
  const [editLineaProgId, setEditLineaProgId] = useState("");

  // UI state
  const [expandedAreas, setExpandedAreas] = useState<Set<number>>(new Set());
  const [expandedProgramas, setExpandedProgramas] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [areasRes, programasRes, lineasRes] = await Promise.all([
        api.areas.fetchAll(),
        api.programas.fetchAll(),
        api.lineas.fetchAll(),
      ]);
      setAreas(areasRes);
      setProgramas(programasRes);
      setLineas(lineasRes);
    } catch (err: any) {
      setError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<number>>>) => (id: number) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleArea = toggle(setExpandedAreas);
  const togglePrograma = toggle(setExpandedProgramas);

  // --- TOGGLE STATUS ---
  const handleToggleStatusArea = async (area: Area) => {
    try {
      await api.areas.update(area.id, { status: !area.status });
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleStatusPrograma = async (prog: Programa) => {
    try {
      await api.programas.update(prog.id, { status: !prog.status });
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleStatusLinea = async (linea: Linea) => {
    try {
      await api.lineas.update(linea.id, { status: !linea.status });
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // --- EDIT AREA ---
  const startEditArea = (area: Area) => {
    setEditingArea(area.id);
    setEditAreaNombre(area.nombre);
    setEditAreaColor(area.color_institucional || "#3ecf8e");
  };

  const handleSaveEditArea = async (id: number) => {
    if (!editAreaNombre.trim() || editAreaNombre.trim().length < 3) return;
    try {
      await api.areas.update(id, { nombre: editAreaNombre.trim(), color_institucional: editAreaColor });
      setEditingArea(null);
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // --- EDIT PROGRAMA ---
  const startEditPrograma = (prog: Programa) => {
    setEditingPrograma(prog.id);
    setEditProgNombre(prog.nombre);
    setEditProgAreaId(String(prog.area_id));
  };

  const handleSaveEditPrograma = async (id: number) => {
    if (!editProgNombre.trim() || editProgNombre.trim().length < 3) return;
    if (!editProgAreaId) return;
    try {
      await api.programas.update(id, { nombre: editProgNombre.trim(), area_id: parseInt(editProgAreaId, 10) });
      setEditingPrograma(null);
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // --- EDIT LINEA ---
  const startEditLinea = (linea: Linea) => {
    setEditingLinea(linea.id);
    setEditLineaNombre(linea.nombre);
    setEditLineaProgId(String(linea.programa_id));
  };

  const handleSaveEditLinea = async (id: number) => {
    if (!editLineaNombre.trim() || editLineaNombre.trim().length < 3) return;
    if (!editLineaProgId) return;
    try {
      await api.lineas.update(id, { nombre: editLineaNombre.trim(), programa_id: parseInt(editLineaProgId, 10) });
      setEditingLinea(null);
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // --- CREATE AREA ---
  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setAreaError("");
    if (!areaNombre.trim() || areaNombre.trim().length < 3) {
      setAreaError("Mínimo 3 caracteres");
      return;
    }
    try {
      setCreatingArea(true);
      await api.areas.create({ nombre: areaNombre.trim(), color_institucional: areaColor || undefined });
      setAreaNombre("");
      setAreaColor("#3ecf8e");
      await fetchData();
    } catch (err: any) {
      setAreaError(err.message || "Error al crear área");
    } finally {
      setCreatingArea(false);
    }
  };

  // --- CREATE PROGRAMA ---
  const handleCreatePrograma = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgError("");
    if (!progNombre.trim() || progNombre.trim().length < 3) {
      setProgError("Mínimo 3 caracteres");
      return;
    }
    if (!progAreaId) {
      setProgError("Selecciona un área");
      return;
    }
    try {
      setCreatingProg(true);
      await api.programas.create({ area_id: parseInt(progAreaId, 10), nombre: progNombre.trim() });
      setProgNombre("");
      setExpandedAreas(prev => new Set(prev).add(parseInt(progAreaId, 10)));
      await fetchData();
    } catch (err: any) {
      setProgError(err.message || "Error al crear programa");
    } finally {
      setCreatingProg(false);
    }
  };

  // --- CREATE LINEA ---
  const handleCreateLinea = async (e: React.FormEvent) => {
    e.preventDefault();
    setLineaError("");
    if (!lineaNombre.trim() || lineaNombre.trim().length < 3) {
      setLineaError("Mínimo 3 caracteres");
      return;
    }
    if (!lineaProgId) {
      setLineaError("Selecciona un programa");
      return;
    }
    try {
      setCreatingLinea(true);
      await api.lineas.create({ programa_id: parseInt(lineaProgId, 10), nombre: lineaNombre.trim() });
      setLineaNombre("");
      const parentProg = programas.find(p => p.id === parseInt(lineaProgId, 10));
      if (parentProg) {
        setExpandedProgramas(prev => new Set(prev).add(parentProg.id));
        setExpandedAreas(prev => new Set(prev).add(parentProg.area_id));
      }
      await fetchData();
    } catch (err: any) {
      setLineaError(err.message || "Error al crear línea");
    } finally {
      setCreatingLinea(false);
    }
  };

  // Build hierarchy: Area → Programas → Líneas
  const hierarchy = areas.map(area => ({
    ...area,
    programas: programas
      .filter(p => p.area_id === area.id)
      .map(prog => ({
        ...prog,
        lineas: lineas.filter(l => l.programa_id === prog.id),
      })),
  }));

  const programasForSelect = programas.map(p => ({
    ...p,
    areaNombre: areas.find(a => a.id === p.area_id)?.nombre || "Sin área",
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} color="#888" className="animate-spin" />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginLeft: "12px" }}>Cargando...</span>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="flex items-center gap-2 mb-6 p-4 rounded" style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)" }}>
          <AlertCircle size={16} color="#e05252" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#e05252" }}>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ====== FORMULARIOS ====== */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          {/* Form Area */}
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Layers size={15} color="#0b0b0b" />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600 }}>Nueva Área</h3>
            </div>
            <form onSubmit={handleCreateArea} className="flex flex-col gap-3">
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input type="text" value={areaNombre} onChange={(e) => setAreaNombre(e.target.value)} placeholder="Ej: Ciencias de la Salud" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Color institucional</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={areaColor} onChange={(e) => setAreaColor(e.target.value)} style={{ width: "32px", height: "32px", border: "1px solid #e0e0e0", borderRadius: "4px", cursor: "pointer", padding: "2px" }} />
                  <input type="text" value={areaColor} onChange={(e) => setAreaColor(e.target.value)} placeholder="#3ecf8e" style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              {areaError && <p style={{ fontSize: "12px", color: "#e05252", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={10} /> {areaError}</p>}
              <button type="submit" disabled={creatingArea} className="flex items-center justify-center gap-1 py-2 rounded" style={{ background: creatingArea ? "#ccc" : "#0b0b0b", color: "#fff", fontSize: "13px", fontWeight: 500, border: "none", cursor: creatingArea ? "not-allowed" : "pointer" }}>
                {creatingArea ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              </button>
            </form>
          </div>

          {/* Form Programa */}
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={15} color="#3ecf8e" />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600 }}>Nuevo Programa</h3>
            </div>
            <form onSubmit={handleCreatePrograma} className="flex flex-col gap-3">
              <div>
                <label style={labelStyle}>Área *</label>
                <select value={progAreaId} onChange={(e) => setProgAreaId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Seleccionar área...</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input type="text" value={progNombre} onChange={(e) => setProgNombre(e.target.value)} placeholder="Ej: Ingeniería Informática" style={inputStyle} />
              </div>
              {progError && <p style={{ fontSize: "12px", color: "#e05252", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={10} /> {progError}</p>}
              <button type="submit" disabled={creatingProg} className="flex items-center justify-center gap-1 py-2 rounded" style={{ background: creatingProg ? "#ccc" : "#3ecf8e", color: "#fff", fontSize: "13px", fontWeight: 500, border: "none", cursor: creatingProg ? "not-allowed" : "pointer" }}>
                {creatingProg ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                {creatingProg ? "Creando..." : "Crear Programa"}
              </button>
            </form>
          </div>

          {/* Form Linea */}
          <div style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Tag size={15} color="#9b7fd4" />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600 }}>Nueva Línea</h3>
            </div>
            <form onSubmit={handleCreateLinea} className="flex flex-col gap-3">
              <div>
                <label style={labelStyle}>Programa *</label>
                <select value={lineaProgId} onChange={(e) => setLineaProgId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Seleccionar programa...</option>
                  {programasForSelect.map(p => <option key={p.id} value={p.id}>{p.nombre} — {p.areaNombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input type="text" value={lineaNombre} onChange={(e) => setLineaNombre(e.target.value)} placeholder="Ej: IA" style={inputStyle} />
              </div>
              {lineaError && <p style={{ fontSize: "12px", color: "#e05252", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={10} /> {lineaError}</p>}
              <button type="submit" disabled={creatingLinea} className="flex items-center justify-center gap-1 py-2 rounded" style={{ background: creatingLinea ? "#ccc" : "#9b7fd4", color: "#fff", fontSize: "13px", fontWeight: 500, border: "none", cursor: creatingLinea ? "not-allowed" : "pointer" }}>
                {creatingLinea ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                {creatingLinea ? "Creando..." : "Crear Línea"}
              </button>
            </form>
          </div>
        </div>

        {/* ====== LISTADO JERÁRQUICO ====== */}
        <div className="xl:col-span-2">
          <div style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }}>Estructura Académica</h3>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#999" }}>
                {areas.length} área(s) · {programas.length} programa(s) · {lineas.length} línea(s)
              </span>
            </div>

            {hierarchy.length === 0 ? (
              <div className="text-center py-12" style={{ border: "1px dashed #e0e0e0", borderRadius: "6px" }}>
                <FolderOpen size={32} color="#ddd" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#999" }}>No hay áreas creadas</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb", marginTop: "4px" }}>Crea la primera área usando el formulario</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {hierarchy.map((area) => {
                  const isExpanded = expandedAreas.has(area.id);
                  const isEditing = editingArea === area.id;
                  return (
                    <div key={area.id} style={{ border: "1px solid #f0f0f0", borderRadius: "6px", overflow: "hidden" }}>
                      {/* AREA */}
                      <div className="flex items-center gap-2 p-3 cursor-pointer" style={{ background: "#fafafa", borderBottom: isExpanded ? "1px solid #f0f0f0" : "none", opacity: area.status ? 1 : 0.5 }} onClick={() => toggleArea(area.id)}>
                        <div style={{ color: "#888", transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                          <ChevronRight size={14} />
                        </div>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: area.color_institucional || "#888", flexShrink: 0 }} />
                        {isEditing ? (
                          <input type="text" value={editAreaNombre} onChange={(e) => setEditAreaNombre(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ ...inputStyle, flex: 1, padding: "4px 8px", fontSize: "14px" }} autoFocus />
                        ) : (
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600, color: "#0b0b0b", flex: 1 }}>{area.nombre}</span>
                        )}
                        <span style={{ fontSize: "12px", color: "#bbb" }}>{area.programas.length} programa(s)</span>
                        <span
                          onClick={(e) => { e.stopPropagation(); handleToggleStatusArea(area); }}
                          style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", cursor: "pointer", background: area.status ? "#dcfce7" : "#fee2e2", color: area.status ? "#16a34a" : "#dc2626", border: "none", fontWeight: 500 }}
                        >
                          {area.status ? "Activo" : "Inactivo"}
                        </span>
                        {isEditing ? (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleSaveEditArea(area.id); }} className="p-1 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a" }}><Check size={12} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setEditingArea(null); }} className="p-1 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}><X size={12} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); startEditArea(area); }} className="p-1 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#666")} onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}><Pencil size={12} /></button>
                          </>
                        )}
                      </div>

                      {/* PROGRAMAS */}
                      {isExpanded && (
                        <div style={{ padding: "8px 12px 12px 28px" }}>
                          {area.programas.length === 0 ? (
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#ccc", padding: "12px 0", textAlign: "center" }}>Sin programas</p>
                          ) : (
                            area.programas.map((prog) => {
                              const isProgExpanded = expandedProgramas.has(prog.id);
                              const isProgEditing = editingPrograma === prog.id;
                              return (
                                <div key={prog.id} style={{ marginBottom: "2px" }}>
                                  {/* PROGRAMA */}
                                  <div className="flex items-center gap-2 p-2 rounded cursor-pointer" style={{ background: isProgExpanded ? "#f8f8f8" : "transparent", opacity: prog.status ? 1 : 0.5 }} onClick={() => togglePrograma(prog.id)}>
                                    <div style={{ color: "#bbb", transition: "transform 0.15s", transform: isProgExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                                      <ChevronRight size={12} />
                                    </div>
                                    <BookOpen size={12} color="#3ecf8e" />
                                    {isProgEditing ? (
                                      <input type="text" value={editProgNombre} onChange={(e) => setEditProgNombre(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ ...inputStyle, flex: 1, padding: "3px 6px", fontSize: "13px" }} autoFocus />
                                    ) : (
                                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500, color: "#333", flex: 1 }}>{prog.nombre}</span>
                                    )}
                                    <span style={{ fontSize: "11px", color: "#ccc" }}>{prog.lineas.length} línea(s)</span>
                                    <span
                                      onClick={(e) => { e.stopPropagation(); if (area.status) handleToggleStatusPrograma(prog); }}
                                      style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", cursor: area.status ? "pointer" : "not-allowed", background: prog.status ? "#dcfce7" : "#fee2e2", color: prog.status ? "#16a34a" : "#dc2626", border: "none", fontWeight: 500, opacity: area.status ? 1 : 0.5 }}
                                    >
                                      {prog.status ? "Activo" : "Inactivo"}
                                    </span>
                                    {isProgEditing ? (
                                      <>
                                        <button onClick={(e) => { e.stopPropagation(); handleSaveEditPrograma(prog.id); }} className="p-1 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a" }}><Check size={11} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setEditingPrograma(null); }} className="p-1 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}><X size={11} /></button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={(e) => { e.stopPropagation(); startEditPrograma(prog); }} className="p-1 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#666")} onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}><Pencil size={11} /></button>
                                      </>
                                    )}
                                  </div>

                                  {/* LINEAS */}
                                  {isProgExpanded && (
                                    <div style={{ paddingLeft: "24px", paddingBottom: "4px" }}>
                                      {prog.lineas.length === 0 ? (
                                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#ccc", padding: "6px 0" }}>Sin líneas</p>
                                      ) : (
                                        prog.lineas.map((linea) => {
                                          const isLineaEditing = editingLinea === linea.id;
                                          return (
                                            <div key={linea.id} className="flex items-center gap-2 py-1.5 px-2 rounded" style={{ opacity: linea.status ? 1 : 0.5 }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                              <Tag size={11} color="#aaa" />
                                              {isLineaEditing ? (
                                                <input type="text" value={editLineaNombre} onChange={(e) => setEditLineaNombre(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ ...inputStyle, flex: 1, padding: "2px 6px", fontSize: "12px" }} autoFocus />
                                              ) : (
                                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#555", flex: 1 }}>{linea.nombre}</span>
                                              )}
                                              <span
                                                onClick={() => { if (prog.status) handleToggleStatusLinea(linea); }}
                                                style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", cursor: prog.status ? "pointer" : "not-allowed", background: linea.status ? "#dcfce7" : "#fee2e2", color: linea.status ? "#16a34a" : "#dc2626", border: "none", fontWeight: 500, opacity: prog.status ? 1 : 0.5 }}
                                              >
                                                {linea.status ? "Activo" : "Inactivo"}
                                              </span>
                                              {isLineaEditing ? (
                                                <>
                                                  <button onClick={() => handleSaveEditLinea(linea.id)} className="p-0.5 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a" }}><Check size={10} /></button>
                                                  <button onClick={() => setEditingLinea(null)} className="p-0.5 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}><X size={10} /></button>
                                                </>
                                              ) : (
                                                <>
                                                  <button onClick={() => startEditLinea(linea)} className="p-0.5 rounded" style={{ background: "none", border: "none", cursor: "pointer", color: "#ddd" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#666")} onMouseLeave={(e) => (e.currentTarget.style.color = "#ddd")}><Pencil size={10} /></button>
                                                </>
                                              )}
                                            </div>
                                          );
                                        })
                                      )}
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
      </div>
    </div>
  );
}
