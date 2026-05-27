import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router";
import { revistas } from "../data/revistas";
import { BookOpen, Calendar, Key, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function RevistasPage() {
  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Page Header */}
      <div
        className="border-b"
        style={{
          borderColor: "#f0f0f0",
          background: "#fafafa",
          paddingTop: "60px",
          paddingBottom: "60px",
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
            Índice de Revistas Científicas
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "38px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Nuestras Revistas
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
            Explora las distintas publicaciones periódicas, indexadas y de acceso abierto especializadas en ciencias empíricas, salud y pedagogía académica.
          </p>
        </div>
      </div>

      {/* Journals List */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {revistas.map((revista, idx) => {
            const numVolumes = revista.volumes.length;
            const totalArticles = revista.volumes.reduce(
              (acc, v) => acc + v.articleIds.length,
              0
            );

            return (
              <motion.div
                key={revista.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="group flex flex-col rounded-lg overflow-hidden"
                style={{
                  border: "1px solid #ebebeb",
                  background: "#ffffff",
                  boxShadow: "0 2px 14px rgba(0,0,0,0.02)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.02)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Cover Image */}
                <div style={{ height: "180px", width: "100%", background: "#f0f0f0", overflow: "hidden", position: "relative" }}>
                  <img
                    src={revista.coverImage}
                    alt={revista.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                    className="group-hover:scale-105"
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      background: "rgba(11,11,11,0.85)",
                      color: "#fff",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    ISSN {revista.issn}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "24px",
                        fontWeight: 600,
                        color: "#0b0b0b",
                        marginBottom: "10px",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {revista.name}
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "15px",
                        color: "#666",
                        lineHeight: 1.6,
                        marginBottom: "20px",
                        minHeight: "72px",
                      }}
                    >
                      {revista.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div style={{ borderTop: "1px solid #f2f2f2", paddingTop: "16px" }}>
                    <div className="flex justify-between items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5" style={{ color: "#888" }}>
                        <Calendar size={14} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                          {revista.periodicity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: "#888" }}>
                        <BookOpen size={14} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                          {numVolumes} Vol. ({totalArticles} art.)
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/revistas/${revista.id}`}
                      className="flex items-center justify-between w-full px-4 py-2.5 rounded"
                      style={{
                        background: "#f5f5f5",
                        color: "#0b0b0b",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "15px",
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.2s",
                        textAlign: "center" as const,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#0b0b0b";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f5f5f5";
                        e.currentTarget.style.color = "#0b0b0b";
                      }}
                    >
                      <span>Ver Volúmenes</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
