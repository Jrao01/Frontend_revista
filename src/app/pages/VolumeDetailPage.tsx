import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useParams, Link, useNavigate } from "react-router";
import { revistas } from "../data/revistas";
import { articles } from "../data/articles";
import { ArrowLeft, BookOpen, Calendar, HelpCircle, Download, ChevronLeft, ChevronRight, FileText, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function VolumeDetailPage() {
  const { id, volumeId } = useParams<{ id: string; volumeId: string }>();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const revista = revistas.find((r) => r.id === id);
  if (!revista) return renderErrorState("Revista No Encontrada");

  const currentVolumeIndex = revista.volumes.findIndex((v) => v.id === volumeId);
  const volume = revista.volumes[currentVolumeIndex];

  if (!volume) return renderErrorState("Volumen No Encontrado");

  // Resolve articles in this volume
  const resolvedArticles = articles.filter((art) => volume.articleIds.includes(art.id));

  // Previous volume (older, which is index + 1 in our latest-first list)
  const prevVolume = currentVolumeIndex < revista.volumes.length - 1 ? revista.volumes[currentVolumeIndex + 1] : null;
  // Next volume (newer, which is index - 1 in our latest-first list)
  const nextVolume = currentVolumeIndex > 0 ? revista.volumes[currentVolumeIndex - 1] : null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Create a mock download trigger
      const element = document.createElement("a");
      const file = new Blob([`Descarga simulada de ${revista.name} Volumen ${volume.volumeNumber} Número ${volume.issueNumber}.`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${revista.id}_volumen_${volume.volumeNumber}_numero_${volume.issueNumber}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  function renderErrorState(title: string) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
          <HelpCircle size={48} color="#e05252" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: "#0b0b0b", marginBottom: "10px" }}>
            {title}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", marginBottom: "24px" }}>
            No pudimos encontrar el recurso solicitado. Por favor, vuelve a la sección general de revistas.
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

      {/* Navigation & breadcrumbs */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 flex items-center justify-between">
        <Link
          to={`/revistas/${revista.id}`}
          className="inline-flex items-center gap-2"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "15px",
            color: "#666",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Volver a {revista.name}
        </Link>
      </div>

      {/* Main Volume Banner */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div
          className="p-8 rounded-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: "linear-gradient(90deg, #0b0b0b 0%, #1a1a1a 100%)",
            color: "#ffffff",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "8px",
                background: "rgba(62, 207, 142, 0.15)",
                color: "#3ecf8e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOpen size={28} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#3ecf8e",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {revista.name}
              </p>
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "30px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  lineHeight: 1.2,
                }}
              >
                Volumen {volume.volumeNumber}, Número {volume.issueNumber}
              </h1>
              <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                <span>Publicado en: {volume.publicationDate}</span>
                <span>•</span>
                <span>{resolvedArticles.length} artículos científicos</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3.5 rounded font-semibold text-center"
            style={{
              background: "#3ecf8e",
              color: "#0b0b0b",
              border: "none",
              cursor: downloading ? "not-allowed" : "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              minWidth: "220px",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(62, 207, 142, 0.2)",
              transition: "opacity 0.2s, transform 0.2s",
              opacity: downloading ? 0.75 : 1,
            }}
            onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { if (!downloading) e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <Download size={16} />
            {downloading ? "Preparando PDF..." : `Descargar Vol. ${volume.volumeNumber} Nro. ${volume.issueNumber}`}
          </button>
        </div>

        {/* Volume navigation row (Anterior / Siguiente) */}
        <div
          className="flex justify-between items-center mb-10 pb-6"
          style={{ borderBottom: "1px solid #f0f0f0" }}
        >
          {prevVolume ? (
            <Link
              to={`/revistas/${revista.id}/volumen/${prevVolume.id}`}
              className="flex items-center gap-2 group"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "15px",
                color: "#555",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                className="group-hover:border-black group-hover:bg-black group-hover:text-white"
              >
                <ChevronLeft size={16} />
              </div>
              <span className="hidden sm:inline">Ver Volumen Anterior ({prevVolume.volumeNumber}.{prevVolume.issueNumber})</span>
              <span className="sm:hidden">Anterior</span>
            </Link>
          ) : (
            <div style={{ width: "10px" }} />
          )}

          {nextVolume ? (
            <Link
              to={`/revistas/${revista.id}/volumen/${nextVolume.id}`}
              className="flex items-center gap-2 group"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "15px",
                color: "#555",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              <span className="hidden sm:inline">Ver Siguiente Volumen ({nextVolume.volumeNumber}.{nextVolume.issueNumber})</span>
              <span className="sm:hidden">Siguiente</span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                className="group-hover:border-black group-hover:bg-black group-hover:text-white"
              >
                <ChevronRight size={16} />
              </div>
            </Link>
          ) : (
            <div style={{ width: "10px" }} />
          )}
        </div>

        {/* List of articles */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div style={{ width: "3px", height: "18px", background: "#9b7fd4", borderRadius: "1px" }} />
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: "#0b0b0b",
              }}
            >
              Artículos en este Volumen
            </h2>
          </div>

          {resolvedArticles.length === 0 ? (
            <div className="p-12 text-center border rounded-lg bg-gray-50" style={{ borderColor: "#ebebeb" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888" }}>
                No hay artículos vinculados a este volumen.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {resolvedArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/articulo/${article.slug}`}
                  className="block group"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="p-6 rounded-lg transition-all"
                    style={{
                      border: "1px solid #ebebeb",
                      background: "#ffffff",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0b0b0b";
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#ebebeb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex flex-col sm:flex-row gap-6 justify-between">
                      <div className="flex-1">
                        {/* Category */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: article.categoryColor || "#3ecf8e",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            {article.category}
                          </span>
                          <span style={{ color: "#ddd" }}>•</span>
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "12px",
                              color: "#888",
                              fontWeight: 500,
                            }}
                          >
                            Páginas: {article.pages || "N/A"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "20px",
                            fontWeight: 600,
                            color: "#0b0b0b",
                            lineHeight: 1.3,
                            marginBottom: "8px",
                          }}
                        >
                          {article.title}
                        </h3>

                        {/* Abstract snippet */}
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "14px",
                            color: "#666",
                            lineHeight: 1.5,
                            marginBottom: "16px",
                            maxWidth: "780px",
                          }}
                        >
                          {article.abstract.slice(0, 160)}...
                        </p>

                        {/* Authors */}
                        <div className="flex flex-wrap items-center gap-3">
                          {article.authors.map((author, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-1.5" style={{ color: "#444" }}>
                              <User size={13} color="#888" />
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500 }}>
                                {author.name}
                              </span>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888" }}>
                                ({author.institution})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cover Thumbnail */}
                      {article.image && (
                        <div
                          className="w-full sm:w-[120px] h-[90px] rounded overflow-hidden flex-shrink-0"
                          style={{ background: "#f0f0f0" }}
                        >
                          <img
                            src={article.image}
                            alt={article.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
