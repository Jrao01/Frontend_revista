import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useParams, Link } from "react-router";
import { api } from "../api/api";
import { ArrowLeft, BookOpen, Calendar, HelpCircle, ChevronLeft, ChevronRight, User, Loader2, Eye, Download } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

export function VolumeDetailPage() {
  const { id, volumeId } = useParams<{ id: string; volumeId: string }>();
  const [revista, setRevista] = useState<any>(null);
  const [volume, setVolume] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedNumId, setSelectedNumId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!id || !volumeId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const revData = await api.revistas.fetchById(id);
        setRevista(revData);

        const vol = revData.volumenes?.find((v: any) => String(v.id) === String(volumeId));
        if (!vol) {
          setError("Volumen no encontrado");
          setLoading(false);
          return;
        }
        setVolume(vol);

        const allApproved = await api.articulos.fetchPublicados(id);
        const numeroIds = vol.numeros?.map((n: any) => n.id) || [];
        const volArticles = Array.isArray(allApproved)
          ? allApproved.filter((a: any) => numeroIds.includes(a.numero_revista_id))
          : [];
        setArticles(volArticles);

        try {
          const statsData = await api.statsContent.getRevistaStats(id);
          setStats(statsData);
        } catch {}
      } catch (err: any) {
        setError(err.message || "Error al cargar el volumen");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, volumeId]);

  if (loading) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[1200px] mx-auto px-6 py-32 text-center">
          <Loader2 size={32} className="animate-spin" color="#888" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>Cargando volumen...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !revista || !volume) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <HelpCircle size={48} color="#e05252" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: "#0b0b0b", marginBottom: "10px" }}>
            Volumen No Encontrado
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", marginBottom: "24px" }}>
            {error || "No pudimos encontrar el recurso solicitado."}
          </p>
          <Link to="/revistas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-black text-white" style={{ textDecoration: "none", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            Volver a Revistas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const numeros = volume.numeros || [];
  const sortedVols = (revista.volumenes || []).slice().sort((a: any, b: any) => b.numero_volumen - a.numero_volumen);
  const currentIdx = sortedVols.findIndex((v: any) => String(v.id) === String(volumeId));
  const prevVolume = currentIdx < sortedVols.length - 1 ? sortedVols[currentIdx + 1] : null;
  const nextVolume = currentIdx > 0 ? sortedVols[currentIdx - 1] : null;

  const publicationYear = numeros.length > 0 ? numeros.map((n: any) => n.anio).filter(Boolean).join(", ") : "-";

  const filteredArticles = selectedNumId === "all"
    ? articles
    : articles.filter((a: any) => String(a.numero_revista_id) === selectedNumId);

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Header theme="light" />

      <div className="max-w-[1200px] mx-auto px-6 pt-8 flex items-center justify-between">
        <Link to={`/revistas/${revista.id}`} className="inline-flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#666", textDecoration: "none", fontWeight: 500 }}>
          <ArrowLeft size={14} /> Volver a {revista.nombre}
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="p-8 rounded-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: "linear-gradient(90deg, #0b0b0b 0%, #1a1a1a 100%)", color: "#ffffff" }}>
          <div className="flex items-center gap-4">
            <div style={{ width: "56px", height: "56px", borderRadius: "8px", background: "rgba(62, 207, 142, 0.15)", color: "#3ecf8e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <BookOpen size={28} />
            </div>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                {revista.nombre}
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: 600, marginBottom: "6px", lineHeight: 1.2 }}>
                Volumen {volume.numero_volumen}
              </h1>
              <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                <span>{numeros.length} número{numeros.length !== 1 ? "s" : ""}</span>
                <span>•</span>
                <span>{articles.length} artículos totales</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-10 pb-6" style={{ borderBottom: "1px solid #f0f0f0" }}>
          {prevVolume ? (
            <Link to={`/revistas/${revista.id}/volumen/${prevVolume.id}`} className="flex items-center gap-2 group" style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555", textDecoration: "none", fontWeight: 500 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} className="group-hover:border-black group-hover:bg-black group-hover:text-white">
                <ChevronLeft size={16} />
              </div>
              <span className="hidden sm:inline">Vol. {prevVolume.numero_volumen}</span>
            </Link>
          ) : <div style={{ width: "10px" }} />}

          {nextVolume ? (
            <Link to={`/revistas/${revista.id}/volumen/${nextVolume.id}`} className="flex items-center gap-2 group" style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555", textDecoration: "none", fontWeight: 500 }}>
              <span className="hidden sm:inline">Vol. {nextVolume.numero_volumen}</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} className="group-hover:border-black group-hover:bg-black group-hover:text-white">
                <ChevronRight size={16} />
              </div>
            </Link>
          ) : <div style={{ width: "10px" }} />}
        </div>

        {numeros.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div style={{ width: "3px", height: "16px", background: "#3ecf8e", borderRadius: "1px" }} />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b" }}>
                Números del Volumen
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedNumId("all")}
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: selectedNumId === "all" ? 600 : 400,
                  color: selectedNumId === "all" ? "#fff" : "#555",
                  background: selectedNumId === "all" ? "#0b0b0b" : "transparent",
                  border: `1px solid ${selectedNumId === "all" ? "#0b0b0b" : "#e0e0e0"}`,
                  borderRadius: "20px", padding: "6px 16px", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                Todos
              </button>
              {numeros.map((num: any) => {
                const volStats = stats?.volumenes?.find((v: any) => v.id === volume.id);
                const numStats = volStats?.numeros?.find((n: any) => n.id === num.id);
                return (
                  <div key={num.id} className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedNumId(String(num.id))}
                      style={{
                        fontFamily: "'Inter', sans-serif", fontSize: "14px",
                        fontWeight: selectedNumId === String(num.id) ? 600 : 400,
                        color: selectedNumId === String(num.id) ? "#fff" : "#555",
                        background: selectedNumId === String(num.id)
                          ? (num.status === "publicado" ? "#2ea876" : "#c48800")
                          : "transparent",
                        border: `1px solid ${selectedNumId === String(num.id)
                          ? (num.status === "publicado" ? "#2ea876" : "#c48800")
                          : "#e0e0e0"}`,
                        borderRadius: "20px", padding: "6px 16px", cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      Nº {num.numero} — {num.titulo_edicion || num.anio || ""}
                    </button>
                    {num.status === "publicado" && (
                      <a
                        href={api.galerada.descargarNumeroPDF(num.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={async (e) => {
                          try {
                            await api.statsContent.incrementNumeroDownload(num.id);
                            const updatedStats = await api.statsContent.getRevistaStats(id);
                            setStats(updatedStats);
                          } catch {}
                        }}
                        style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          border: "1px solid #e0e0e0", background: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", transition: "all 0.2s", textDecoration: "none",
                        }}
                        title={`Descargar PDF del Nº ${num.numero} completo (${numStats?.downloads ?? 0} descargas)`}
                      >
                        <Download size={12} color="#666" />
                      </a>
                    )}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#999" }}>
                      <Eye size={10} className="inline" /> {numStats?.views ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-6">
            <div style={{ width: "3px", height: "18px", background: "#9b7fd4", borderRadius: "1px" }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 600, color: "#0b0b0b" }}>
              Artículos{selectedNumId !== "all" ? ` — Nº ${numeros.find((n: any) => String(n.id) === selectedNumId)?.numero || ""}` : " en este Volumen"}
            </h2>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", marginLeft: "8px" }}>
              ({filteredArticles.length})
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center border rounded-lg bg-gray-50" style={{ borderColor: "#ebebeb" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888" }}>
                {selectedNumId === "all"
                  ? "No hay artículos vinculados a este volumen todavía."
                  : "No hay artículos en este número."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredArticles.map((article: any) => {
                const principal = article.autor_principal;
                const coautores = article.autores_secundarios
                  ? article.autores_secundarios.map((as: any) => {
                      const u = as.usuario || as.Usuario;
                      return u ? [u.nombre, u.apellido].filter(Boolean).join(" ") : "";
                    }).filter(Boolean)
                  : [];
                const allAuthors = [
                  principal ? [principal.nombre, principal.apellido].filter(Boolean).join(" ") : "",
                  ...coautores
                ].filter(Boolean);
                const authorsStr = allAuthors.join(", ");
                const linea = article.lineas_investigacion?.nombre || "";
                const img = article.img ? (article.img.startsWith("http") ? article.img : `http://localhost:3000${article.img}`) : "";
                const fecha = article.fecha_publicacion || article.fecha_recepcion || "";

                return (
                  <Link key={article.id} to={`/articulo/${article.id}`} className="block group" style={{ textDecoration: "none" }}>
                    <div className="p-6 rounded-lg transition-all" style={{ border: "1px solid #ebebeb", background: "#ffffff" }}>
                      <div className="flex flex-col sm:flex-row gap-6 justify-between">
                        <div className="flex-1">
                          {linea && (
                            <div className="flex items-center gap-2 mb-2">
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#3ecf8e", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                {linea}
                              </span>
                            </div>
                          )}
                          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "8px" }}>
                            {article.titulo_es}
                          </h3>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", lineHeight: 1.5, marginBottom: "16px", maxWidth: "780px" }}>
                            {(article.resumen_es || "").slice(0, 160)}...
                          </p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-3">
                              {authorsStr && (
                                <div className="flex items-center gap-1.5" style={{ color: "#444" }}>
                                  <User size={13} color="#888" />
                                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500 }}>{authorsStr}</span>
                                </div>
                              )}
                              {fecha && (
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888" }}>
                                  <Calendar size={12} className="inline mr-1" />{fecha}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye size={13} color="#888" />
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888" }}>
                                {article.views || 0} vistas
                              </span>
                            </div>
                          </div>
                        </div>

                        {img && (
                          <div className="w-full sm:w-[120px] h-[90px] rounded overflow-hidden flex-shrink-0" style={{ background: "#f0f0f0" }}>
                            <img src={img} alt={article.titulo_es} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
