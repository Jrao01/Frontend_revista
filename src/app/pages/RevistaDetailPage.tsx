import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useParams, Link } from "react-router";
import { api } from "../api/api";
import { ArrowLeft, BookOpen, Calendar, HelpCircle, ArrowRight, Loader2, Eye, Download } from "lucide-react";
import { motion } from "motion/react";

interface Numero {
  id: number;
  numero: number;
  anio?: number;
  titulo_edicion?: string;
  status?: string;
  fecha_publicacion?: string;
}

interface Volumen {
  id: number;
  numero_volumen: number;
  numeros?: Numero[];
}

interface Revista {
  id: number;
  nombre: string;
  issn?: string;
  periodicidad?: string;
  descripcion?: string;
  portada?: string;
  activo?: boolean;
  volumenes?: Volumen[];
}

export function RevistaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [revista, setRevista] = useState<Revista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRevista = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.revistas.fetchById(id);
        setRevista(data);

        try {
          const statsData = await api.statsContent.getRevistaStats(id);
          setStats(statsData);
        } catch {}
      } catch (err: any) {
        setError(err.message || "Error al cargar la revista");
      } finally {
        setLoading(false);
      }
    };

    fetchRevista();
  }, [id]);

  if (loading) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[1200px] mx-auto px-6 py-32 text-center">
          <Loader2 size={32} className="animate-spin" color="#888" style={{ marginBottom: "16px" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>Cargando revista...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !revista) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <HelpCircle size={48} color="#e05252" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: "#0b0b0b", marginBottom: "10px" }}>
            Revista No Encontrada
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", marginBottom: "24px" }}>
            {error || "La publicación periódica que buscas no existe o ha sido trasladada."}
          </p>
          <Link to="/revistas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-black text-white" style={{ textDecoration: "none", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            Volver a Revistas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Header theme="light" />
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <Link to="/revistas" className="inline-flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#666", textDecoration: "none", fontWeight: 500 }}>
          <ArrowLeft size={14} /> Volver a Revistas
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-1 rounded-lg overflow-hidden border" style={{ borderColor: "#ebebeb" }}>
            <img
              src={revista.portada ? (revista.portada.startsWith("http") ? revista.portada : `http://localhost:3000${revista.portada}`) : ""}
              alt={revista.nombre}
              style={{ width: "100%", height: "260px", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="p-6" style={{ background: "#fafafa" }}>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2.5" style={{ borderBottom: "1px solid #eef0f2" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", fontWeight: 500 }}>Periodicidad:</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", fontWeight: 600 }}>{revista.periodicidad || "-"}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5" style={{ borderBottom: "1px solid #eef0f2" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", fontWeight: 500 }}>ISSN:</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", fontWeight: 600 }}>{revista.issn || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", fontWeight: 500 }}>Volúmenes:</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", fontWeight: 600 }}>{revista.volumenes?.length ?? 0} publicados</span>
                </div>
                <div className="flex justify-between items-center pt-2.5" style={{ borderTop: "1px solid #eef0f2" }}>
                  <span className="flex items-center gap-1.5" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", fontWeight: 500 }}><Eye size={14} /> Vistas:</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", fontWeight: 600 }}>{stats?.totalViews ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", fontWeight: 500 }}><Download size={14} /> Descargas:</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", fontWeight: 600 }}>{stats?.totalDownloads ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "38px", fontWeight: 600, color: "#0b0b0b", marginBottom: "16px", letterSpacing: "-0.02em" }}>
              {revista.nombre}
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", color: "#444", lineHeight: 1.7, marginBottom: "32px" }}>
              {revista.descripcion || "No hay descripción disponible para esta revista."}
            </p>

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "32px" }}>
              <div className="flex items-center gap-2 mb-6">
                <div style={{ width: "3px", height: "18px", background: "#3ecf8e", borderRadius: "1px" }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 600, color: "#0b0b0b" }}>
                  Volúmenes Publicados
                </h2>
              </div>

              {revista.volumenes?.length === 0 ? (
                <div className="p-8 rounded text-center" style={{ border: "1px dashed #ddd", background: "#fafafa" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888" }}>
                    No se han publicado volúmenes para esta revista todavía.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {revista.volumenes?.map((volume, index) => {
                    const issueCount = volume.numeros?.length ?? 0;
                    const volStats = stats?.volumenes?.find((v: any) => v.id === volume.id);

                    return (
                      <motion.div key={volume.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                        <Link
                          to={`/revistas/${revista.id}/volumen/${volume.id}`}
                          className="flex items-center justify-between p-5 rounded-lg group"
                          style={{ border: "1px solid #ebebeb", background: "#ffffff", textDecoration: "none", transition: "all 0.2s" }}
                        >
                          <div className="flex items-start gap-4">
                            <div style={{ width: "42px", height: "42px", borderRadius: "6px", background: "rgba(62, 207, 142, 0.08)", color: "#3ecf8e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <BookOpen size={20} />
                            </div>
                            <div>
                              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>
                                Volumen {volume.numero_volumen}
                              </h3>
                              <div className="flex items-center gap-4 text-sm" style={{ color: "#888", fontFamily: "'Inter', sans-serif" }}>
                                <span className="flex items-center gap-1"><Calendar size={12} /> {issueCount} número{issueCount !== 1 ? "s" : ""}</span>
                                <span className="flex items-center gap-1"><Eye size={12} /> {volStats?.views ?? 0}</span>
                                <span className="flex items-center gap-1"><Download size={12} /> {volStats?.downloads ?? 0}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f5f5f5", color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ArrowRight size={14} />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
