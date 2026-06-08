import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, Quote, Filter, Loader2, Eye, User } from "lucide-react";
import { api } from "../api/api";
import { HeroCarousel } from "../components/HeroCarousel";
import { Footer } from "../components/Footer";
import { PublishSection } from "../components/PublishSection";
import { InfiniteArticleFeed } from "../components/InfiniteArticleFeed";

function getAllAuthors(a: any): { name: string; institution?: string }[] {
  const authors: { name: string; institution?: string }[] = [];
  if (a.autor_principal) {
    const ap = a.autor_principal;
    authors.push({
      name: [ap.nombre, ap.apellido].filter(Boolean).join(" "),
      institution: ap.afiliacion_institucional || "",
    });
  }
  if (a.autores_secundarios && Array.isArray(a.autores_secundarios)) {
    for (const as of a.autores_secundarios) {
      const u = as.usuario || as.Usuario;
      if (u) {
        authors.push({
          name: [u.nombre, u.apellido].filter(Boolean).join(" "),
          institution: u.afiliacion_institucional || "",
        });
      }
    }
  }
  return authors;
}

function toCardArticle(a: any) {
  const authors = getAllAuthors(a);
  const linea = a.lineas_investigacion?.nombre || "Sin categoría";
  const fecha = a.fecha_publicacion || a.fecha_recepcion || "";
  const img = a.img ? (a.img.startsWith("http") ? a.img : `http://localhost:3000${a.img}`) : "";
  const tags = a.palabras_clave ? a.palabras_clave.split(",").map((t: string) => t.trim()) : [];

  return {
    id: String(a.id),
    slug: String(a.id),
    title: a.titulo_es || "",
    subtitle: a.titulo_en || "",
    category: linea,
    categoryColor: "#3ecf8e",
    type: a.status || "publicado",
    authors,
    date: fecha,
    doi: a.doi || "",
    abstract: a.resumen_es || "",
    image: img,
    tags,
    readTime: "5 min",
    views: a.views || 0,
    revista: a.revista?.nombre || "Revista SaberUnerg",
    volumen: a.numero_revista?.volumen?.numero_volumen || "",
    numero: a.numero_revista?.numero || "",
    pages: a.pages || "",
  };
}

function formatAPA7(authors: { name: string }[], year: number, title: string, revista: string, volumen: string, numero: string, pages: string, doi: string) {
  const authorStr = authors.length > 0
    ? authors.map(a => {
        const parts = a.name.replace(/^(Dr\.|Dra\.)\s/, "").split(" ");
        const lastName = parts[parts.length - 1];
        const initials = parts.slice(0, -1).map(n => n[0] + ".").join(" ");
        return `${lastName}, ${initials}`;
      }).join(", ")
    : "Autor";

  const volNum = volumen ? `${volumen}${numero ? `(${numero})` : ""}` : "";
  const pageStr = pages || "1-20";
  const doiStr = doi ? `https://doi.org/${doi}` : "https://doi.org/10.xxxx/placeholder";

  return `${authorStr} (${year}). ${title}. ${revista}, ${volNum ? `${volNum}, ` : ""}${pageStr}. ${doiStr}`;
}

const feedCategories = [
  { id: "all", label: "Todos" },
  { id: "biologia", label: "Biología" },
  { id: "quimica", label: "Química" },
  { id: "matematicas", label: "Matemáticas" },
  { id: "sistemas", label: "Sistemas" },
  { id: "salud", label: "Salud" },
  { id: "electronica", label: "Electrónica" },
];

