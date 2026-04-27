import { useParams, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { articles } from "../data/articles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const categoryMap: Record<string, { label: string; color: string; description: string; bgColor: string }> = {
  biologia: { label: "Biología", color: "#3ecf8e", bgColor: "#3ecf8e0a", description: "Descubrimientos en biología molecular, celular y evolutiva." },
  fisica: { label: "Física", color: "#9b7fd4", bgColor: "#9b7fd40a", description: "Investigación en mecánica cuántica, óptica y física teórica." },
  quimica: { label: "Química", color: "#e8c55e", bgColor: "#e8c55e0a", description: "Avances en síntesis química, bioquímica y materiales." },
  astrofisica: { label: "Astrofísica", color: "#6c8ebf", bgColor: "#6c8ebf0a", description: "Exploraciones del cosmos, cosmología y astronomía observacional." },
  metodologia: { label: "Metodología", color: "#e07b54", bgColor: "#e07b540a", description: "Enfoques y herramientas para la investigación científica rigurosa." },
};

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const catInfo = categoryMap[slug || ""] || {
    label: slug || "Categoría",
    color: "#888",
    bgColor: "#f5f5f5",
    description: "",
  };

  const categoryArticles = articles.filter((a) => {
    const normalized = a.category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const target = catInfo.label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return normalized.includes(target) || target.includes(normalized.split(" ")[0]);
  });

  const featuredArticle = categoryArticles[0];
  const restArticles = categoryArticles.slice(1);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Category header */}
      <div
        className="border-b"
        style={{
          borderColor: "#f0f0f0",
          background: catInfo.bgColor || "#fafafa",
          paddingTop: "40px",
          paddingBottom: "32px",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 mb-3">
            <div
              style={{
                width: "3px",
                height: "16px",
                background: catInfo.color,
                borderRadius: "2px",
              }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: catInfo.color,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {catInfo.label}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "36px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            {catInfo.label}
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "17px",
              color: "#888",
            }}
          >
            {catInfo.description}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {categoryArticles.length === 0 ? (
          <div className="text-center py-24">
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px",
                color: "#ddd",
              }}
            >
              No hay artículos en esta categoría
            </p>
            <Link
              to="/archivos"
              className="inline-flex items-center gap-1.5 mt-4"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "16px",
                color: "#555",
                textDecoration: "none",
              }}
            >
              Ver todos los artículos <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredArticle && (
              <div className="mb-10">
                <Link
                  to={`/articulo/${featuredArticle.slug}`}
                  className="block group"
                  style={{ textDecoration: "none" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div
                      className="rounded overflow-hidden"
                      style={{ aspectRatio: "16/10", background: "#111" }}
                    >
                      <img
                        src={featuredArticle.image}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: catInfo.color,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: "10px",
                        }}
                      >
                        {featuredArticle.type}
                      </p>
                      <h2
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "28px",
                          fontWeight: 600,
                          color: "#0b0b0b",
                          lineHeight: 1.2,
                          letterSpacing: "-0.01em",
                          marginBottom: "10px",
                        }}
                      >
                        {featuredArticle.title}
                      </h2>
                      <p
                        style={{
                          fontFamily: "'EB Garamond', serif",
                          fontSize: "18px",
                          fontStyle: "italic",
                          color: "#999",
                          marginBottom: "12px",
                        }}
                      >
                        {featuredArticle.subtitle}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "16px",
                          color: "#666",
                          lineHeight: 1.6,
                          marginBottom: "16px",
                        }}
                      >
                        {featuredArticle.abstract.slice(0, 200)}...
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "15px",
                            color: "#555",
                            fontWeight: 500,
                          }}
                        >
                          {featuredArticle.authors[0].name}
                        </span>
                        <span style={{ color: "#ddd" }}>·</span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "15px",
                            color: "#aaa",
                          }}
                        >
                          {featuredArticle.date}
                        </span>
                        <span
                          className="flex items-center gap-1 ml-2"
                          style={{ color: catInfo.color }}
                        >
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "15px",
                              fontWeight: 500,
                            }}
                          >
                            Leer artículo
                          </span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {restArticles.length > 0 && (
              <div
                style={{
                  height: "1px",
                  background: "#f0f0f0",
                  marginBottom: "32px",
                }}
              />
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articulo/${article.slug}`}
                  className="block group"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="rounded overflow-hidden mb-3"
                    style={{ aspectRatio: "16/9", background: "#111" }}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: catInfo.color,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    {article.type}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#0b0b0b",
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                      marginBottom: "6px",
                    }}
                  >
                    {article.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      color: "#aaa",
                      lineHeight: 1.5,
                      marginBottom: "8px",
                    }}
                  >
                    {article.abstract.slice(0, 100)}...
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: "#bbb",
                    }}
                  >
                    {article.authors[0].name} · {article.date}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
