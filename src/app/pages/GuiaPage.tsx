import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router";
import { 
  BookOpen, 
  CheckCircle, 
  FileText, 
  FolderOpen, 
  HelpCircle, 
  ArrowRight, 
  ShieldAlert, 
  Users, 
  ArrowUpRight 
} from "lucide-react";
import { motion } from "motion/react";

export function GuiaPage() {
  const steps = [
    {
      num: "01",
      title: "Selección de Destino",
      desc: "Elige la revista adecuada para tu manuscrito (SaberUnerg, UNERG Salud o Ensayos Académicos) y selecciona tu programa y línea de investigación correspondientes.",
    },
    {
      num: "02",
      title: "Carga de Archivos y Declaraciones",
      desc: "Sube los archivos requeridos (manuscrito anonimizado y página de título) y acepta las declaraciones de originalidad y ética directamente en el formulario.",
    },
    {
      num: "03",
      title: "Metadatos del Manuscrito",
      desc: "Digita los títulos, resúmenes y palabras clave tanto en español como en inglés (Abstract) para facilitar la indexación y búsqueda.",
    },
    {
      num: "04",
      title: "Información de Coautores y Envío",
      desc: "Registra a todos los coautores con sus afiliaciones y ORCIDs, acepta la declaración de originalidad y realiza el envío definitivo.",
    },
  ];

  const filesNeeded = [
    {
      title: "Manuscrito Original (Anonimizado)",
      required: true,
      badgeColor: "#e05252",
      desc: "El documento principal que contiene el título del estudio, resumen en español e inglés, palabras clave, cuerpo de la investigación (Introducción, Metodología, Resultados, Discusión) y referencias bibliográficas.",
      whyNeeded: "Debe estar completamente libre de nombres de autores o instituciones para garantizar una revisión por pares ciega doble (double-blind peer review) totalmente transparente e imparcial.",
    },
    {
      title: "Página de Título (Title Page)",
      required: true,
      badgeColor: "#e05252",
      desc: "Un documento independiente que reúne la información completa del artículo: título exacto, nombres y apellidos de todos los autores, afiliación institucional de cada uno, correos de contacto y perfiles ORCID.",
      whyNeeded: "Permite al equipo editorial realizar la correspondencia y el registro formal de metadatos, manteniéndolo separado del manuscrito que va a los jurados evaluadores.",
    },
    {
      title: "Ficha de Autores y ORCIDs",
      required: false,
      badgeColor: "#888",
      desc: "Archivo adicional en formato Word o PDF donde se detalla la contribución específica de cada coautor utilizando la taxonomía CRediT, así como una breve reseña biográfica.",
      whyNeeded: "Ayuda a transparentar la contribución real de cada investigador en proyectos colaborativos multi-disciplinarios.",
    },
  ];

  const declarationsNeeded = [
    {
      title: "Carta de Originalidad y Cesión",
      required: true,
      badgeColor: "#e05252",
      desc: "Declaración bajo firma digital de que el manuscrito es inédito, original y que no ha sido postulado simultáneamente en otras revistas.",
      whyNeeded: "Es una salvaguarda ética que garantiza la exclusividad e integridad de la publicación científica y previene la duplicación de artículos en el ecosistema científico.",
    },
    {
      title: "Certificado del Comité de Ética",
      required: true,
      badgeColor: "#e05252",
      desc: "Declaración bajo firma digital de que el estudio cumple con los lineamientos éticos internacionales para la investigación.",
      whyNeeded: "Obligatorio para investigaciones experimentales o aplicadas en salud y ciencias sociales, garantizando que se respetaron los principios bioéticos internacionales.",
    },
  ];

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Hero Banner */}
      <div
        className="border-b"
        style={{
          borderColor: "#f0f0f0",
          background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#3ecf8e",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Guía de Publicación Científica
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "44px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              marginBottom: "20px",
            }}
          >
            Cómo Publicar tus Artículos Científicos
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "17px",
              color: "#666",
              lineHeight: 1.6,
              maxWidth: "640px",
              margin: "0 auto 28px",
            }}
          >
            Acompañamos a los investigadores en cada paso de su postulación. Conoce las directrices de formato, los documentos requeridos y nuestro riguroso proceso de revisión por pares ciega doble.
          </p>

          <Link
            to="/publicar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
            style={{
              background: "#0b0b0b",
              color: "#ffffff",
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "#222";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#0b0b0b";
            }}
          >
            Postular mi Investigación <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-16">
        {/* Pasos a seguir */}
        <section className="mb-20">
          <div className="flex items-center gap-2 mb-8">
            <div style={{ width: "4px", height: "24px", background: "#3ecf8e", borderRadius: "2px" }} />
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: "#0b0b0b",
              }}
            >
              Pasos a Seguir para la Postulación
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-6 rounded-lg"
                style={{
                  border: "1px solid #ebebeb",
                  background: "#fafafa",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    right: "-10px",
                    top: "-15px",
                    fontSize: "80px",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    color: "rgba(11,11,11,0.03)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {step.num}
                </span>
                <div className="flex gap-4">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#0b0b0b",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#0b0b0b",
                        marginBottom: "8px",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "15px",
                        color: "#666",
                        lineHeight: 1.6,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Archivos Necesarios */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: "4px", height: "24px", background: "#9b7fd4", borderRadius: "2px" }} />
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: "#0b0b0b",
              }}
            >
              Archivos Requeridos para Postular
            </h2>
          </div>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              color: "#666",
              marginBottom: "32px",
              maxWidth: "700px",
              lineHeight: 1.5,
            }}
          >
            Antes de hacer clic en postular, asegúrate de tener preparados los siguientes archivos en tu ordenador. Cada uno cumple una función crucial en nuestro proceso de revisión científica por pares ciega doble.
          </p>

          <div className="flex flex-col gap-6">
            {filesNeeded.map((file, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-lg"
                style={{
                  border: "1px solid #ebebeb",
                  borderLeft: `4px solid ${file.badgeColor}`,
                  background: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#0b0b0b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FileText size={18} color={file.badgeColor} />
                    {file.title}
                  </h3>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: file.required ? "rgba(224,82,82,0.1)" : "#f0f0f0",
                      color: file.required ? "#e05252" : "#888",
                    }}
                  >
                    {file.required ? "Obligatorio" : "Opcional"}
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    color: "#555",
                    lineHeight: 1.6,
                    marginBottom: "12px",
                  }}
                >
                  {file.desc}
                </p>

                <div
                  className="p-4 rounded"
                  style={{
                    background: "#f9f9f9",
                    border: "1px dashed #efefef",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <ShieldAlert size={16} style={{ color: "#888", marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <strong
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        color: "#444",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      ¿Por qué se solicita?
                    </strong>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        color: "#777",
                        lineHeight: 1.5,
                      }}
                    >
                      {file.whyNeeded}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Declaraciones Necesarias */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: "4px", height: "24px", background: "#e05252", borderRadius: "2px" }} />
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 600,
                color: "#0b0b0b",
              }}
            >
              Declaraciones Obligatorias
            </h2>
          </div>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              color: "#666",
              marginBottom: "32px",
              maxWidth: "700px",
              lineHeight: 1.5,
            }}
          >
            Además de los archivos, deberás aceptar las siguientes declaraciones directamente en el formulario de envío.
          </p>

          <div className="flex flex-col gap-6">
            {declarationsNeeded.map((decl, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-lg"
                style={{
                  border: "1px solid #ebebeb",
                  borderLeft: `4px solid ${decl.badgeColor}`,
                  background: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#0b0b0b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle size={18} color={decl.badgeColor} />
                    {decl.title}
                  </h3>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: "rgba(224,82,82,0.1)",
                      color: "#e05252",
                    }}
                  >
                    Obligatorio
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    color: "#555",
                    lineHeight: 1.6,
                    marginBottom: "12px",
                  }}
                >
                  {decl.desc}
                </p>

                <div
                  className="p-4 rounded"
                  style={{
                    background: "#f9f9f9",
                    border: "1px dashed #efefef",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <ShieldAlert size={16} style={{ color: "#888", marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <strong
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        color: "#444",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      ¿Por qué se solicita?
                    </strong>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        color: "#777",
                        lineHeight: 1.5,
                      }}
                    >
                      {decl.whyNeeded}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Info panel */}
        <section
          className="rounded-lg p-8 text-center"
          style={{
            background: "#0b0b0b",
            color: "#ffffff",
          }}
        >
          <BookOpen size={36} color="#3ecf8e" style={{ margin: "0 auto 16px" }} />
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            ¿Listo para postular tu investigación?
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "560px",
              margin: "0 auto 24px",
              lineHeight: 1.6,
            }}
          >
            Una vez tengas listos tus archivos y verificado la directrices del manuscrito, haz clic abajo para ingresar al formulario digital estructurado.
          </p>
          <Link
            to="/publicar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded"
            style={{
              background: "#3ecf8e",
              color: "#0b0b0b",
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Comenzar Postulación <ArrowRight size={15} />
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
