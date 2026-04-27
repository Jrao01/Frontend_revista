import { Link } from "react-router";
import { ArrowRight, FileText, Users, Globe, Award } from "lucide-react";

const BENEFITS = [
  { icon: Users, text: "Alcance a 40,000+ investigadores hispanohablantes" },
  { icon: Globe, text: "Indexado en Scopus, DOAJ y Redalyc" },
  { icon: Award, text: "Revisión por pares doble ciego en 6–8 semanas" },
  { icon: FileText, text: "DOI permanente y acceso abierto desde publicación" },
];

const EDITORIAL_STEPS = [
  { step: "01", title: "Envío del Manuscrito", desc: "Sube tu investigación en formato PDF o LaTeX con resumen estructurado.", color: "#3ecf8e", days: "Día 1" },
  { step: "02", title: "Revisión Preliminar", desc: "El equipo editorial evalúa alcance, originalidad y formato en 5 días hábiles.", color: "#6c8ebf", days: "Días 2–7" },
  { step: "03", title: "Revisión por Pares", desc: "Dos revisores independientes evalúan el manuscrito de forma anónima.", color: "#9b7fd4", days: "Semanas 2–8" },
  { step: "04", title: "Decisión Editorial", desc: "Aceptación, revisión mayor/menor o rechazo con comentarios detallados.", color: "#e07b54", days: "Semana 9" },
  { step: "05", title: "Publicación y DOI", desc: "Publicación en acceso abierto con DOI permanente y difusión activa.", color: "#e8c55e", days: "Semana 10–11" },
];

export function PublishSection() {
  return (
    <section style={{ background: "#0b0b0b", paddingTop: "64px", paddingBottom: "64px" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div style={{ width: "28px", height: "1px", background: "#3ecf8e" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Convocatoria Abierta
              </span>
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 600, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "18px" }}>
              Publica tu investigación en{" "}
              <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.65)" }}>CienciaEduc</span>
            </h2>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: "28px", maxWidth: "460px" }}>
              La comunidad científica hispanohablante te espera. Compartimos investigación de excelencia con rigor editorial y acceso abierto.
            </p>

            <ul className="flex flex-col gap-3 mb-8">
              {BENEFITS.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={13} color="#3ecf8e" />
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.55)" }}>{text}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/publicar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded"
              style={{ background: "#ffffff", color: "#0b0b0b", fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 600, textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f0f0f0")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#ffffff")}
            >
              Enviar manuscrito <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right: process */}
          <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "28px 32px", background: "rgba(255,255,255,0.02)" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "24px" }}>
              Proceso Editorial
            </p>
            {EDITORIAL_STEPS.map((item, i) => (
              <div key={i} className="flex gap-4" style={{ marginBottom: i < EDITORIAL_STEPS.length - 1 ? "18px" : 0 }}>
                <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `${item.color}18`, border: `1px solid ${item.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: item.color, letterSpacing: "0.04em" }}>{item.step}</span>
                  </div>
                  {i < EDITORIAL_STEPS.length - 1 && (
                    <div style={{ width: "1px", flex: 1, minHeight: "14px", background: "rgba(255,255,255,0.08)", marginTop: "4px", marginBottom: "4px" }} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, color: "#ffffff" }}>{item.title}</p>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: item.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.days}</span>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
