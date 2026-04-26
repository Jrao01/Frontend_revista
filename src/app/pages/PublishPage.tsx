import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, Upload, AlertCircle } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const categories = [
  "Biología",
  "Biología Molecular",
  "Astrofísica",
  "Física Cuántica",
  "Física",
  "Química",
  "Neurociencia",
  "Metodología",
  "Ecología",
];

const articleTypes = [
  "Investigación Original",
  "Revisión Sistemática",
  "Carta de Investigación",
  "Ensayo Crítico",
  "Investigación Experimental",
  "Estudio Clínico",
  "Estudio Observacional",
  "Protocolo de Investigación",
];

interface FormData {
  firstName: string;
  lastName: string;
  institution: string;
  email: string;
  coauthors: string;
  title: string;
  category: string;
  articleType: string;
  abstract: string;
  keywords: string;
  fileName: string;
  declaration: boolean;
  openAccess: boolean;
}

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  institution: "",
  email: "",
  coauthors: "",
  title: "",
  category: "",
  articleType: "",
  abstract: "",
  keywords: "",
  fileName: "",
  declaration: false,
  openAccess: false,
};

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    color: "#0b0b0b",
    background: focused ? "#ffffff" : "#fafafa",
    border: `1px solid ${focused ? "#0b0b0b" : "#e8e8e8"}`,
    borderRadius: "4px",
    padding: "10px 12px",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
    boxSizing: "border-box" as const,
  };
}

