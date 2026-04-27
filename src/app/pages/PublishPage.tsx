import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, Upload, AlertCircle, ChevronRight, ChevronLeft, Plus, Trash2, FileText } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "motion/react";

const JOURNALS = ["CIENCIAEDUC", "Revista UNERG Salud", "Ensayos Académicos"];
const PROGRAMS = ["Doctorado en Ciencias de la Salud", "Maestría en Enfermería", "Especialización en Salud Pública", "Pregrado en Medicina"];
const RESEARCH_LINES = ["Biología Celular", "Salud Pública", "Epidemiología", "Neurociencia", "Gestión Hospitalaria"];

interface Coauthor {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  orcid: string;
}

interface FormData {
  journal: string;
  program: string;
  researchLine: string;
  files: {
    manuscript: string;
    titlePage: string;
    originalityLetter: string;
    ethicsCert: string;
    authorsInfo: string;
  };
  titleEs: string;
  titleEn: string;
  abstractEs: string;
  abstractEn: string;
  keywords: string;
  doi: string;
  coauthors: Coauthor[];
  declaration: boolean;
  openAccess: boolean;
}

const initialForm: FormData = {
  journal: "",
  program: "",
  researchLine: "",
  files: { manuscript: "", titlePage: "", originalityLetter: "", ethicsCert: "", authorsInfo: "" },
  titleEs: "",
  titleEn: "",
  abstractEs: "",
  abstractEn: "",
  keywords: "",
  doi: "",
  coauthors: [],
  declaration: false,
  openAccess: false,
};

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#0b0b0b",
    background: focused ? "#ffffff" : "#fafafa", border: `1px solid ${focused ? "#0b0b0b" : "#e8e8e8"}`,
    borderRadius: "4px", padding: "10px 12px", outline: "none", transition: "border-color 0.2s, background 0.2s",
    boxSizing: "border-box" as const,
  };
}