export function HomePage() {
  const [rawArticles, setRawArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeedCategory, setActiveFeedCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.articulos.fetchPublicados();
        setRawArticles(Array.isArray(data) ? data : []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const articles = useMemo(() => rawArticles.map(toCardArticle), [rawArticles]);

  const feedArticles = useMemo(() => {
    if (activeFeedCategory === "all") return articles;
    return articles.filter((a) => {
      const cat = a.category.toLowerCase();
      const map: Record<string, string[]> = {
        biologia: ["ecología tropical", "biodiversidad y conservación", "biología molecular y celular", "biología"],
        quimica: ["química ambiental", "química orgánica", "química"],
        matematicas: ["matemáticas aplicadas", "estadística y probabilidad", "matemáticas"],
        sistemas: ["inteligencia artificial", "desarrollo de software", "redes y seguridad"],
        salud: ["investigación biomédica", "enfermedades infecciosas", "epidemiología", "salud comunitaria", "salud"],
        electronica: ["electrónica y control", "telecomunicaciones", "electrónica"],
      };
      return (map[activeFeedCategory] || []).some((m) => cat.includes(m));
    });
  }, [activeFeedCategory, articles]);

  const featuredRecent = articles[0];
  const sideArticles = articles.slice(1, 3);
  const editorialArticles = articles.slice(0, 3);
  const extraArticles = articles.slice(3, 6);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of articles) {
      const cat = a.category.toLowerCase();
      for (const [key, labels] of Object.entries({
        biologia: ["ecología", "biodiversidad", "biología"],
        quimica: ["química"],
        matematicas: ["matemáticas", "estadística"],
        sistemas: ["inteligencia artificial", "software", "redes"],
        salud: ["epidemiología", "salud", "biomédica", "infecciosas"],
        electronica: ["electrónica", "telecomunicaciones"],
      })) {
        if (labels.some((l) => cat.includes(l))) {
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }
    return counts;
  }, [articles]);

  if (loading) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={28} color="#888" className="animate-spin" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginLeft: "12px" }}>Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* HERO */}
      <HeroCarousel slides={articles.filter((_, i) => i < 3)} />

      {/* RECENT ARTICLES */}
      {featuredRecent && (
        <section className="max-w-[1200px] mx-auto px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.01em" }}>
                Artículos Recientes
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#aaa", marginTop: "2px", fontStyle: "italic" }}>Recent Publications</p>
            </div>
            <Link to="/articulos" className="flex items-center gap-1.5" style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#666", textDecoration: "none" }}>
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Link to={`/articulo/${featuredRecent.slug}`} className="block group" style={{ textDecoration: "none" }}>
                <div className="relative overflow-hidden rounded" style={{ aspectRatio: "16/9", background: "#0b0b0b" }}>
                  {featuredRecent.image ? (
                    <img src={featuredRecent.image} alt={featuredRecent.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ opacity: 0.82 }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                      <span style={{ color: "#3ecf8e", fontSize: "48px", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{featuredRecent.title[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      {featuredRecent.category}
                    </span>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.01em", marginBottom: "4px" }}>
                      {featuredRecent.title}
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                      {featuredRecent.authors[0]?.name || ""} · {featuredRecent.date} · <Eye size={10} className="inline" /> {featuredRecent.views || 0} vistas
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", lineHeight: 1.6, flex: 1 }}>
                    {featuredRecent.abstract.length > 160 ? featuredRecent.abstract.slice(0, 160) + "..." : featuredRecent.abstract}
                  </p>
                  <div className="flex-shrink-0 text-right">
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>{featuredRecent.date}</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {sideArticles.map((article) => (
                <Link key={article.id} to={`/articulo/${article.slug}`} className="block group" style={{ textDecoration: "none" }}>
                  <article className="flex gap-3 pb-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: "80px", height: "64px", background: "#111" }}>
                      {article.image ? (
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a2e" }}>
                          <span style={{ color: "#3ecf8e", fontSize: "18px", fontFamily: "'Playfair Display', serif" }}>{article.title[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                        {article.category}
                      </p>
                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, letterSpacing: "-0.005em", marginBottom: "3px" }}>
                        {article.title}
                      </h4>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb", marginBottom: "2px" }}>{article.date}</p>
                      <div className="flex items-center gap-1">
                        <User size={10} color="#ccc" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>{article.authors[0]?.name || ""}</span>
                        <span style={{ color: "#ddd", fontSize: "11px" }}>·</span>
                        <Eye size={10} color="#ccc" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>{article.views || 0} vistas</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              {/* Citation card */}
              {featuredRecent && (
                <div className="rounded p-4" style={{ background: "#f8f8f8", border: "1px solid #ebebeb" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div style={{ width: "6px", height: "6px", background: "#3ecf8e", borderRadius: "50%" }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Herramienta de Cita (APA 7)
                    </p>
                  </div>
                  <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "15px", color: "#555", lineHeight: 1.6, marginBottom: "12px", fontStyle: "italic" }}>
                    {formatAPA7(
                      featuredRecent.authors,
                      parseInt(featuredRecent.date?.substring(0, 4) || "2024"),
                      featuredRecent.title,
                      featuredRecent.revista,
                      featuredRecent.volumen,
                      featuredRecent.numero,
                      featuredRecent.pages,
                      featuredRecent.doi
                    )}
                  </p>
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333", background: "#fff", border: "1px solid #e0e0e0", cursor: "pointer", fontWeight: 500 }}
                    onClick={() => navigator.clipboard?.writeText(formatAPA7(
                      featuredRecent.authors,
                      parseInt(featuredRecent.date?.substring(0, 4) || "2024"),
                      featuredRecent.title,
                      featuredRecent.revista,
                      featuredRecent.volumen,
                      featuredRecent.numero,
                      featuredRecent.pages,
                      featuredRecent.doi
                    ))}
                  >
                    Copiar Cita
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* EDITORIAL SUGGESTIONS */}
      {editorialArticles.length >= 3 && (
        <section className="max-w-[1200px] mx-auto px-6 pb-14">
          <div className="mb-8">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.01em" }}>
              Sugerencias Editoriales
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#aaa", marginTop: "2px", fontStyle: "italic" }}>Recent Discoveries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <Link to={`/articulo/${editorialArticles[0].slug}`} className="md:col-span-5 group block" style={{ textDecoration: "none" }}>
              <div className="relative rounded overflow-hidden h-full" style={{ minHeight: "280px", background: "#111" }}>
                {editorialArticles[0].image ? (
                  <img src={editorialArticles[0].image} alt={editorialArticles[0].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ opacity: 0.6 }} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
                    <span style={{ color: "#3ecf8e", fontSize: "64px", fontFamily: "'Playfair Display', serif" }}>{editorialArticles[0].title[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
                    {editorialArticles[0].category}
                  </p>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: 600, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: "8px" }}>
                    {editorialArticles[0].title}
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.45)" }}>
                    {editorialArticles[0].authors[0]?.name} · {editorialArticles[0].date}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Eye size={10} color="rgba(255,255,255,0.35)" />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>{editorialArticles[0].views || 0} vistas</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="rounded p-5 flex flex-col justify-center flex-1" style={{ background: "#f8f8f8", border: "1px solid #ebebeb", minHeight: "130px" }}>
                <Quote size={18} color="#d0d0d0" className="mb-3" />
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "17px", fontStyle: "italic", color: "#333", lineHeight: 1.5, marginBottom: "8px" }}>
                  La ciencia avanza cuando compartimos el conocimiento. Cada artículo publicado es un paso hacia el futuro.
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb", letterSpacing: "0.05em", textTransform: "uppercase" }}>EDITORIAL</p>
              </div>

              <div className="rounded p-5 flex flex-col justify-center" style={{ background: "#0b0b0b", minHeight: "130px" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: "8px" }}>
                  {articles.length}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.5 }}>
                  ARTÍCULOS PUBLICADOS
                </p>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-4">
              {editorialArticles[2] && (
                <Link to={`/articulo/${editorialArticles[2].slug}`} className="block group flex-1" style={{ textDecoration: "none" }}>
                  <div className="rounded p-5 h-full" style={{ border: "1px solid #ebebeb", minHeight: "140px" }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                      {editorialArticles[2].category}
                    </p>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: "6px" }}>
                      {editorialArticles[2].title}
                    </h4>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999", lineHeight: 1.5, marginBottom: "8px" }}>
                      {editorialArticles[2].subtitle ? editorialArticles[2].subtitle.slice(0, 80) + "..." : editorialArticles[2].abstract.slice(0, 80) + "..."}
                    </p>
                    <div className="flex items-center gap-1">
                      <User size={10} color="#bbb" />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>{editorialArticles[2].authors[0]?.name || ""}</span>
                      <span style={{ color: "#ddd", fontSize: "11px" }}>·</span>
                      <Eye size={10} color="#bbb" />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>{editorialArticles[2].views || 0} vistas</span>
                    </div>
                  </div>
                </Link>
              )}
              {editorialArticles[1] && (
                <Link to={`/articulo/${editorialArticles[1].slug}`} className="block group" style={{ textDecoration: "none" }}>
                  <div className="relative rounded overflow-hidden" style={{ height: "128px", background: "#111" }}>
                    {editorialArticles[1].image ? (
                      <img src={editorialArticles[1].image} alt={editorialArticles[1].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ opacity: 0.7 }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#16213e" }}>
                        <span style={{ color: "#3ecf8e", fontSize: "28px", fontFamily: "'Playfair Display', serif" }}>{editorialArticles[1].title[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                        {editorialArticles[1].category}
                      </p>
                      <h5 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600, color: "#fff", lineHeight: 1.3, marginBottom: "2px" }}>
                        {editorialArticles[1].title}
                      </h5>
                      <div className="flex items-center gap-1">
                        <Eye size={10} color="rgba(255,255,255,0.4)" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{editorialArticles[1].views || 0} vistas</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {extraArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {extraArticles.map((article) => (
                <Link key={article.id} to={`/articulo/${article.slug}`} className="block group" style={{ textDecoration: "none" }}>
                  <article className="flex gap-3 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: "72px", height: "58px", background: "#111" }}>
                      {article.image ? (
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "#1a1a2e" }}>
                          <span style={{ color: "#3ecf8e", fontSize: "16px", fontFamily: "'Playfair Display', serif" }}>{article.title[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>
                        {article.category}
                      </p>
                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "3px" }}>
                        {article.title}
                      </h4>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#bbb", marginBottom: "2px" }}>{article.date}</p>
                      <div className="flex items-center gap-1">
                        <User size={10} color="#ccc" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>{article.authors[0]?.name || ""}</span>
                        <span style={{ color: "#ddd", fontSize: "11px" }}>·</span>
                        <Eye size={10} color="#ccc" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>{article.views || 0} vistas</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* DIVIDER */}
      <div style={{ background: "#f7f7f7", borderTop: "1px solid #efefef", borderBottom: "1px solid #efefef" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.01em" }}>
              Todas las Investigaciones
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa", marginTop: "2px" }}>
              {articles.length} artículos publicados
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={12} color="#aaa" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>Filtrar por disciplina</span>
          </div>
        </div>
      </div>

      {/* INFINITE FEED */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-center gap-2 flex-wrap mb-10 pb-6" style={{ borderBottom: "1px solid #f0f0f0" }}>
          {feedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFeedCategory(cat.id)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: "15px",
                fontWeight: activeFeedCategory === cat.id ? 600 : 400,
                color: activeFeedCategory === cat.id ? "#0b0b0b" : "#999",
                background: activeFeedCategory === cat.id ? "#0b0b0b" : "transparent",
                border: `1px solid ${activeFeedCategory === cat.id ? "#0b0b0b" : "#e8e8e8"}`,
                borderRadius: "20px", padding: "5px 14px", cursor: "pointer",
                letterSpacing: activeFeedCategory === cat.id ? "0.04em" : "0", transition: "all 0.2s",
              }}
            >
              <span style={{ color: activeFeedCategory === cat.id ? "#fff" : "#666" }}>{cat.label}</span>
            </button>
          ))}
        </div>

        {feedArticles.length > 0 ? (
          <InfiniteArticleFeed key={activeFeedCategory} articles={feedArticles} />
        ) : (
          <div className="text-center py-20">
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", fontStyle: "italic", color: "#ccc", marginBottom: "8px" }}>
              No hay artículos en esta categoría aún.
            </p>
            <button onClick={() => setActiveFeedCategory("all")}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#666", background: "none", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", marginTop: "12px" }}>
              Ver todos los artículos
            </button>
          </div>
        )}
      </section>

      <PublishSection />

      {/* CATEGORIES STRIP */}
      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-6">
          <div style={{ width: "20px", height: "1px", background: "#0b0b0b" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Explorar por Área
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {feedCategories.filter((c) => c.id !== "all").map((cat) => {
            const count = categoryCount[cat.id] || 0;
            return (
              <Link key={cat.id} to={`/articulos`} className="block rounded p-4 group"
                style={{ border: "1px solid #f0f0f0", textDecoration: "none", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#3ecf8e"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#f0f0f0"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <div style={{ width: "24px", height: "3px", background: "#3ecf8e", borderRadius: "2px", marginBottom: "12px" }} />
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", marginBottom: "4px" }}>{cat.label}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#bbb" }}>{count} {count === 1 ? "artículo" : "artículos"}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
