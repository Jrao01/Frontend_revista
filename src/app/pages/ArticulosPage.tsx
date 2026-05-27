import { useState } from "react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { articles } from "../data/articles";
import { revistas } from "../data/revistas";
import { Search, Filter, Calendar, BookOpen, User, Tag, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function ArticulosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRevista, setSelectedRevista] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Helper to find which journal (revista) and volume an article belongs to
  const getArticleJournal = (articleId: string) => {
    for (const r of revistas) {
      for (const v of r.volumes) {
        if (v.articleIds.includes(articleId)) {
          return { revistaName: r.name, volumeNumber: v.volumeNumber, issueNumber: v.issueNumber };
        }
      }
    }
    return null;
  };

  // Get unique categories from articles
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  // Get unique tags (palabras clave) from articles
  const allTags = Array.from(
    new Set(articles.flatMap((a) => a.tags || []))
  );

  // Get unique years from articles
  const years = Array.from(
    new Set(
      articles.map((a) => {
        // e.g., "Octubre 2024", "20 de Ene, 2025"
        const matches = a.date.match(/\d{4}/);
        return matches ? matches[0] : null;
      })
    )
  ).filter(Boolean) as string[];

  // Filter articles
  const filtered = articles.filter((a) => {
    const journalInfo = getArticleJournal(a.id);
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authors.some((auth) => auth.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRevista =
      selectedRevista === "all" ||
      (journalInfo && journalInfo.revistaName === selectedRevista);

    const matchesCategory =
      selectedCategory === "all" ||
      a.category.toLowerCase() === selectedCategory.toLowerCase();

    // Check year matching
    const articleYearMatches = a.date.match(/\d{4}/);
    const articleYear = articleYearMatches ? articleYearMatches[0] : "";
    const matchesYear = selectedYear === "all" || articleYear === selectedYear;

    // Check tag/keyword matching
    const matchesTag =
      selectedTag === "all" ||
      (a.tags && a.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

    return matchesSearch && matchesRevista && matchesCategory && matchesYear && matchesTag;
  });

  // Sort articles
  const sorted = [...filtered].sort((a, b) => {
    // Basic date parsing (quick fallback since mock dates are mixed strings)
    const getYear = (str: string) => {
      const m = str.match(/\d{4}/);
      return m ? parseInt(m[0], 10) : 0;
    };
    const getMonthVal = (str: string) => {
      const lower = str.toLowerCase();
      if (lower.includes("ene")) return 1;
      if (lower.includes("feb")) return 2;
      if (lower.includes("mar")) return 3;
      if (lower.includes("abr")) return 4;
      if (lower.includes("may")) return 5;
      if (lower.includes("jun")) return 6;
      if (lower.includes("jul")) return 7;
      if (lower.includes("ago")) return 8;
      if (lower.includes("sep")) return 9;
      if (lower.includes("oct")) return 10;
      if (lower.includes("nov")) return 11;
      if (lower.includes("dic")) return 12;
      return 6; // middle default
    };

    const scoreA = getYear(a.date) * 12 + getMonthVal(a.date);
    const scoreB = getYear(b.date) * 12 + getMonthVal(b.date);

    return sortBy === "recent" ? scoreB - scoreA : scoreA - scoreB;
  });

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Page header */}
      <div
        className="border-b"
        style={{
          borderColor: "#f0f0f0",
          background: "#fafafa",
          paddingTop: "50px",
          paddingBottom: "50px",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#3ecf8e",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Repositorio y Búsqueda de Artículos
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "38px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.025em",
              marginBottom: "8px",
            }}
          >
            Artículos Científicos
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              color: "#888",
              maxWidth: "580px",
              lineHeight: 1.5,
            }}
          >
            Busca, filtra y explora todas las investigaciones revisadas por pares y publicadas en las distintas revistas de nuestro ecosistema.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Search & Filter Controls Grid */}
        <div className="p-6 rounded-lg mb-8" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative flex items-center">
              <Search size={16} color="#aaa" style={{ position: "absolute", left: "12px" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autores, resumen..."
                style={{
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  outline: "none",
                }}
              />
            </div>

            {/* Revista Filter */}
            <div className="relative">
              <select
                value={selectedRevista}
                onChange={(e) => setSelectedRevista(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Todas las Revistas</option>
                {revistas.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword (Palabra Clave) Filter */}
            <div className="relative">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "15px",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="all">Palabras Clave (Todas)</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4" style={{ borderTop: "1px solid #eee" }}>
            <div className="flex flex-wrap items-center gap-4">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666" }}>Año:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">Todos</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666" }}>Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: "#888",
            marginBottom: "20px",
          }}
        >
          Se encontraron <strong>{sorted.length}</strong> artículo{sorted.length !== 1 ? "s" : ""}
        </p>

        {/* Articles List */}
        {sorted.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-gray-50" style={{ borderColor: "#ebebeb" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#888", marginBottom: "8px" }}>
              Ningún artículo coincide con los criterios
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#bbb" }}>
              Intenta cambiar la búsqueda o restablecer los filtros para volver a explorar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sorted.map((article, index) => {
              const journalInfo = getArticleJournal(article.id);

              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                  className="p-6 rounded-lg transition-all"
                  style={{
                    border: "1px solid #ebebeb",
                    background: "#ffffff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0b0b0b";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#ebebeb";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      {/* Meta Tags Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2.5">
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: article.categoryColor || "#3ecf8e",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {article.category}
                        </span>

                        <span style={{ color: "#eee" }}>•</span>

                        {journalInfo && (
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#888",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <BookOpen size={12} color="#aaa" />
                            {journalInfo.revistaName} (Vol. {journalInfo.volumeNumber} Nro. {journalInfo.issueNumber})
                          </span>
                        )}

                        <span style={{ color: "#eee" }}>•</span>

                        <span
                          className="flex items-center gap-1"
                          style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#888" }}
                        >
                          <Calendar size={11} color="#aaa" />
                          {article.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "21px",
                          fontWeight: 600,
                          color: "#0b0b0b",
                          lineHeight: 1.3,
                          marginBottom: "8px",
                          letterSpacing: "-0.01em",
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
                          maxWidth: "800px",
                        }}
                      >
                        {article.abstract.slice(0, 180)}...
                      </p>

                      {/* Authors & Institutions */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                        {article.authors.map((auth, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-1.5" style={{ color: "#333" }}>
                            <User size={12} color="#888" />
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", fontWeight: 500 }}>
                              {auth.name}
                            </span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#aaa" }}>
                              ({auth.institution})
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Tag pills */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTag(tag);
                              }}
                              className="px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
                              style={{
                                background: selectedTag === tag ? "#0b0b0b" : "#f0f0f0",
                                color: selectedTag === tag ? "#ffffff" : "#666",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                              }}
                              onMouseEnter={(e) => {
                                if (selectedTag !== tag) {
                                  e.currentTarget.style.background = "#e5e5e5";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedTag !== tag) {
                                  e.currentTarget.style.background = "#f0f0f0";
                                }
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Left Column Button & Image */}
                    <div className="flex md:flex-col items-end justify-between md:justify-center gap-4 flex-shrink-0">
                      {article.image && (
                        <div
                          className="w-[120px] h-[90px] rounded overflow-hidden hidden sm:block"
                          style={{ background: "#f0f0f0", border: "1px solid #efefef" }}
                        >
                          <img
                            src={article.image}
                            alt={article.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}

                      <Link
                        to={`/articulo/${article.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-center w-full justify-center"
                        style={{
                          background: "#0b0b0b",
                          color: "#ffffff",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                          fontWeight: 600,
                          textDecoration: "none",
                          transition: "background 0.2s",
                          minWidth: "150px",
                        }}
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
      </div>

      <Footer />
    </div>
  );
}