export function PublishPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const STEPS = [
    { num: 1, title: "Inicio" },
    { num: 2, title: "Carga de Archivos" },
    { num: 3, title: "Metadatos" },
    { num: 4, title: "Coautores y Envío" },
  ];

  const handleChange = (field: string, value: any) => {
    setForm((prev) => {
      const keys = field.split(".");
      if (keys.length === 2) {
        return { ...prev, [keys[0]]: { ...(prev as any)[keys[0]], [keys[1]]: value } };
      }
      return { ...prev, [field]: value };
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddCoauthor = () => {
    setForm(p => ({
      ...p,
      coauthors: [...p.coauthors, { id: crypto.randomUUID(), name: "", email: "", affiliation: "", orcid: "" }]
    }));
  };

  const handleUpdateCoauthor = (id: string, field: keyof Coauthor, value: string) => {
    setForm(p => ({
      ...p,
      coauthors: p.coauthors.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleRemoveCoauthor = (id: string) => {
    setForm(p => ({ ...p, coauthors: p.coauthors.filter(c => c.id !== id) }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.journal) newErrors.journal = "Selecciona una revista";
      if (!form.program) newErrors.program = "Selecciona un programa";
      if (!form.researchLine) newErrors.researchLine = "Selecciona una línea";
    } else if (step === 2) {
      if (!form.files.manuscript) newErrors["files.manuscript"] = "Requerido";
      if (!form.files.titlePage) newErrors["files.titlePage"] = "Requerido";
      if (!form.files.originalityLetter) newErrors["files.originalityLetter"] = "Requerido";
    } else if (step === 3) {
      if (!form.titleEs.trim()) newErrors.titleEs = "Requerido";
      if (!form.titleEn.trim()) newErrors.titleEn = "Requerido";
      if (form.abstractEs.trim().length < 50) newErrors.abstractEs = "Mínimo 50 caracteres";
      if (!form.keywords.trim()) newErrors.keywords = "Requerido";
    } else if (step === 4) {
      if (!form.declaration) newErrors.declaration = "Debes aceptar la declaración";
      form.coauthors.forEach((c, i) => {
        if (!c.name) newErrors[`coauthor_${i}_name`] = "Requerido";
        if (!c.email) newErrors[`coauthor_${i}_email`] = "Requerido";
        if (!c.affiliation) newErrors[`coauthor_${i}_affiliation`] = "Requerido";
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(p => Math.min(p + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setCurrentStep(p => Math.max(p - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const labelStyle: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "#333", letterSpacing: "0.04em", textTransform: "uppercase" as const, display: "block", marginBottom: "6px" };
  const errorStyle: React.CSSProperties = { fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#e05252", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" };

  if (submitted) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[600px] mx-auto px-6 text-center" style={{ paddingTop: "120px", paddingBottom: "120px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(62,207,142,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={28} color="#3ecf8e" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Manuscrito enviado
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", color: "#666", lineHeight: 1.75, marginBottom: "12px" }}>
            Hemos recibido tu envío: <strong>{form.titleEs}</strong> para la revista <strong>{form.journal}</strong>.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/dashboard/investigador" className="inline-flex items-center gap-2 px-5 py-2.5 rounded" style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>
              Ir a mi panel
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderFileDrop = (fieldPath: string, label: string, desc: string) => {
    const fileName = (form as any).files[fieldPath.split(".")[1]];
    const hasError = errors[fieldPath];
    return (
      <div style={{ marginBottom: "16px" }}>
        <p style={labelStyle}>{label}</p>
        <label style={{
          display: "flex", flexDirection: "row" as const, alignItems: "center", gap: "12px", padding: "16px 20px",
          border: `2px dashed ${hasError ? "#e05252" : fileName ? "#3ecf8e" : "#e0e0e0"}`, borderRadius: "6px",
          cursor: "pointer", background: fileName ? "rgba(62,207,142,0.04)" : "#fafafa", transition: "all 0.2s",
        }}>
          <input type="file" style={{ display: "none" }} onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleChange(fieldPath, f.name);
          }} />
          <div style={{ flex: 1 }}>
            {fileName ? (
              <div className="flex items-center gap-2">
                <FileText size={18} color="#3ecf8e" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#3ecf8e", fontWeight: 500 }}>{fileName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload size={18} color="#aaa" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>Selecciona o arrastra el archivo aquí...</span>
              </div>
            )}
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa", marginTop: "4px", marginLeft: "26px" }}>{desc}</p>
          </div>
        </label>
        {hasError && <p style={errorStyle}><AlertCircle size={10} />{hasError}</p>}
      </div>
    );
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ background: "#0b0b0b", paddingBottom: "60px" }}>
        <Header theme="dark" />
        <div className="max-w-[1000px] mx-auto px-6" style={{ paddingTop: "40px" }}>
          <Link to="/dashboard/investigador" className="inline-flex items-center gap-2 mb-8" style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
            <ArrowLeft size={12} /> Volver al dashboard
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 600, color: "#ffffff", marginBottom: "30px" }}>
            Envío de Manuscrito
          </h1>

          {/* Stepper Header */}
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: currentStep >= step.num ? "#3ecf8e" : "#333", color: currentStep >= step.num ? "#000" : "#888",
                    fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600, transition: "all 0.3s"
                  }}>
                    {currentStep > step.num ? <CheckCircle size={14} /> : step.num}
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: currentStep === step.num ? 600 : 400, color: currentStep >= step.num ? "#fff" : "#888", transition: "all 0.3s" }}>
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && <div style={{ width: "24px", height: "1px", background: "#333" }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6" style={{ paddingTop: "50px", paddingBottom: "80px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "24px" }}>Paso 1: Selección de Destino</h2>
                    
                    <div className="mb-5">
                      <label style={labelStyle}>Revista de destino *</label>
                      <select value={form.journal} onChange={(e) => handleChange("journal", e.target.value)} style={{ ...inputStyle(focused === "journal"), cursor: "pointer", appearance: "none" as const }}>
                        <option value="">Seleccionar revista...</option>
                        {JOURNALS.map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                      {errors.journal && <p style={errorStyle}><AlertCircle size={10} />{errors.journal}</p>}
                    </div>

                    <div className="mb-5">
                      <label style={labelStyle}>Programa *</label>
                      <select value={form.program} onChange={(e) => handleChange("program", e.target.value)} style={{ ...inputStyle(focused === "program"), cursor: "pointer", appearance: "none" as const }}>
                        <option value="">Seleccionar programa académico...</option>
                        {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.program && <p style={errorStyle}><AlertCircle size={10} />{errors.program}</p>}
                    </div>

                    <div className="mb-5">
                      <label style={labelStyle}>Línea de Investigación *</label>
                      <select value={form.researchLine} onChange={(e) => handleChange("researchLine", e.target.value)} style={{ ...inputStyle(focused === "researchLine"), cursor: "pointer", appearance: "none" as const }}>
                        <option value="">Seleccionar línea de investigación...</option>
                        {RESEARCH_LINES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      {errors.researchLine && <p style={errorStyle}><AlertCircle size={10} />{errors.researchLine}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "8px" }}>Paso 2: Carga de Archivos</h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", marginBottom: "24px" }}>Por favor, asegúrate de que tu manuscrito original esté anonimizado para la revisión por pares a doble ciego.</p>
                    
                    {renderFileDrop("files.manuscript", "Manuscrito Original (Anonimizado) *", "Debe incluir resumen, cuerpo y referencias. Sin nombres de autores. (PDF o DOCX)")}
                    {renderFileDrop("files.titlePage", "Página de Título *", "Contiene el título y todos los datos de los autores y filiaciones. (PDF o DOCX)")}
                    {renderFileDrop("files.originalityLetter", "Carta de Originalidad *", "Firmada por todos los autores indicando que el trabajo es inédito.")}
                    {renderFileDrop("files.ethicsCert", "Certificado de Ética (Si aplica)", "Requerido si el estudio involucró humanos o animales.")}
                    {renderFileDrop("files.authorsInfo", "Ficha de Autores (Opcional)", "Información adicional, ORCIDs y contribución CRediT.")}
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "24px" }}>Paso 3: Metadatos del Artículo</h2>

                    <div className="mb-4">
                      <label style={labelStyle}>Título (Español) *</label>
                      <input type="text" value={form.titleEs} onChange={(e) => handleChange("titleEs", e.target.value)} style={inputStyle(focused === "titleEs")} placeholder="Título en español" />
                      {errors.titleEs && <p style={errorStyle}><AlertCircle size={10} />{errors.titleEs}</p>}
                    </div>

                    <div className="mb-4">
                      <label style={labelStyle}>Título (Inglés) *</label>
                      <input type="text" value={form.titleEn} onChange={(e) => handleChange("titleEn", e.target.value)} style={inputStyle(focused === "titleEn")} placeholder="Title in English" />
                      {errors.titleEn && <p style={errorStyle}><AlertCircle size={10} />{errors.titleEn}</p>}
                    </div>

                    <div className="mb-4">
                      <label style={labelStyle}>Resumen (Español) *</label>
                      <textarea value={form.abstractEs} onChange={(e) => handleChange("abstractEs", e.target.value)} style={{ ...inputStyle(focused === "abstractEs"), minHeight: "100px", resize: "vertical" }} placeholder="Resumen en español (aprox. 250 palabras)..." />
                      {errors.abstractEs && <p style={errorStyle}><AlertCircle size={10} />{errors.abstractEs}</p>}
                    </div>

                    <div className="mb-4">
                      <label style={labelStyle}>Abstract (Inglés) *</label>
                      <textarea value={form.abstractEn} onChange={(e) => handleChange("abstractEn", e.target.value)} style={{ ...inputStyle(focused === "abstractEn"), minHeight: "100px", resize: "vertical" }} placeholder="Abstract in English..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label style={labelStyle}>Palabras Clave *</label>
                        <input type="text" value={form.keywords} onChange={(e) => handleChange("keywords", e.target.value)} style={inputStyle(focused === "keywords")} placeholder="Ej: Salud, Nutrición, Niños" />
                        {errors.keywords && <p style={errorStyle}><AlertCircle size={10} />{errors.keywords}</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>DOI (Opcional)</label>
                        <input type="text" value={form.doi} onChange={(e) => handleChange("doi", e.target.value)} style={inputStyle(focused === "doi")} placeholder="Ej: 10.1234/ preprint" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "8px" }}>Paso 4: Coautores y Envío</h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", marginBottom: "24px" }}>Añade la información de todos los colaboradores del estudio.</p>
                    
                    <div className="mb-6">
                      {form.coauthors.map((coauthor, i) => (
                        <div key={coauthor.id} style={{ background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: "6px", padding: "16px", marginBottom: "12px" }}>
                          <div className="flex justify-between items-center mb-3">
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600, color: "#555" }}>Coautor {i + 1}</span>
                            <button onClick={() => handleRemoveCoauthor(coauthor.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e05252" }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <input type="text" value={coauthor.name} onChange={(e) => handleUpdateCoauthor(coauthor.id, "name", e.target.value)} style={inputStyle(false)} placeholder="Nombre completo *" />
                              {errors[`coauthor_${i}_name`] && <p style={errorStyle}><AlertCircle size={10} />Requerido</p>}
                            </div>
                            <div>
                              <input type="email" value={coauthor.email} onChange={(e) => handleUpdateCoauthor(coauthor.id, "email", e.target.value)} style={inputStyle(false)} placeholder="Correo electrónico *" />
                              {errors[`coauthor_${i}_email`] && <p style={errorStyle}><AlertCircle size={10} />Requerido</p>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <input type="text" value={coauthor.affiliation} onChange={(e) => handleUpdateCoauthor(coauthor.id, "affiliation", e.target.value)} style={inputStyle(false)} placeholder="Filiación (Ej: UNERG) *" />
                              {errors[`coauthor_${i}_affiliation`] && <p style={errorStyle}><AlertCircle size={10} />Requerido</p>}
                            </div>
                            <div>
                              <input type="text" value={coauthor.orcid} onChange={(e) => handleUpdateCoauthor(coauthor.id, "orcid", e.target.value)} style={inputStyle(false)} placeholder="ORCID (Opcional)" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={handleAddCoauthor} className="flex items-center gap-2 w-full py-3 justify-center" style={{ background: "transparent", border: "1px dashed #ccc", borderRadius: "6px", color: "#666", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500 }}>
                        <Plus size={14} /> Agregar Coautor
                      </button>
                    </div>

                    <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "6px", border: "1px solid #efefef", marginBottom: "24px" }}>
                      <label className="flex items-start gap-3 cursor-pointer mb-3">
                        <input type="checkbox" checked={form.declaration} onChange={(e) => handleChange("declaration", e.target.checked)} style={{ marginTop: "3px" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#444", lineHeight: 1.5 }}>
                          Declaro que este manuscrito es original, no ha sido publicado previamente y no está bajo revisión en otra revista. *
                        </span>
                      </label>
                      {errors.declaration && <p style={errorStyle}><AlertCircle size={10} />{errors.declaration}</p>}
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.openAccess} onChange={(e) => handleChange("openAccess", e.target.checked)} style={{ marginTop: "3px" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#444", lineHeight: 1.5 }}>
                          Acepto publicación en acceso abierto bajo licencia CC BY 4.0.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid #f0f0f0" }}>
              <button
                onClick={handlePrev}
                style={{ visibility: currentStep === 1 ? "hidden" : "visible", background: "transparent", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#555", cursor: "pointer" }}
              >
                <ChevronLeft size={14} /> Atrás
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  style={{ background: "#0b0b0b", border: "none", color: "#fff", borderRadius: "4px", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, cursor: "pointer" }}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  style={{ background: "#3ecf8e", border: "none", color: "#fff", borderRadius: "4px", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "17px", fontWeight: 600, cursor: "pointer" }}
                >
                  <CheckCircle size={16} /> Enviar Manuscrito
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Guidelines */}
          <div className="lg:col-span-1 hidden lg:block">
            <div style={{ position: "sticky", top: "24px", background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: "6px", padding: "28px" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
                Directrices Rápidas
              </p>
              {[
                { title: "Doble Ciego", desc: "Asegúrate de no incluir nombres ni afiliaciones en el documento principal." },
                { title: "Formato", desc: "Se aceptan documentos PDF o DOCX de hasta 25MB." },
                { title: "Referencias", desc: "Usa estilo APA 7ma edición para todas las citas." },
              ].map((g, i) => (
                <div key={i} style={{ marginBottom: "16px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 600, color: "#333", marginBottom: "4px" }}>{g.title}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#777", lineHeight: 1.5 }}>{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
