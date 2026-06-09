import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Mail, Globe, BookOpen } from "lucide-react";



const stats = [
  { stat: "2026", label: "Año de fundación" },
  { stat: "1,240+", label: "Artículos publicados" },
  { stat: "47", label: "Países representados" },
  { stat: "8 sem.", label: "Tiempo promedio de revisión" },
];

export function AboutPage() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Hero */}
      <div
        className="border-b"
        style={{
          borderColor: "#f0f0f0",
          background: "#fafafa",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#3ecf8e",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Acerca de la Nosotros
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "42px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              marginBottom: "18px",
            }}
          >
            SaberUnerg
          </h1>
          <p
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "18px",
              fontStyle: "italic",
              color: "#888",
              lineHeight: 1.75,
            }}
          >
            An Empirical Publication for Global Science. Una publicación de
            acceso abierto dedicada a la investigación científica rigurosa, el
            pensamiento crítico y la divulgación del conocimiento en español.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-14">
        {/* Mission & Process */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                style={{
                  width: "3px",
                  height: "16px",
                  background: "#3ecf8e",
                  borderRadius: "2px",
                }}
              />
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#888",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Nuestra Misión
              </p>
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: "#0b0b0b",
                letterSpacing: "-0.01em",
                marginBottom: "12px",
              }}
            >
              Ciencia abierta, rigurosa y accesible
            </h2>
            <p
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: "17px",
                color: "#555",
                lineHeight: 1.85,
              }}
            >
              SaberUnerg nació con la convicción de que la ciencia de calidad
              debe ser accesible para todos. Publicamos investigación original,
              revisiones sistemáticas y ensayos críticos en todas las
              disciplinas científicas, con énfasis en la comunidad
              hispanohablante.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                style={{
                  width: "3px",
                  height: "16px",
                  background: "#9b7fd4",
                  borderRadius: "2px",
                }}
              />
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#888",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Proceso Editorial
              </p>
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 600,
                color: "#0b0b0b",
                letterSpacing: "-0.01em",
                marginBottom: "12px",
              }}
            >
              Revisión por pares ciega doble
            </h2>
            <p
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: "17px",
                color: "#555",
                lineHeight: 1.85,
              }}
            >
              Todos los manuscritos reciben revisión por pares ciega doble por
              al menos dos expertos independientes. El proceso completo, desde
              la recepción hasta la decisión editorial, tiene una duración
              promedio de 8 semanas.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          className="rounded p-8 mb-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ background: "#0b0b0b" }}
        >
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "6px",
                }}
              >
                {item.stat}
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Editorial board */}

        {/* Contact */}
        <div
          className="rounded p-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ background: "#fafafa", border: "1px solid #ebebeb" }}
        >
          {[
            {
              icon: Mail,
              label: "Envío de manuscritos",
              value: "submissions@cienciaeduc.org",
              color: "#3ecf8e",
            },
            {
              icon: Globe,
              label: "Colaboraciones y prensa",
              value: "press@cienciaeduc.org",
              color: "#9b7fd4",
            },
            {
              icon: BookOpen,
              label: "Acceso institucional",
              value: "access@cienciaeduc.org",
              color: "#e8c55e",
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: item.color + "18" }}
              >
                <item.icon size={17} color={item.color} />
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#aaa",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  color: "#444",
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
