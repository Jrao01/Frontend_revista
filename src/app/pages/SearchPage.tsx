import { useSearchParams, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { articles } from "../data/articles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.abstract.toLowerCase().includes(query.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      a.category.toLowerCase().includes(query.toLowerCase()) ||
      a.authors.some((auth) =>
        auth.name.toLowerCase().includes(query.toLowerCase())
      )
  );

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Header theme="light" />

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-8">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#bbb",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "6px",
            }}
          >
            Resultados de búsqueda
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "32px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.02em",
              marginBottom: "4px",
            }}
          >
            "{query}"
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              color: "#bbb",
            }}
          >
            {results.length} resultado{results.length !== 1 ? "s" : ""}{" "}
            encontrado{results.length !== 1 ? "s" : ""}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-24">
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                color: "#ddd",
                marginBottom: "10px",
              }}
            >
              No se encontraron resultados
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "16px",
                color: "#bbb",
              }}
            >
              Intenta con otros términos o explora los archivos
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
          <div>
            {results.map((article) => (
              <Link
                key={article.id}
                to={`/articulo/${article.slug}`}
                className="block group"
                style={{ textDecoration: "none" }}
              >
                <article
                  className="flex gap-5 py-6"
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <div
                    className="flex-shrink-0 rounded overflow-hidden hidden sm:block"
                    style={{
                      width: "96px",
                      height: "72px",
                      background: "#111",
                    }}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: article.categoryColor,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {article.category}
                      </span>
                      <span style={{ color: "#e0e0e0" }}>·</span>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "13px",
                          color: "#ccc",
                        }}
                      >
                        {article.type}
                      </span>
                    </div>
                    <h2
                      className="group-hover:underline"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#0b0b0b",
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                        marginBottom: "6px",
                      }}
                    >
                      {article.title}
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "15px",
                        color: "#aaa",
                        lineHeight: 1.6,
                        marginBottom: "6px",
                      }}
                    >
                      {article.abstract.slice(0, 180)}...
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                          color: "#555",
                          fontWeight: 500,
                        }}
                      >
                        {article.authors[0].name}
                      </span>
                      <span style={{ color: "#e0e0e0" }}>·</span>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                          color: "#bbb",
                        }}
                      >
                        {article.date}
                      </span>
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
