import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { api } from "../api/api";
import { Search, Calendar, BookOpen, Eye, User, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export function ArticulosPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [revistas, setRevistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRevista, setSelectedRevista] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [arts, revs] = await Promise.all([
          api.articulos.fetchPublicados(),
          api.revistas.fetchAll(),
        ]);
        setArticles(Array.isArray(arts) ? arts : []);
        setRevistas(Array.isArray(revs) ? revs : []);
      } catch(error) {
        console.log("Error al cargar artículos o revistas", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const categories = Array.from(new Set(articles.map((a) => a.lineas_investigacion?.nombre || "Sin categoría")));

  const allTags = Array.from(
    new Set(articles.flatMap((a) => (a.palabras_clave ? a.palabras_clave.split(",").map((t: string) => t.trim()) : [])))
  );

  const years = Array.from(
    new Set(
      articles
        .map((a) => {
          const d = a.fecha_publicacion || a.fecha_recepcion;
          return d ? d.substring(0, 4) : null;
        })
        .filter(Boolean)
    )
  ) as string[];

  const filtered = articles.filter((a) => {
    const lineaNombre = a.lineas_investigacion?.nombre || "";
    const principal = a.autor_principal;
    const coautores = a.autores_secundarios
      ? a.autores_secundarios.map((as: any) => {
          const u = as.usuario || as.Usuario;
          return u ? `${u.nombre} ${u.apellido}` : "";
        }).filter(Boolean)
      : [];
    const allAuthors = [
      principal ? [principal.nombre, principal.apellido].filter(Boolean).join(" ") : "",
      ...coautores
    ].filter(Boolean).join(", ");
    const resumen = a.resumen_es || "";
    const titulo = a.titulo_es || "";
    const tags = a.palabras_clave ? a.palabras_clave.split(",").map((t: string) => t.trim()) : [];
    const revistaNombre = a.revista?.nombre || "";

    const matchesSearch =
      !searchQuery ||
      titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resumen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allAuthors.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRevista =
      selectedRevista === "all" || revistaNombre === selectedRevista;

    const matchesCategory =
      selectedCategory === "all" || lineaNombre === selectedCategory;

    const articleDate = a.fecha_publicacion || a.fecha_recepcion || "";
    const articleYear = articleDate.substring(0, 4);
    const matchesYear = selectedYear === "all" || articleYear === selectedYear;

    const matchesTag =
      selectedTag === "all" ||
      tags.some((t: string) => t.toLowerCase() === selectedTag.toLowerCase());

    return matchesSearch && matchesRevista && matchesCategory && matchesYear && matchesTag;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dateA = a.fecha_publicacion || a.fecha_recepcion || "";
    const dateB = b.fecha_publicacion || b.fecha_recepcion || "";
    return sortBy === "recent" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  });

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Header theme="light" />

      <div className="border-b" style={{ borderColor: "#f0f0f0", background: "#fafafa", paddingTop: "50px", paddingBottom: "50px" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            Repositorio y Búsqueda de Artículos
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "38px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.025em", marginBottom: "8px" }}>
            Artículos Científicos
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#888", maxWidth: "580px", lineHeight: 1.5 }}>
            Busca, filtra y explora todas las investigaciones revisadas por pares y publicadas en las distintas revistas de nuestro ecosistema.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} color="#888" className="animate-spin" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginLeft: "12px" }}>Cargando artículos...</span>
          </div>
        ) : (
          <>
            <div className="p-6 rounded-lg mb-8" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="md:col-span-2 relative flex items-center">
                  <Search size={16} color="#aaa" style={{ position: "left", left: "12px", position: "absolute" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título, autores, resumen..."
                    style={{ width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "15px", padding: "10px 12px 10px 38px", borderRadius: "4px", border: "1px solid #ddd", background: "#fff", outline: "none" }}
                  />
                </div>

                <div className="relative">
                  <select value={selectedRevista} onChange={(e) => setSelectedRevista(e.target.value)}
                    style={{ width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "15px", padding: "10px 12px", borderRadius: "4px", border: "1px solid #ddd", background: "#fff", outline: "none", cursor: "pointer" }}>
                    <option value="all">Todas las Revistas</option>
                    {revistas.map((r: any) => (
                      <option key={r.id} value={r.nombre}>{r.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "15px", padding: "10px 12px", borderRadius: "4px", border: "1px solid #ddd", background: "#fff", outline: "none", cursor: "pointer" }}>
                    <option value="all">Todas las Categorías</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}
                    style={{ width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "15px", padding: "10px 12px", borderRadius: "4px", border: "1px solid #ddd", background: "#fff", outline: "none", cursor: "pointer" }}>
                    <option value="all">Palabras Clave (Todas)</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4" style={{ borderTop: "1px solid #eee" }}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666" }}>Año:</span>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", padding: "6px 10px", borderRadius: "4px", border: "1px solid #ddd", background: "#fff", outline: "none" }}>
                      <option value="all">Todos</option>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666" }}>Ordenar:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", padding: "6px 10px", borderRadius: "4px", border: "1px solid #ddd", background: "#fff", outline: "none" }}>
                    <option value="recent">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                  </select>
                </div>
              </div>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", marginBottom: "20px" }}>
              {sorted.length} {sorted.length === 1 ? "artículo encontrado" : "artículos encontrados"}
            </p>

            {sorted.length === 0 ? (
              <div className="text-center py-20 rounded-lg border border-dashed" style={{ borderColor: "#ddd" }}>
                <BookOpen size={36} color="#ccc" style={{ margin: "0 auto 16px" }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>
                  No se encontraron artículos con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sorted.map((article, index) => {
                  const lineaNombre = article.lineas_investigacion?.nombre || "Sin categoría";
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
                  const tags = article.palabras_clave ? article.palabras_clave.split(",").map((t: string) => t.trim()) : [];
                  const resumen = article.resumen_es || "";
                  const fecha = article.fecha_publicacion || article.fecha_recepcion || "";
                  const revistaNombre = article.revista?.nombre || "";
                  const vol = article.numero_revista?.volumen?.numero_volumen;
                  const num = article.numero_revista?.numero;
                  const imgSrc = article.img ? (article.img.startsWith("http") ? article.img : `http://localhost:3000${article.img}`) : "";

                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                      className="p-6 rounded-lg transition-all"
                      style={{ border: "1px solid #ebebeb", background: "#ffffff" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0b0b0b"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2.5">
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#3ecf8e", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {lineaNombre}
                            </span>
                            <span style={{ color: "#eee" }}>•</span>
                            {revistaNombre && (
                              <>
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#888", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                  <BookOpen size={12} color="#aaa" />
                                  {revistaNombre}{vol ? ` (Vol. ${vol}` : ""}{num ? ` Nro. ${num})` : vol ? ")" : ""}
                                </span>
                                <span style={{ color: "#eee" }}>•</span>
                              </>
                            )}
                            <span className="flex items-center gap-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}>
                              <Calendar size={11} color="#aaa" />
                              {fecha}
                            </span>
                          </div>

                          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "21px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "8px", letterSpacing: "-0.01em" }}>
                            {article.titulo_es}
                          </h3>

                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", lineHeight: 1.5, marginBottom: "16px", maxWidth: "800px" }}>
                            {resumen.length > 180 ? resumen.slice(0, 180) + "..." : resumen}
                          </p>

                          {authorsStr && (
                            <div className="flex items-center gap-1.5 mb-3" style={{ color: "#333" }}>
                              <User size={12} color="#888" />
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", fontWeight: 500 }}>{authorsStr}</span>
                              {principal?.afiliacion_institucional && (
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#aaa" }}>({principal.afiliacion_institucional})</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 mb-3">
                            <Eye size={12} color="#888" />
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#888" }}>
                              {article.views || 0} vistas
                            </span>
                          </div>

                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {tags.slice(0, 5).map((tag: string) => (
                                <span
                                  key={tag}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedTag(tag); }}
                                  className="px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
                                  style={{ background: selectedTag === tag ? "#0b0b0b" : "#f0f0f0", color: selectedTag === tag ? "#ffffff" : "#666", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex md:flex-col items-end justify-between md:justify-center gap-4 flex-shrink-0">
                          {imgSrc && (
                            <div className="w-[120px] h-[90px] rounded overflow-hidden hidden sm:block" style={{ background: "#f0f0f0", border: "1px solid #efefef" }}>
                              <img src={imgSrc} alt={article.titulo_es} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            </div>
                          )}

                          <Link
                            to={`/articulo/${article.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-center w-full justify-center"
                            style={{ background: "#0b0b0b", color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, textDecoration: "none", transition: "background 0.2s", minWidth: "150px" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#0b0b0b")}
                          >
                            <span>Ver Resumen</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
