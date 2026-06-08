import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router";
import { api } from "../api/api";
import { BookOpen, ArrowRight, Loader2, AlertCircle, Eye, Download } from "lucide-react";

interface Volumen {
  id: number;
  numero_volumen: number;
}

interface Revista {
  id: number;
  nombre: string;
  issn?: string;
  periodicidad?: string;
  descripcion?: string;
  activo?: boolean;
  portada?: string;
  volumenes?: Volumen[];
}

export function RevistasPage() {
  const [revistas, setRevistas] = useState<Revista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Record<number, { totalViews: number; totalDownloads: number }>>({});

  const fetchRevistas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.revistas.fetchAll();
      const revistasData = Array.isArray(data) ? data : [];
      setRevistas(revistasData);

      const statsPromises = revistasData.map(async (revista: Revista) => {
        try {
          const statsData = await api.statsContent.getRevistaStats(revista.id);
          return { id: revista.id, stats: statsData };
        } catch {
          return { id: revista.id, stats: { totalViews: 0, totalDownloads: 0 } };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<number, { totalViews: number; totalDownloads: number }> = {};
      statsResults.forEach(({ id, stats: s }) => {
        statsMap[id] = { totalViews: s.totalViews || 0, totalDownloads: s.totalDownloads || 0 };
      });
      setStats(statsMap);
    } catch (err: any) {
      setError("Error al cargar revistas: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevistas();
  }, []);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Header theme="light" />

      <div className="border-b" style={{ borderColor: "#f0f0f0", background: "#fafafa", paddingTop: "60px", paddingBottom: "60px" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            Índice de Revistas Científicas
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "38px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.02em", marginBottom: "8px" }}>
            Nuestras Revistas
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888", maxWidth: "580px", lineHeight: 1.5 }}>
            Explora las diferentes publicaciones periódicas, conoce su periodicidad y revisa cuántos volúmenes tienen disponibles.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} color="#888" className="animate-spin" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginLeft: "12px" }}>Cargando revistas...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-4 rounded" style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)" }}>
            <AlertCircle size={16} color="#e05252" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#e05252" }}>{error}</span>
          </div>
        ) : revistas.length === 0 ? (
          <div className="text-center py-20 rounded-lg border border-dashed border-gray-300 bg-white">
            <BookOpen size={36} color="#ccc" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>
              No hay revistas disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {revistas.map((revista) => (
              <div key={revista.id} className="rounded-3xl border border-[#e8e8e8] bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                <Link to={`/revistas/${revista.id}`} style={{ textDecoration: "none" }}>
                  <div className="relative" style={{ height: "200px", background: "#0b0b0b" }}>
                    {revista.portada ? (
                      <img
                        src={revista.portada.startsWith("http") ? revista.portada : `http://localhost:3000${revista.portada}`}
                        alt={revista.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                        <BookOpen size={48} color="#3ecf8e" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <Link to={`/revistas/${revista.id}`} style={{ textDecoration: "none" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>
                      {revista.nombre}
                    </h2>
                  </Link>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", lineHeight: 1.7, minHeight: "48px" }}>
                    {revista.descripcion || "Descripción no disponible."}
                  </p>

                  <div className="mt-5 grid gap-2.5 text-sm text-[#555]">
                    <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-2.5">
                      <span>Volúmenes</span>
                      <strong>{revista.volumenes?.length ?? 0}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#f0f0f0] py-2.5">
                      <span>Periodicidad</span>
                      <strong>{revista.periodicidad || "-"}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#f0f0f0] py-2.5">
                      <span>ISSN</span>
                      <strong>{revista.issn || "-"}</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#f0f0f0] py-2.5">
                      <span className="flex items-center gap-1.5"><Eye size={14} /> Vistas</span>
                      <strong>{stats[revista.id]?.totalViews ?? 0}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-2.5">
                      <span className="flex items-center gap-1.5"><Download size={14} /> Descargas</span>
                      <strong>{stats[revista.id]?.totalDownloads ?? 0}</strong>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm font-semibold">
                    <Link to={`/revistas/${revista.id}`} style={{ color: "#111", textDecoration: "none" }}>
                      Ver revista
                    </Link>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
