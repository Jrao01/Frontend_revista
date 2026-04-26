import { useState } from "react";
import { Link } from "react-router";
import { Search, Filter, Clock, Calendar } from "lucide-react";
import { articles, categories } from "../data/articles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const categoryNormMap: Record<string, string> = {
  biologia: "biología",
  fisica: "física",
  quimica: "química",
  astrofisica: "astrofísica",
  metodologia: "metodología",
};

export function ArchivesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = articles.filter((a) => {
    const catLabel = a.category.toLowerCase();
    const matchesCategory =
      selectedCategory === "all" ||
      catLabel === (categoryNormMap[selectedCategory] || selectedCategory) ||
      catLabel.includes(selectedCategory.replace("ia", "ía").replace("ica", "ica"));
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authors.some((auth) =>
        auth.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Page header */}
      <div
        className="border-b"
        style={{
          borderColor: "#f0f0f0",
          background: "#fafafa",
          paddingTop: "40px",
          paddingBottom: "32px",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "36px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.02em",
              marginBottom: "4px",
            }}
          >
            Archivos
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#aaa",
              fontStyle: "italic",
              marginBottom: "20px",
            }}
          >
            Complete publication archive — CienciaEduc Journal
          </p>

          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded flex-1 max-w-[420px]"
              style={{ border: "1px solid #e0e0e0", background: "#fff" }}
            >
              <Search size={13} color="#ccc" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor o palabra clave..."
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: "#333",
                  outline: "none",
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} color="#ccc" />
              <select
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#666",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  padding: "7px 10px",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option>Más recientes</option>
                <option>Más leídos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                fontWeight: selectedCategory === cat.id ? 500 : 400,
                color:
                  selectedCategory === cat.id
                    ? cat.id === "all"
                      ? "#0b0b0b"
                      : cat.color
                    : "#aaa",
                background:
                  selectedCategory === cat.id
                    ? cat.id === "all"
                      ? "#f0f0f0"
                      : cat.color + "15"
                    : "transparent",
                border: `1px solid ${
                  selectedCategory === cat.id
                    ? cat.id === "all"
                      ? "#ddd"
                      : cat.color + "40"
                    : "#e8e8e8"
                }`,
                borderRadius: "20px",
                padding: "5px 14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "#bbb",
            marginBottom: "16px",
          }}
        >
          {filtered.length} artículo{filtered.length !== 1 ? "s" : ""}{" "}
          encontrado{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Articles list */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                color: "#ddd",
              }}
            >
              No se encontraron resultados
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#bbb",
                marginTop: "8px",
              }}
            >
              Intenta con otro término de búsqueda o categoría
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((article, index) => (
              <Link
                key={article.id}
                to={`/articulo/${article.slug}`}
                className="block group"
                style={{ textDecoration: "none" }}
              >
                <article
                  className="py-6"
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <div className="flex gap-5 items-start">
                    {/* Index number */}
                    <div
                      className="flex-shrink-0 hidden sm:block pt-1"
                      style={{ width: "28px" }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "11px",
                          color: "#ddd",
                          fontWeight: 400,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: article.categoryColor,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {article.category}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "10px",
                            color: "#ddd",
                          }}
                        >
                          ·
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "10px",
                            color: "#ccc",
                          }}
                        >
                          {article.type}
                        </span>
                      </div>
                      <h2
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#0b0b0b",
                          lineHeight: 1.25,
                          letterSpacing: "-0.01em",
                          marginBottom: "5px",
                        }}
                      >
                        {article.title}
                      </h2>
                      <p
                        style={{
                          fontFamily: "'EB Garamond', serif",
                          fontSize: "14px",
                          fontStyle: "italic",
                          color: "#aaa",
                          marginBottom: "8px",
                        }}
                      >
                        {article.subtitle}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          color: "#888",
                          lineHeight: 1.6,
                          marginBottom: "10px",
                          maxWidth: "580px",
                        }}
                      >
                        {article.abstract.slice(0, 155)}...
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "11px",
                            color: "#555",
                            fontWeight: 500,
                          }}
                        >
                          {article.authors[0].name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "11px",
                            color: "#ccc",
                          }}
                        >
                          {article.authors[0].institution}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ color: "#ccc" }}
                        >
                          <Calendar size={10} />
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "11px",
                            }}
                          >
                            {article.date}
                          </span>
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ color: "#ccc" }}
                        >
                          <Clock size={10} />
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "11px",
                            }}
                          >
                            {article.readTime}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div
                      className="flex-shrink-0 rounded overflow-hidden hidden md:block"
                      style={{
                        width: "100px",
                        height: "76px",
                        background: "#111",
                      }}
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
