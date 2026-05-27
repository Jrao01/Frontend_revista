import { useParams, Link } from "react-router";
import { useState } from "react";
import { Calendar, Clock, FileText, Copy, Check, Tag, ChevronRight, BookOpen, Share2, Bookmark, Download } from "lucide-react";
import { articles } from "../data/articles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { revistas } from "../data/revistas";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug) || articles[7];
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Dynamic journal lookup based on our revistas data structure
  const journalInfo = (() => {
    for (const r of revistas) {
      for (const v of r.volumes) {
        if (v.articleIds.includes(article.id)) {
          return { revista: r, volume: v };
        }
      }
    }
    return null;
  })();

  const citationText = `${article.authors.map(a => {
    const parts = a.name.replace(/^(Dr\.|Dra\.)\s/, "").split(" ");
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(n => n[0] + ".").join("");
    return `${lastName}, ${initials}`;
  }).join("; ")} (2024). ${article.title}. ${journalInfo ? journalInfo.revista.name : "Revista CienciaEduc"}, ${journalInfo ? journalInfo.volume.volumeNumber : (article.volume || "14")}(${journalInfo ? journalInfo.volume.issueNumber : (article.issue || "2")}), ${article.pages || "1–20"}. https://doi.org/${article.doi}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedArticles = articles
    .filter((a) => a.id !== article.id)
    .slice(0, 4);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Breadcrumb */}
      <div className="border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-2">
          <Link
            to="/"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#aaa",
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Inicio
          </Link>
          <ChevronRight size={11} color="#ddd" />
          <Link
            to={`/categoria/${article.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "-")}`}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#aaa",
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {article.category}
          </Link>
          <ChevronRight size={11} color="#ddd" />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#666",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {article.type}
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* MAIN CONTENT */}
          <main>
            {/* Title block */}
            <header className="mb-8">
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(26px, 3.5vw, 40px)",
                  fontWeight: 600,
                  color: "#0b0b0b",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: "12px",
                }}
              >
                {article.title}
              </h1>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: "17px",
                  fontStyle: "italic",
                  color: "#999",
                  lineHeight: 1.5,
                  marginBottom: "22px",
                }}
              >
                {article.subtitle}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {article.authors.map((author, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: article.categoryColor + "22" }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: article.categoryColor,
                          fontWeight: 700,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {author.name
                          .replace(/^(Dr\.|Dra\.)\s/, "")
                          .split(" ")[0]?.[0] || "A"}
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "15px",
                          color: "#333",
                          fontWeight: 500,
                        }}
                      >
                        {author.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "13px",
                          color: "#aaa",
                        }}
                      >
                        {author.institution}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} color="#bbb" />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      color: "#aaa",
                    }}
                  >
                    {article.date}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} color="#bbb" />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      color: "#aaa",
                    }}
                  >
                    {article.readTime}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText size={11} color="#bbb" />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      color: "#aaa",
                    }}
                  >
                    DOI: {article.doi}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    color: bookmarked ? article.categoryColor : "#555",
                    border: `1px solid ${bookmarked ? article.categoryColor : "#e0e0e0"}`,
                    background: bookmarked ? article.categoryColor + "11" : "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <Bookmark
                    size={12}
                    fill={bookmarked ? article.categoryColor : "none"}
                    color={bookmarked ? article.categoryColor : "#555"}
                  />
                  {bookmarked ? "Guardado" : "Guardar"}
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    color: "#555",
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <Share2 size={12} />
                  Compartir
                </button>
              </div>
            </header>

            {/* Divider */}
            <div style={{ height: "1px", background: "#f0f0f0", marginBottom: "32px" }} />

            {/* Abstract */}
            <div
              className="mb-8 p-5 rounded"
              style={{
                background: "#fafafa",
                borderLeft: `3px solid ${article.categoryColor}`,
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#aaa",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Resumen
              </p>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: "17px",
                  color: "#444",
                  lineHeight: 1.75,
                }}
              >
                {article.abstract}
              </p>
            </div>

            {/* Article sections */}
            {article.sections?.map((section, index) => (
              <div key={index} className="mb-8">
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#0b0b0b",
                    letterSpacing: "-0.01em",
                    marginBottom: "12px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {section.title}
                </h2>
                <p
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    fontSize: "17px",
                    color: "#333",
                    lineHeight: 1.85,
                  }}
                >
                  {section.content}
                </p>
              </div>
            ))}

            {/* Pull quote */}
            {article.quote && (
              <div
                className="my-10 py-6 px-8"
                style={{ borderLeft: "3px solid #0b0b0b" }}
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontStyle: "italic",
                    color: "#0b0b0b",
                    lineHeight: 1.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {article.quote}
                </p>
              </div>
            )}

            {/* Figure */}
            {article.figureImage && (
              <figure className="my-10">
                <div
                  className="rounded overflow-hidden"
                  style={{ background: "#0b0b0b" }}
                >
                  <img
                    src={article.figureImage}
                    alt={article.figureCaption || "Figure"}
                    className="w-full object-cover"
                    style={{ maxHeight: "440px", opacity: 0.92 }}
                  />
                </div>
                {article.figureCaption && (
                  <figcaption
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "#aaa",
                      marginTop: "10px",
                      lineHeight: 1.5,
                    }}
                  >
                    {article.figureCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Tags */}
            <div className="mt-10 pt-6" style={{ borderTop: "1px solid #f0f0f0" }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#aaa",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Etiquetas
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/buscar?q=${encodeURIComponent(tag)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "#555",
                      background: "#f5f5f5",
                      border: "1px solid #e8e8e8",
                      textDecoration: "none",
                    }}
                  >
                    <Tag size={10} color="#bbb" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </main>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            {/* Publication details card */}
            <div
              className="rounded p-5"
              style={{ border: "1px solid #e8e8e8", background: "#ffffff", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={13} color="#aaa" />
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#666",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Revista de Origen
                </p>
              </div>

              {journalInfo ? (
                <div>
                  <h4
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "19px",
                      fontWeight: 600,
                      color: "#0b0b0b",
                      marginBottom: "6px",
                    }}
                  >
                    {journalInfo.revista.name}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "#666",
                      lineHeight: 1.5,
                      marginBottom: "14px",
                    }}
                  >
                    Volumen {journalInfo.volume.volumeNumber}, Número {journalInfo.volume.issueNumber} ({journalInfo.volume.publicationDate})
                  </p>
                  
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: "'Inter', sans-serif",
                      color: "#888",
                      borderTop: "1px solid #eee",
                      paddingTop: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <div className="flex justify-between pb-1.5">
                      <span>ISSN:</span>
                      <strong style={{ color: "#333" }}>{journalInfo.revista.issn}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <span>Páginas:</span>
                      <strong style={{ color: "#333" }}>{article.pages || "N/A"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Periodicidad:</span>
                      <strong style={{ color: "#333" }}>{journalInfo.revista.periodicity}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <h4
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "19px",
                      fontWeight: 600,
                      color: "#0b0b0b",
                      marginBottom: "4px",
                    }}
                  >
                    CienciaEduc (General)
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "14px",
                    }}
                  >
                    Volumen {article.volume || "14"}, Número {article.issue || "2"} ({article.date})
                  </p>
                  
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: "'Inter', sans-serif",
                      color: "#888",
                      borderTop: "1px solid #eee",
                      paddingTop: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <div className="flex justify-between pb-1.5">
                      <span>Páginas:</span>
                      <strong style={{ color: "#333" }}>{article.pages || "1-20"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>DOI:</span>
                      <strong style={{ color: "#333" }}>{article.doi}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* View/Download PDF Button */}
              <button
                onClick={() => {
                  setDownloading(true);
                  setTimeout(() => {
                    setDownloading(false);
                    const element = document.createElement("a");
                    const file = new Blob([
                      `REVISTA CIENTÍFICA: ${journalInfo ? journalInfo.revista.name : "CienciaEduc"}\n` +
                      `Volumen: ${journalInfo ? journalInfo.volume.volumeNumber : (article.volume || "14")}\n` +
                      `Número: ${journalInfo ? journalInfo.volume.issueNumber : (article.issue || "2")}\n` +
                      `ISSN: ${journalInfo ? journalInfo.revista.issn : "2443-4256"}\n` +
                      `Páginas: ${article.pages || "1-20"}\n` +
                      `DOI: ${article.doi}\n\n` +
                      `TÍTULO: ${article.title}\n` +
                      `SUBTÍTULO: ${article.subtitle}\n` +
                      `AUTORES: ${article.authors.map(a => `${a.name} (${a.institution})`).join(", ")}\n\n` +
                      `RESUMEN:\n${article.abstract}\n\n` +
                      `SECCIONES:\n` +
                      `${article.sections?.map(s => `--- ${s.title} ---\n${s.content}`).join("\n\n")}`
                    ], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `${article.slug}_completo.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }, 1200);
                }}
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-2.5 rounded w-full justify-center"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "#0b0b0b",
                  background: "#3ecf8e",
                  border: "none",
                  cursor: downloading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => { if(!downloading) e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { if(!downloading) e.currentTarget.style.opacity = "1"; }}
              >
                <Download size={14} />
                {downloading ? "Preparando PDF..." : "Descargar PDF Completo"}
              </button>
            </div>

            {/* Citation box */}
            <div
              className="rounded p-5"
              style={{ border: "1px solid #e8e8e8", background: "#fafafa" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={13} color="#aaa" />
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#666",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Citar este artículo
                </p>
              </div>
              <p
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: "16px",
                  color: "#666",
                  lineHeight: 1.65,
                  marginBottom: "12px",
                  fontStyle: "italic",
                }}
              >
                {citationText}
              </p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 rounded w-full justify-center"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: copied ? "#3ecf8e" : "#333",
                  background: copied ? "#3ecf8e11" : "#fff",
                  border: `1px solid ${copied ? "#3ecf8e" : "#e0e0e0"}`,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "¡Copiado!" : "Copiar Cita"}
              </button>
            </div>

            {/* Editorial selection */}
            <div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                Selección Editorial
              </p>
              <div className="space-y-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/articulo/${rel.slug}`}
                    className="flex gap-3 group"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="flex-shrink-0 rounded overflow-hidden"
                      style={{
                        width: "56px",
                        height: "44px",
                        background: "#111",
                      }}
                    >
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: rel.categoryColor,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "3px",
                        }}
                      >
                        {rel.category}
                      </p>
                      <h5
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#0b0b0b",
                          lineHeight: 1.3,
                        }}
                      >
                        {rel.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags sidebar */}
            <div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                Etiquetas
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/buscar?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "#555",
                      background: "#f5f5f5",
                      border: "1px solid #eee",
                      textDecoration: "none",
                    }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="rounded p-5" style={{ background: "#0b0b0b" }}>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: "6px",
                }}
              >
                Boletín Científico
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.5,
                  marginBottom: "12px",
                }}
              >
                Recibe los últimos artículos directamente en tu correo.
              </p>
              <input
                type="email"
                placeholder="tu@correo.com"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "4px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  color: "#fff",
                  outline: "none",
                  marginBottom: "8px",
                }}
              />
              <button
                className="w-full py-2 rounded"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#0b0b0b",
                  background: "#3ecf8e",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Suscribirse
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
