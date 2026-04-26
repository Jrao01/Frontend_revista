import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { Article } from "../../data/articles";
import { Header } from "../../components/Header";

interface HeroCarouselProps {
  slides: Article[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length]);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(480px, 65vh, 640px)", background: "#0a0a0a" }}>
      <style>{`
        @keyframes progressBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      <Header theme="dark" />

      {/* Slide backgrounds */}
      {slides.map((article, i) => (
        <div
          key={`bg-${article.id}`}
          className="absolute inset-0"
          style={{ opacity: i === current ? 1 : 0, transition: "opacity 1.4s cubic-bezier(0.4,0,0.2,1)", zIndex: i === current ? 1 : 0 }}
        >
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" style={{ opacity: 0.48 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(10,10,10,0.97) 30%, rgba(10,10,10,0.55) 65%, rgba(10,10,10,0.1) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 50%)" }} />
        </div>
      ))}

      {/* Slide content */}
      {slides.map((article, i) => (
        <div
          key={`content-${article.id}`}
          className="absolute inset-0 flex flex-col justify-end"
          style={{ zIndex: i === current ? 5 : 0, pointerEvents: i === current ? "auto" : "none" }}
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 w-full pb-12 md:pb-16">
            <div
              className="max-w-[600px]"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
              }}
            >
              <div className="flex items-center gap-2 mb-4 md:mb-5">
                <div style={{ width: "3px", height: "16px", background: article.categoryColor, borderRadius: "2px", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: article.categoryColor, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {article.type}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                  — {article.category}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3.6vw, 48px)", fontWeight: 600, color: "#ffffff", lineHeight: 1.12, marginBottom: "14px", letterSpacing: "-0.02em" }}>
                {article.title}
              </h1>

              <p className="hidden md:block" style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.7, marginBottom: "22px", maxWidth: "480px" }}>
                {article.subtitle}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.42)" }}>{article.authors[0].name}</span>
                <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.42)" }}>{article.date}</span>
                <Link
                  to={`/articulo/${article.slug}`}
                  className="flex items-center gap-1.5"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: article.categoryColor, fontWeight: 500, textDecoration: "none" }}
                >
                  Leer artículo <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Progress indicators */}
      <div className="absolute bottom-5 right-5 md:bottom-6 md:right-8 flex items-center gap-3" style={{ zIndex: 10 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? "28px" : "5px", height: "2px",
                background: i === current ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
                borderRadius: "1px", transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                overflow: "hidden", position: "relative",
              }}
            >
              {i === current && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)", transformOrigin: "left", animation: "progressBar 5.5s linear forwards" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: "1px", background: "linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)", zIndex: 10 }} />
    </section>
  );
}
