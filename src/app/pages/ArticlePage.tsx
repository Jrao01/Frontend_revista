import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Calendar, FileText, Copy, Check, Tag, ChevronRight, BookOpen, Share2, Bookmark, Download, Loader2, Eye, X } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { api } from "../api/api";

type BackendArticle = {
  id?: number;
  img?: string;
  image?: string;
  titulo_es?: string;
  titulo_en?: string;
  resumen_es?: string;
  resumen_en?: string;
  fecha_publicacion?: string;
  fecha_recepcion?: string;
  doi?: string;
  pages?: string;
  autor_principal?: {
    id?: number;
    nombre?: string;
    segundo_nombre?: string;
    apellido?: string;
    segundo_apellido?: string;
    afiliacion_institucional?: string;
  };
  autores_secundarios?: Array<{
    Usuario?: {
      id?: number;
      nombre?: string;
      segundo_nombre?: string;
      apellido?: string;
      segundo_apellido?: string;
      afiliacion_institucional?: string;
    };
  }>;
  revista?: { nombre?: string; descripcion?: string; issn?: string; periodicidad?: string };
  numero_revista?: { numero?: string; anio?: string; volumen?: { numero_volumen?: string } };
  lineas_investigacion?: { nombre?: string };
  views?: number;
  title?: string;
  palabras_clave?: string;
  status?: string;
};

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [backendArticle, setBackendArticle] = useState<BackendArticle | null>(null);
  const [editorialArticles, setEditorialArticles] = useState<BackendArticle[]>([]);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [viewMode, setViewMode] = useState<'resumen' | 'completo'>('resumen');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!slug) return;
      setLoading(true);
      setImgError(false);
      let articleData: BackendArticle | null = null;
      let relatedFound = false;

      try {
        if (/^\d+$/.test(slug)) {
          articleData = await api.articulos.fetchById(slug);
        } else {
          articleData = await api.articulos.fetchBySlug(slug);
        }
        setBackendArticle(articleData);

        if (articleData) {
          try {
            await api.statsContent.incrementArticleView(articleData.id as number);
          } catch (err) {
            console.warn('incrementArticleView failed', err);
          }

          try {
            const fetched = await api.articulos.fetchRelated(String(articleData.id));
            if (Array.isArray(fetched) && fetched.length > 0) {
              setEditorialArticles(fetched as BackendArticle[]);
              relatedFound = true;
            }
          } catch (err) {
            console.warn('fetchRelated failed', err);
          }
        }
      } catch (err) {
        console.warn('fetchArticle failed', err);
      }

      // Siempre cargar artículos para selección editorial desde la DB si no trajimos relacionados
      try {
        if (!relatedFound) {
          const allApproved = await api.articulos.fetchPublicados();
          if (allApproved && allApproved.length > 0) {
            const excludeId = articleData?.id;
            const filtered = excludeId
              ? (allApproved as BackendArticle[]).filter((a) => a.id !== excludeId)
              : (allApproved as BackendArticle[]);
            setEditorialArticles(filtered.slice(0, 4));
          }
        }
      } catch (err) {
        console.warn('fetchPublicados failed', err);
      }

      setLoading(false);
    };
    fetchAll();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="flex items-center justify-center py-40">
          <Loader2 size={28} color="#888" className="animate-spin" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginLeft: "12px" }}>Cargando artículo...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!backendArticle) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[1200px] mx-auto px-6 py-40 text-center">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#0b0b0b", marginBottom: "12px" }}>
            Artículo no encontrado
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888", marginBottom: "24px" }}>
            El artículo que buscas no existe o fue removido.
          </p>
          <Link to="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#3ecf8e", textDecoration: "none", fontWeight: 600 }}>
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const article = backendArticle;
  const articleImage = article?.img || article?.image;

  const authorsList = (() => {
    const result: { id?: number; name: string; institution?: string; isPrincipal?: boolean }[] = [];
    if (article.autor_principal) {
      const ap = article.autor_principal;
      result.push({
        id: ap.id,
        name: [ap.nombre, ap.segundo_nombre, ap.apellido, ap.segundo_apellido].filter(Boolean).join(" "),
        institution: ap.afiliacion_institucional,
        isPrincipal: true
      });
    }
    if (article.autores_secundarios) {
      for (const as of article.autores_secundarios) {
        if (as.Usuario) {
          const u = as.Usuario;
          result.push({
            id: u.id,
            name: [u.nombre, u.segundo_nombre, u.apellido, u.segundo_apellido].filter(Boolean).join(" "),
            institution: u.afiliacion_institucional,
            isPrincipal: false
          });
        }
      }
    }
    return result;
  })();

  const backendRevista = article?.revista;
  const backendNumero = article?.numero_revista;
  const backendVolumen = backendNumero?.volumen;

  const citationYear = article?.fecha_publicacion
    ? new Date(article.fecha_publicacion).getFullYear()
    : article?.fecha_recepcion
      ? new Date(article.fecha_recepcion).getFullYear()
      : new Date().getFullYear();

  const citationText = `${authorsList.map(a => {
    const parts = a.name.replace(/^(Dr\.|Dra\.)\s/, "").split(" ");
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(n => n[0] + ".").join(" ");
    return `${lastName}, ${initials}`;
  }).join(", ")} (${citationYear}). ${article.titulo_es}. ${backendRevista ? backendRevista.nombre : "Revista SaberUnerg"}, ${backendVolumen ? backendVolumen.numero_volumen : "1"}${backendNumero ? `(${backendNumero.numero})` : "(1)"}, ${article.pages || "1\u201320"}. https://doi.org/${article.doi || "10.xxxx/placeholder"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRelatedSlug = (rel: BackendArticle) => `/articulo/${rel.id}`;
  const getRelatedTitle = (rel: BackendArticle) => rel.titulo_es || rel.title || "";
  const getRelatedAuthor = (rel: BackendArticle) => {
    if (rel.autor_principal) {
      const ap = rel.autor_principal;
      return [ap.nombre, ap.apellido].filter(Boolean).join(" ");
    }
    if (rel.autores_secundarios && rel.autores_secundarios.length > 0) {
      const first = rel.autores_secundarios[0];
      if (first && first.Usuario) return [first.Usuario.nombre, first.Usuario.apellido].filter(Boolean).join(" ");
    }
    return "";
  };
  const getRelatedCategory = (rel: BackendArticle) => rel.lineas_investigacion?.nombre || "";
  const getRelatedImage = (rel: BackendArticle) => {
    const img = rel.img || rel.image;
    if (img) return img.startsWith("http") ? img : `http://localhost:3000${img}`;
    return "";
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Breadcrumb */}
      <div className="border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-2">
          <Link to="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa", textDecoration: "none", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Inicio
          </Link>
          <ChevronRight size={11} color="#ddd" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Artículos
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* MAIN CONTENT */}
          <main>
            {(articleImage && !imgError) ? (
              <figure className="mb-8">
                <div className="rounded overflow-hidden" style={{ background: "#f5f5f5" }}>
                  <img
                    src={articleImage.startsWith('http') ? articleImage : `http://localhost:3000${articleImage}`}
                    alt={article.titulo_es || "Imagen del artículo"}
                    className="w-full object-cover"
                    style={{ maxHeight: "440px" }}
                    onError={() => setImgError(true)}
                  />
                </div>
              </figure>
            ) : (
              <figure className="mb-8">
                <div className="rounded overflow-hidden w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", height: "240px" }}>
                  <span style={{ color: "#3ecf8e", fontSize: "64px", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    {article.titulo_es?.[0] || "?"}
                  </span>
                </div>
              </figure>
            )}

            <header className="mb-8">
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "12px" }}>
                {article.titulo_es}
              </h1>
              {article.titulo_en && (
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "17px", fontStyle: "italic", color: "#999", lineHeight: 1.5, marginBottom: "22px" }}>
                  {article.titulo_en}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {authorsList.map((author, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#3ecf8e22" }}>
                      <span style={{ fontSize: "12px", color: "#3ecf8e", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                        {author.name.replace(/^(Dr\.|Dra\.)\s/, "").split(" ")[0]?.[0] || "A"}
                      </span>
                    </div>
                    <div>
                      {author.id ? (
                        <Link to={`/autor/${author.id}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#333", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid transparent", transition: "border-color 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = "#3ecf8e")}
                          onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}>
                          {author.name}
                        </Link>
                      ) : (
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#333", fontWeight: 500 }}>{author.name}</p>
                      )}
                      {author.institution && (
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>{author.institution}</p>
                      )}
                    </div>
                  </div>
                ))}
                {article.fecha_publicacion && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} color="#bbb" />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#aaa" }}>{article.fecha_publicacion}</span>
                  </div>
                )}
                {article.fecha_recepcion && !article.fecha_publicacion && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} color="#bbb" />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#aaa" }}>{article.fecha_recepcion}</span>
                  </div>
                )}
                {article.doi && (
                  <div className="flex items-center gap-1.5">
                    <FileText size={11} color="#bbb" />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#aaa" }}>DOI: {article.doi}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <Eye size={11} color="#bbb" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#aaa" }}>
                  {article.views || 0} vistas
                </span>
              </div>

              <div className="flex items-center gap-3 mt-5 flex-wrap">
                {article.status === 'publicado' && (
                  <>
                    <a href={api.galerada.descargarPDF(String(article.id))} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
                      <Download size={12} />
                      PDF
                    </a>
                    <a href={api.galerada.descargarJATS(String(article.id))} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontWeight: 500, textDecoration: "none" }}>
                      <FileText size={12} />
                      JATS XML
                    </a>
                  </>
                )}
                <button onClick={() => setBookmarked(!bookmarked)} className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: bookmarked ? "#3ecf8e" : "#555", border: `1px solid ${bookmarked ? "#3ecf8e" : "#e0e0e0"}`, background: bookmarked ? "#3ecf8e11" : "#fff", cursor: "pointer", fontWeight: 500 }}>
                  <Bookmark size={12} fill={bookmarked ? "#3ecf8e" : "none"} color={bookmarked ? "#3ecf8e" : "#555"} />
                  {bookmarked ? "Guardado" : "Guardar"}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#555", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontWeight: 500 }}>
                  <Share2 size={12} />
                  Compartir
                </button>
              </div>
            </header>

            <div style={{ height: "1px", background: "#f0f0f0", marginBottom: "32px" }} />

            {/* Toggle Resumen / Artículo Completo */}
            <div className="flex items-center gap-0 mb-6" style={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden", display: "inline-flex" }}>
              <button
                onClick={() => setViewMode('resumen')}
                className="flex items-center gap-1.5 px-4 py-2"
                style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: viewMode === 'resumen' ? 600 : 400,
                  color: viewMode === 'resumen' ? "#fff" : "#555",
                  background: viewMode === 'resumen' ? "#0b0b0b" : "#fff",
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <BookOpen size={12} />
                Resumen
              </button>
              {article.status === 'publicado' && (
                <button
                  onClick={() => setViewMode('completo')}
                  className="flex items-center gap-1.5 px-4 py-2"
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: viewMode === 'completo' ? 600 : 400,
                    color: viewMode === 'completo' ? "#fff" : "#555",
                    background: viewMode === 'completo' ? "#0b0b0b" : "#fff",
                    border: "none", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <BookOpen size={12} />
                  Artículo Completo
                </button>
              )}
            </div>

            {viewMode === 'resumen' ? (
              <div className="mb-8">
                {article.resumen_es && (
                  <div className="mb-4 p-5 rounded" style={{ background: "#fafafa", borderLeft: "3px solid #3ecf8e" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Resumen (ES)
                    </p>
                    <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "17px", color: "#444", lineHeight: 1.75 }}>
                      {article.resumen_es}
                    </p>
                  </div>
                )}
                {article.resumen_en && (
                  <div className="p-5 rounded" style={{ background: "#fafafa", borderLeft: "3px solid #6c8ebf" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Abstract (EN)
                    </p>
                    <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "17px", fontStyle: "italic", color: "#444", lineHeight: 1.75 }}>
                      {article.resumen_en}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-8 rounded overflow-hidden" style={{ border: "1px solid #e0e0e0", background: "#fff" }}>
                <iframe
                  src={api.galerada.verHTML(String(article.id))}
                  className="w-full"
                  style={{ minHeight: "600px", border: "none" }}
                  title="Artículo Completo"
                />
              </div>
            )}

            {article.palabras_clave && (
              <div className="mt-10 pt-6" style={{ borderTop: "1px solid #f0f0f0" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                  Etiquetas
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.palabras_clave.split(",").map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                    <Link key={tag} to={`/buscar?q=${encodeURIComponent(tag)}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#555", background: "#f5f5f5", border: "1px solid #e8e8e8", textDecoration: "none" }}>
                      <Tag size={10} color="#bbb" />
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            {/* Revista de Origen */}
            <div className="rounded p-5" style={{ border: "1px solid #e8e8e8", background: "#ffffff", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={13} color="#aaa" />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Revista de Origen
                </p>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: 600, color: "#0b0b0b", marginBottom: "6px" }}>
                  {backendRevista ? backendRevista.nombre : "Sin revista asignada"}
                </h4>
                {backendRevista?.descripcion && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#999", marginBottom: "8px", lineHeight: 1.5 }}>
                    {backendRevista.descripcion}
                  </p>
                )}
                {backendVolumen && backendNumero && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", lineHeight: 1.5, marginBottom: "14px" }}>
                    Volumen {backendVolumen.numero_volumen}, Número {backendNumero.numero} ({backendNumero.anio})
                  </p>
                )}

                <div style={{ fontSize: "13px", fontFamily: "'Inter', sans-serif", color: "#888", borderTop: "1px solid #eee", paddingTop: "10px", marginBottom: "16px" }}>
                  {backendRevista && (
                    <>
                      <div className="flex justify-between pb-1.5">
                        <span>ISSN:</span>
                        <strong style={{ color: "#333" }}>{backendRevista.issn}</strong>
                      </div>
                      <div className="flex justify-between pb-1.5">
                        <span>Periodicidad:</span>
                        <strong style={{ color: "#333", textTransform: "capitalize" }}>{backendRevista.periodicidad}</strong>
                      </div>
                    </>
                  )}
                  {article.doi && (
                    <div className="flex justify-between pb-1.5">
                      <span>DOI:</span>
                      <strong style={{ color: "#333" }}>{article.doi}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Fecha publicación:</span>
                    <strong style={{ color: "#333" }}>{article.fecha_publicacion || article.fecha_recepcion || "N/A"}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setDownloading(true);
                  setTimeout(() => {
                    setDownloading(false);
                    const revistaNombre = backendRevista ? backendRevista.nombre : "SaberUnerg";
                    const volNum = backendVolumen ? backendVolumen.numero_volumen : "1";
                    const numNum = backendNumero ? backendNumero.numero : "1";
                    const issn = backendRevista ? backendRevista.issn : "2443-4256";
                    const file = new Blob([
                      `REVISTA CIENTÍFICA: ${revistaNombre}\nVolumen: ${volNum}\nNúmero: ${numNum}\nISSN: ${issn}\nDOI: ${article.doi || "N/A"}\n\nTÍTULO: ${article.titulo_es}\nSUBTÍTULO: ${article.titulo_en || ""}\nAUTORES: ${authorsList.map(a => `${a.name}${a.institution ? ` (${a.institution})` : ""}`).join(", ")}\n\nRESUMEN:\n${article.resumen_es || ""}\n\nABSTRACT:\n${article.resumen_en || ""}`
                    ], { type: 'text/plain' });
                    const element = document.createElement('a');
                    element.href = URL.createObjectURL(file);
                    element.download = `articulo-${article.id}_completo.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }, 1200);
                }}
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-2.5 rounded w-full justify-center"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", background: "#3ecf8e", border: "none", cursor: downloading ? "not-allowed" : "pointer", fontWeight: 600, transition: "opacity 0.2s" }}
              >
                <Download size={14} />
                {downloading ? "Preparando..." : "Descargar"}
              </button>
            </div>

            {/* Citar */}
            <div className="rounded p-5" style={{ border: "1px solid #e8e8e8", background: "#fafafa" }}>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={13} color="#aaa" />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Citar este artículo
                </p>
              </div>
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "16px", color: "#666", lineHeight: 1.65, marginBottom: "12px", fontStyle: "italic" }}>
                {citationText}
              </p>
              <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 rounded w-full justify-center"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: copied ? "#3ecf8e" : "#333", background: copied ? "#3ecf8e11" : "#fff", border: `1px solid ${copied ? "#3ecf8e" : "#e0e0e0"}`, cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "¡Copiado!" : "Copiar Cita"}
              </button>
            </div>

            {/* Selección Editorial — SOLO DATOS REALES */}
            {editorialArticles.length > 0 && (
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                  Selección Editorial
                </p>
                <div className="space-y-4">
                  {editorialArticles.map((rel: BackendArticle) => {
                    const relImage = getRelatedImage(rel);
                    const relTitle = getRelatedTitle(rel);
                    const relCategory = getRelatedCategory(rel);
                    const relSlug = getRelatedSlug(rel);

                    return (
                      <Link key={rel.id} to={relSlug} className="flex gap-3 group" style={{ textDecoration: "none" }}>
                        {relImage ? (
                          <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: "56px", height: "44px", background: "#111" }}>
                            <img src={relImage} alt={relTitle} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 rounded flex items-center justify-center"
                            style={{ width: "56px", height: "44px", background: "#3ecf8e15", border: "1px solid #3ecf8e30" }}>
                            <FileText size={16} color="#3ecf8e" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {relCategory && (
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#3ecf8e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>
                              {relCategory}
                            </p>
                          )}
                          <h5 style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {relTitle}
                          </h5>
                          {getRelatedAuthor(rel) && (
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#999", marginTop: "2px" }}>
                              {getRelatedAuthor(rel)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
