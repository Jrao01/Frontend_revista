import { useState, useMemo } from "react";
import { Link } from "react-router";
import { ArrowRight, Quote, Filter } from "lucide-react";
import { articles, categories } from "../../data/articles";
import { HeroCarousel } from "./HeroCarousel";
import { InfiniteArticleFeed } from "./InfiniteArticleFeed";
import { PublishSection } from "../publish/PublishSection";
import { Footer } from "../../components/Footer";

const heroSlides = articles.filter((a) => a.heroFeatured);
const featuredRecent = articles[1];
const sideArticles = [articles[2], articles[3]];
const editorialArticles = [articles[4], articles[5], articles[6]];

const feedCategories = [
  { id: "all", label: "Todos" },
  { id: "biologia", label: "Biología" },
  { id: "fisica", label: "Física" },
  { id: "quimica", label: "Química" },
  { id: "astrofisica", label: "Astrofísica" },
  { id: "metodologia", label: "Metodología" },
];

const categoryMatchMap: Record<string, string[]> = {
  biologia: ["Biología", "Biología Molecular", "Neurociencia", "Ecología"],
  fisica: ["Física", "Física Cuántica"],
  quimica: ["Química"],
  astrofisica: ["Astrofísica"],
  metodologia: ["Metodología"],
};