export function PublishPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = "Requerido";
    if (!form.lastName.trim()) newErrors.lastName = "Requerido";
    if (!form.institution.trim()) newErrors.institution = "Requerido";
    if (!form.email.trim() || !form.email.includes("@")) newErrors.email = "Email inválido";
    if (!form.title.trim()) newErrors.title = "Requerido";
    if (!form.category) newErrors.category = "Selecciona una categoría";
    if (!form.articleType) newErrors.articleType = "Selecciona el tipo";
    if (form.abstract.trim().length < 100) newErrors.abstract = "El resumen debe tener al menos 100 caracteres";
    if (!form.keywords.trim()) newErrors.keywords = "Requerido";
    if (!form.declaration) newErrors.declaration = "Debes aceptar la declaración";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    color: "#333",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "6px",
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    color: "#e05252",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  if (submitted) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[600px] mx-auto px-6 text-center" style={{ paddingTop: "120px", paddingBottom: "120px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(62,207,142,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircle size={28} color="#3ecf8e" />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "32px",
              fontWeight: 600,
              color: "#0b0b0b",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Manuscrito enviado
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#666",
              lineHeight: 1.75,
              marginBottom: "12px",
            }}
          >
            Hemos recibido tu envío: <strong>{form.title}</strong>
          </p>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#999",
              lineHeight: 1.7,
              marginBottom: "36px",
            }}
          >
            Recibirás una confirmación a <strong>{form.email}</strong> en los próximos
            minutos. El equipo editorial revisará tu manuscrito en 5 días hábiles y te
            notificará sobre la decisión preliminar.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded"
              style={{
                background: "#0b0b0b",
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={13} /> Volver al inicio
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm(initialForm); }}
              style={{
                background: "transparent",
                border: "1px solid #e0e0e0",
                color: "#666",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Nuevo envío
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Dark header section */}
      <div style={{ background: "#0b0b0b", paddingBottom: "60px" }}>
        <Header theme="dark" />
        <div className="max-w-[1200px] mx-auto px-6" style={{ paddingTop: "60px" }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-10"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            <ArrowLeft size={12} /> Volver al inicio
          </Link>

          <div className="max-w-[640px]">
            <div className="flex items-center gap-2 mb-5">
              <div style={{ width: "28px", height: "1px", background: "#3ecf8e" }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#3ecf8e",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Convocatoria Abierta
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                marginBottom: "18px",
              }}
            >
              Publica tu investigación
            </h1>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.75,
                maxWidth: "520px",
              }}
            >
              CienciaEduc es la revista de referencia para la comunidad científica
              hispanohablante. Envíanos tu manuscrito para revisión por pares y publicación
              en acceso abierto con DOI permanente.
            </p>
          </div>
        </div>
      </div>

      {/* Form + guidelines */}
      <div className="max-w-[1200px] mx-auto px-6" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} noValidate>
              {/* Author info */}
              <div style={{ marginBottom: "40px" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#0b0b0b",
                    letterSpacing: "-0.01em",
                    marginBottom: "20px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  Información del Autor Principal
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      onFocus={() => setFocused("firstName")}
                      onBlur={() => setFocused(null)}
                      style={inputStyle(focused === "firstName")}
                      placeholder="Elena"
                    />
                    {errors.firstName && (
                      <p style={errorStyle}><AlertCircle size={10} />{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido *</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onFocus={() => setFocused("lastName")}
                      onBlur={() => setFocused(null)}
                      style={inputStyle(focused === "lastName")}
                      placeholder="Torres"
                    />
                    {errors.lastName && (
                      <p style={errorStyle}><AlertCircle size={10} />{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label style={labelStyle}>Institución Afiliada *</label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => handleChange("institution", e.target.value)}
                    onFocus={() => setFocused("institution")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === "institution")}
                    placeholder="Instituto de Neurobiología Celular, UNAM"
                  />
                  {errors.institution && (
                    <p style={errorStyle}><AlertCircle size={10} />{errors.institution}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label style={labelStyle}>Correo Electrónico *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === "email")}
                    placeholder="investigador@universidad.edu.mx"
                  />
                  {errors.email && (
                    <p style={errorStyle}><AlertCircle size={10} />{errors.email}</p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Coautores (opcional)</label>
                  <input
                    type="text"
                    value={form.coauthors}
                    onChange={(e) => handleChange("coauthors", e.target.value)}
                    onFocus={() => setFocused("coauthors")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === "coauthors")}
                    placeholder="Dr. A. García (UBA); Dra. B. López (CSIC)..."
                  />
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "11px",
                      color: "#bbb",
                      marginTop: "4px",
                    }}
                  >
                    Separa los coautores con punto y coma (;)
                  </p>
                </div>
              </div>

              {/* Manuscript details */}
              <div style={{ marginBottom: "40px" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#0b0b0b",
                    letterSpacing: "-0.01em",
                    marginBottom: "20px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  Detalles del Manuscrito
                </h2>

                <div className="mb-4">
                  <label style={labelStyle}>Título del Artículo *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    onFocus={() => setFocused("title")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === "title")}
                    placeholder="Título completo de tu investigación"
                  />
                  {errors.title && (
                    <p style={errorStyle}><AlertCircle size={10} />{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label style={labelStyle}>Categoría *</label>
                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      onFocus={() => setFocused("category")}
                      onBlur={() => setFocused(null)}
                      style={{
                        ...inputStyle(focused === "category"),
                        cursor: "pointer",
                        appearance: "none" as const,
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p style={errorStyle}><AlertCircle size={10} />{errors.category}</p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Tipo de Artículo *</label>
                    <select
                      value={form.articleType}
                      onChange={(e) => handleChange("articleType", e.target.value)}
                      onFocus={() => setFocused("articleType")}
                      onBlur={() => setFocused(null)}
                      style={{
                        ...inputStyle(focused === "articleType"),
                        cursor: "pointer",
                        appearance: "none" as const,
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {articleTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.articleType && (
                      <p style={errorStyle}><AlertCircle size={10} />{errors.articleType}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label style={labelStyle}>
                    Resumen / Abstract *{" "}
                    <span style={{ color: "#bbb", fontWeight: 400, textTransform: "none" }}>
                      ({form.abstract.length} caracteres)
                    </span>
                  </label>
                  <textarea
                    value={form.abstract}
                    onChange={(e) => handleChange("abstract", e.target.value)}
                    onFocus={() => setFocused("abstract")}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputStyle(focused === "abstract"),
                      minHeight: "140px",
                      resize: "vertical",
                      lineHeight: 1.65,
                    }}
                    placeholder="Presenta brevemente el propósito, metodología, resultados principales y conclusiones de tu investigación (150–300 palabras recomendadas)..."
                  />
                  {errors.abstract && (
                    <p style={errorStyle}><AlertCircle size={10} />{errors.abstract}</p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Palabras Clave *</label>
                  <input
                    type="text"
                    value={form.keywords}
                    onChange={(e) => handleChange("keywords", e.target.value)}
                    onFocus={() => setFocused("keywords")}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === "keywords")}
                    placeholder="Neurobiología, Redes Celulares, Simetría, Conectómica..."
                  />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb", marginTop: "4px" }}>
                    Separa con comas (4–8 palabras clave recomendadas)
                  </p>
                  {errors.keywords && (
                    <p style={errorStyle}><AlertCircle size={10} />{errors.keywords}</p>
                  )}
                </div>
              </div>

              {/* File upload */}
              <div style={{ marginBottom: "40px" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#0b0b0b",
                    letterSpacing: "-0.01em",
                    marginBottom: "20px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  Archivo del Manuscrito
                </h2>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: "center",
                    gap: "12px",
                    padding: "32px",
                    border: "2px dashed #e0e0e0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: form.fileName ? "rgba(62,207,142,0.04)" : "#fafafa",
                    borderColor: form.fileName ? "#3ecf8e" : "#e0e0e0",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.tex"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleChange("fileName", file.name);
                    }}
                  />
                  {form.fileName ? (
                    <>
                      <CheckCircle size={24} color="#3ecf8e" />
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#3ecf8e", fontWeight: 500 }}>
                        {form.fileName}
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#999" }}>
                        Haz clic para cambiar el archivo
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={24} color="#bbb" />
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#666", fontWeight: 500 }}>
                        Haz clic o arrastra tu manuscrito aquí
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#bbb" }}>
                        PDF, DOCX o LaTeX — máximo 25 MB
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Declarations */}
              <div style={{ marginBottom: "40px" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#0b0b0b",
                    letterSpacing: "-0.01em",
                    marginBottom: "20px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  Declaraciones
                </h2>

                {[
                  {
                    field: "declaration" as const,
                    label: "Declaro que este manuscrito es original, no ha sido publicado previamente, y no está bajo revisión simultánea en otra revista. Todos los autores han aprobado el envío.",
                  },
                  {
                    field: "openAccess" as const,
                    label: "Acepto la publicación en acceso abierto bajo licencia Creative Commons BY 4.0, permitiendo la reutilización con atribución.",
                  },
                ].map(({ field, label }) => (
                  <label
                    key={field}
                    className="flex items-start gap-3 cursor-pointer"
                    style={{ marginBottom: "16px" }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "3px",
                        border: `2px solid ${form[field] ? "#0b0b0b" : errors[field] ? "#e05252" : "#d0d0d0"}`,
                        background: form[field] ? "#0b0b0b" : "transparent",
                        flexShrink: 0,
                        marginTop: "1px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onClick={() => handleChange(field, !form[field])}
                    >
                      {form[field] && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        color: "#555",
                        lineHeight: 1.6,
                      }}
                    >
                      {label}
                    </span>
                  </label>
                ))}
                {errors.declaration && (
                  <p style={errorStyle}><AlertCircle size={10} />{errors.declaration}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 rounded flex items-center justify-center gap-2"
                style={{
                  background: "#0b0b0b",
                  color: "#ffffff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0b0b0b")}
              >
                Enviar Manuscrito para Revisión
              </button>
            </form>
          </div>

          {/* Sidebar: guidelines */}
          <div className="lg:col-span-1">
            <div
              style={{
                position: "sticky",
                top: "24px",
                background: "#f8f8f8",
                border: "1px solid #ebebeb",
                borderRadius: "6px",
                padding: "28px",
              }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#999",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                Directrices para Autores
              </p>

              {[
                {
                  title: "Extensión",
                  desc: "Investigaciones originales: 3,000–8,000 palabras. Cartas: 800–2,000 palabras. Revisiones: hasta 12,000 palabras.",
                },
                {
                  title: "Formato",
                  desc: "Manuscrito en PDF, DOCX o LaTeX. Figuras en resolución mínima 300 DPI. Tablas en formato editable.",
                },
                {
                  title: "Estilo de Citación",
                  desc: "Utilizamos formato APA 7ª edición. Las referencias deben estar numeradas y ordenadas alfabéticamente.",
                },
                {
                  title: "Idioma",
                  desc: "Se aceptan manuscritos en español e inglés. Se recomienda resumen bilingüe (español e inglés).",
                },
                {
                  title: "Ética",
                  desc: "Los estudios con sujetos humanos o animales deben incluir número de aprobación del comité de ética institucional.",
                },
                {
                  title: "Conflictos de Interés",
                  desc: "Declara cualquier financiación o conflicto de interés potencial en la sección de agradecimientos.",
                },
              ].map(({ title, desc }, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i < 5 ? "18px" : 0,
                    paddingBottom: i < 5 ? "18px" : 0,
                    borderBottom: i < 5 ? "1px solid #ebebeb" : "none",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#0b0b0b",
                      marginBottom: "5px",
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      color: "#777",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              ))}

              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "#0b0b0b",
                  borderRadius: "4px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.65,
                    marginBottom: "8px",
                  }}
                >
                  ¿Dudas sobre el proceso editorial?
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    color: "#3ecf8e",
                    fontWeight: 500,
                  }}
                >
                  editorial@cienciaeduc.org
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
