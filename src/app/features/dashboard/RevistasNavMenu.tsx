import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../../api/api";
import { BookOpen, ChevronRight, ChevronDown, ExternalLink, Loader2, FolderOpen } from "lucide-react";

interface Numero {
  id: number;
  numero: number;
  anio: number;
  titulo_edicion?: string;
  status?: string;
}

interface Volumen {
  id: number;
  numero_volumen: number;
  revista_id: number;
  numeros?: Numero[];
}

interface Revista {
  id: number;
  nombre: string;
  issn?: string;
  status?: boolean;
  volumenes?: Volumen[];
}

export default function RevistasNavMenu() {
  const [revistas, setRevistas] = useState<Revista[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRevistas, setExpandedRevistas] = useState<Set<number>>(new Set());
  const [expandedVolumenes, setExpandedVolumenes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const revistasData = await api.revistas.fetchAll();
        const revistasArr = Array.isArray(revistasData) ? revistasData : [];

        // Fetch volumenes for each revista
        const revistasConVolumenes = await Promise.all(
          revistasArr.map(async (r: Revista) => {
            try {
              const volumenes = await api.revistas.fetchVolumenes(r.id);
              return { ...r, volumenes: Array.isArray(volumenes) ? volumenes : [] };
            } catch {
              return { ...r, volumenes: [] };
            }
          })
        );

        setRevistas(revistasConVolumenes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleRevista = (id: number) => {
    setExpandedRevistas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleVolumen = (key: string) => {
    setExpandedVolumenes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 px-3">
        <Loader2 size={14} color="#888" className="animate-spin" />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888" }}>Cargando revistas...</span>
      </div>
    );
  }

  if (revistas.length === 0) {
    return (
      <div className="py-4 px-3 text-center">
        <FolderOpen size={20} color="#ddd" style={{ margin: "0 auto 6px" }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#bbb" }}>No hay revistas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {revistas.map((revista) => {
        const isExpanded = expandedRevistas.has(revista.id);
        const volumenes = revista.volumenes || [];

        return (
          <div key={revista.id}>
            {/* Revista */}
            <div
              className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded"
              style={{ background: isExpanded ? "#f5f5f5" : "transparent", transition: "background 0.15s" }}
              onClick={() => toggleRevista(revista.id)}
            >
              <div style={{ color: "#888", transition: "transform 0.15s", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                <ChevronRight size={12} />
              </div>
              <BookOpen size={13} color="#3ecf8e" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#0b0b0b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {revista.nombre}
              </span>
              <Link
                to={`/revistas/${revista.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100"
                style={{ color: "#aaa", transition: "opacity 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                title="Ver página de la revista"
              >
                <ExternalLink size={11} />
              </Link>
            </div>

            {/* Volumenes */}
            {isExpanded && (
              <div style={{ paddingLeft: "20px" }}>
                {volumenes.length === 0 ? (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#ccc", padding: "4px 8px" }}>Sin volúmenes</p>
                ) : (
                  volumenes.map((volumen) => {
                    const volKey = `${revista.id}-${volumen.id}`;
                    const isVolExpanded = expandedVolumenes.has(volKey);
                    const numeros = volumen.numeros || [];

                    return (
                      <div key={volumen.id}>
                        {/* Volumen */}
                        <div
                          className="flex items-center gap-1.5 py-1.5 px-2 cursor-pointer rounded"
                          style={{ background: isVolExpanded ? "#f8f8f8" : "transparent", transition: "background 0.15s" }}
                          onClick={() => toggleVolumen(volKey)}
                        >
                          <div style={{ color: "#bbb", transition: "transform 0.15s", transform: isVolExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                            <ChevronRight size={10} />
                          </div>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#555", flex: 1 }}>
                            Vol. {volumen.numero_volumen}
                          </span>
                          <Link
                            to={`/revistas/${revista.id}/volumen/${volumen.id}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "#aaa", padding: "1px" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                            title="Ver volumen"
                          >
                            <ExternalLink size={9} />
                          </Link>
                        </div>

                        {/* Numeros */}
                        {isVolExpanded && (
                          <div style={{ paddingLeft: "16px" }}>
                            {numeros.length === 0 ? (
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#ccc", padding: "2px 6px" }}>Sin números</p>
                            ) : (
                              numeros.map((numero) => (
                                <div
                                  key={numero.id}
                                  className="flex items-center gap-1.5 py-1 px-2 rounded"
                                  style={{ cursor: "default" }}
                                >
                                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: numero.status === "publicado" ? "#3ecf8e" : "#ddd", flexShrink: 0 }} />
                                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#777", flex: 1 }}>
                                    Nro. {numero.numero} ({numero.anio})
                                  </span>
                                  <Link
                                    to={`/revistas/${revista.id}/volumen/${volumen.id}`}
                                    style={{ color: "#ccc", padding: "1px" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#0b0b0b")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                                    title="Ver número"
                                  >
                                    <ExternalLink size={8} />
                                  </Link>
                                </div>
                              ))
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
  );
}