export function HomePage() {
  const [activeFeedCategory, setActiveFeedCategory] = useState("all");

  const feedArticles = useMemo(() => {
    if (activeFeedCategory === "all") return articles;
    const matched = categoryMatchMap[activeFeedCategory] ?? [];
    return articles.filter((a) => matched.includes(a.category));
  }, [activeFeedCategory]);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <HeroCarousel slides={heroSlides} />

      {/* ── RECENT ARTICLES ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.01em" }}>
              Artículos Recientes
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa", marginTop: "2px", fontStyle: "italic" }}>
              Recent Publications
            </p>
          </div>
          <Link to="/archivos" className="flex items-center gap-1.5" style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#666", textDecoration: "none" }}>
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Featured */}
          <div className="lg:col-span-2">
            <Link to={`/articulo/${featuredRecent.slug}`} className="block group" style={{ textDecoration: "none" }}>
              <div className="relative overflow-hidden rounded" style={{ aspectRatio: "16/9", background: "#0b0b0b" }}>
                <img src={featuredRecent.image} alt={featuredRecent.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ opacity: 0.82 }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: featuredRecent.categoryColor, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
                    {featuredRecent.category}
                  </span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(17px, 2.2vw, 22px)", fontWeight: 600, color: "#fff", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                    {featuredRecent.title}
                  </h3>
                </div>
              </div>
              <div className="mt-3 flex items-start justify-between gap-4">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#666", lineHeight: 1.6, flex: 1 }}>
                  {featuredRecent.abstract.slice(0, 160)}...
                </p>
                <div className="flex-shrink-0 text-right hidden md:block">
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa" }}>{featuredRecent.date}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{featuredRecent.readTime}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-4">
            {sideArticles.map((article) => (
              <Link key={article.id} to={`/articulo/${article.slug}`} className="block group" style={{ textDecoration: "none" }}>
                <article className="flex gap-3 pb-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: "80px", height: "64px", background: "#111" }}>
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: article.categoryColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                      {article.category}
                    </p>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "3px" }}>
                      {article.title}
                    </h4>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb" }}>{article.date}</p>
                  </div>
                </article>
              </Link>
            ))}

            <div className="rounded p-4" style={{ background: "#f8f8f8", border: "1px solid #ebebeb" }}>
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: "6px", height: "6px", background: "#3ecf8e", borderRadius: "50%" }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Herramienta de Cita
                </p>
              </div>
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "12px", color: "#666", lineHeight: 1.55, marginBottom: "10px", fontStyle: "italic" }}>
                Torres, E. (2024). La Simetría Oculta de las Redes Neuronales Celulares. CienciaEduc, 14(2), 42–62.
              </p>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#333", background: "#fff", border: "1px solid #e0e0e0", cursor: "pointer" }}
                onClick={() => navigator.clipboard?.writeText("Torres, E. (2024). La Simetría Oculta de las Redes Neuronales Celulares. CienciaEduc, 14(2), 42–62.")}
              >
                Copiar Cita
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL SUGGESTIONS ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 pb-10 md:pb-14">
        <div className="mb-6 md:mb-8">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.01em" }}>
            Sugerencias Editoriales
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa", marginTop: "2px", fontStyle: "italic" }}>
            Recent Discoveries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Link to={`/articulo/${editorialArticles[0].slug}`} className="md:col-span-5 group block" style={{ textDecoration: "none" }}>
            <div className="relative rounded overflow-hidden h-full" style={{ minHeight: "240px", background: "#111" }}>
              <img src={editorialArticles[0].image} alt={editorialArticles[0].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ opacity: 0.6 }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 600, color: editorialArticles[0].categoryColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
                  {editorialArticles[0].type}
                </p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(15px, 1.8vw, 19px)", fontWeight: 600, color: "#fff", lineHeight: 1.3, marginBottom: "6px" }}>
                  {editorialArticles[0].title}
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                  {editorialArticles[0].authors[0].name} · {editorialArticles[0].readTime}
                </p>
              </div>
            </div>
          </Link>

          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="rounded p-5 flex flex-col justify-center flex-1" style={{ background: "#f8f8f8", border: "1px solid #ebebeb", minHeight: "120px" }}>
              <Quote size={18} color="#d0d0d0" className="mb-3" />
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "17px", fontStyle: "italic", color: "#333", lineHeight: 1.5, marginBottom: "8px" }}>
                La pedagogía moderna no puede sostenerse sobre la mera intuición; exige validación.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#bbb", letterSpacing: "0.05em", textTransform: "uppercase" }}>EDITORIAL</p>
            </div>
            <div className="rounded p-5 flex flex-col justify-center" style={{ background: "#0b0b0b", minHeight: "120px" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: "8px" }}>84%</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.5 }}>
                CORRELACIÓN EMPÍRICA CON NIVEL SOCIOECONÓMICO
              </p>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-4">
            <Link to={`/articulo/${editorialArticles[2].slug}`} className="block group flex-1" style={{ textDecoration: "none" }}>
              <div className="rounded p-5 h-full" style={{ border: "1px solid #ebebeb", minHeight: "130px" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 600, color: editorialArticles[2].categoryColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "7px" }}>
                  {editorialArticles[2].type}
                </p>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "5px" }}>
                  {editorialArticles[2].title}
                </h4>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#999", lineHeight: 1.5 }}>
                  {editorialArticles[2].subtitle.slice(0, 80)}...
                </p>
              </div>
            </Link>
            <Link to={`/articulo/${editorialArticles[1].slug}`} className="block group" style={{ textDecoration: "none" }}>
              <div className="relative rounded overflow-hidden" style={{ height: "120px", background: "#111" }}>
                <img src={editorialArticles[1].image} alt={editorialArticles[1].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ opacity: 0.7 }} />
                <div className="absolute inset-0 p-4 flex flex-col justify-end" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 600, color: editorialArticles[1].categoryColor, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                    {editorialArticles[1].type}
                  </p>
                  <h5 style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
                    {editorialArticles[1].title}
                  </h5>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── DIVIDER + FEED ── */}
      <div style={{ background: "#f7f7f7", borderTop: "1px solid #efefef", borderBottom: "1px solid #efefef" }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.01em" }}>
              Todas las Investigaciones
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
              {articles.length} artículos · Volumen 14
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={12} color="#aaa" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#aaa" }}>Filtrar por disciplina</span>
          </div>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex items-center gap-2 flex-wrap mb-8 pb-5" style={{ borderBottom: "1px solid #f0f0f0" }}>
          {feedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFeedCategory(cat.id)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: "12px",
                fontWeight: activeFeedCategory === cat.id ? 600 : 400,
                color: activeFeedCategory === cat.id ? "#fff" : "#666",
                background: activeFeedCategory === cat.id ? "#0b0b0b" : "transparent",
                border: `1px solid ${activeFeedCategory === cat.id ? "#0b0b0b" : "#e8e8e8"}`,
                borderRadius: "20px", padding: "4px 12px", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {feedArticles.length > 0 ? (
          <InfiniteArticleFeed key={activeFeedCategory} articles={feedArticles} />
        ) : (
          <div className="text-center py-16">
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "20px", fontStyle: "italic", color: "#ccc", marginBottom: "8px" }}>
              No hay artículos en esta categoría aún.
            </p>
            <button onClick={() => setActiveFeedCategory("all")} style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#666", background: "none", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", marginTop: "8px" }}>
              Ver todos
            </button>
          </div>
        )}
      </section>

      <PublishSection />

      {/* ── CATEGORIES ── */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex items-center gap-2 mb-5">
          <div style={{ width: "20px", height: "1px", background: "#0b0b0b" }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Explorar por Área
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.filter((c) => c.id !== "all").map((cat) => {
            const count = articles.filter((a) => {
              const matchedCats = categoryMatchMap[cat.id] ?? [cat.label];
              return matchedCats.includes(a.category);
            }).length;
            return (
              <Link
                key={cat.id}
                to={`/categoria/${cat.id}`}
                className="block rounded p-4 group"
                style={{ border: "1px solid #f0f0f0", textDecoration: "none", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = cat.color; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#f0f0f0"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ width: "24px", height: "3px", background: cat.color, borderRadius: "2px", marginBottom: "10px" }} />
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 600, color: "#0b0b0b", marginBottom: "3px" }}>{cat.label}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>{count} artículo{count !== 1 ? "s" : ""}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
