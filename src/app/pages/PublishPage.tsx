import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, Upload, AlertCircle, ChevronRight, ChevronLeft, FileText, LogIn } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx";
const MAX_SIZE_MB = 25;

const ALLOWED_IMG_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
const ALLOWED_IMG_EXTENSIONS = ".jpg,.jpeg,.png,.svg,.webp";
const MAX_IMG_SIZE_MB = 5;

interface Coauthor {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  cedula?: string;
}

interface FormData {
  revistaId: number | "";
  lineaId: number | "";
  files: {
    manuscript: File | null;
    anonymousManuscript: File | null;
    authorsInfo: File | null;
    supplementaryMaterial: File | null;
    img: File | null;
  };
  titleEs: string;
  titleEn: string;
  abstractEs: string;
  abstractEn: string;
  keywords: string;
  firmaOriginalidad: boolean;
  firmaEtica: boolean;
  coauthors: Coauthor[];
  coauthorSearch: string;
}

const initialForm: FormData = {
  revistaId: "",
  lineaId: "",
  files: { manuscript: null, anonymousManuscript: null, authorsInfo: null, supplementaryMaterial: null, img: null },
  titleEs: "",
  titleEn: "",
  abstractEs: "",
  abstractEn: "",
  keywords: "",
  firmaOriginalidad: false,
  firmaEtica: false,
  coauthors: [],
  coauthorSearch: "",
};

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%", fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#0b0b0b",
    background: focused ? "#ffffff" : "#fafafa", border: `1px solid ${focused ? "#0b0b0b" : "#e8e8e8"}`,
    borderRadius: "4px", padding: "10px 12px", outline: "none", transition: "border-color 0.2s, background 0.2s",
    boxSizing: "border-box" as const,
  };
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Tipo de archivo no permitido. Solo se aceptan PDF, DOC o DOCX.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `El archivo excede el tamaño máximo de ${MAX_SIZE_MB}MB.`;
  }
  return null;
}

export function PublishPage() {
  const { isLoggedIn, openAuth, user } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [lineas, setLineas] = useState<any[]>([]);
  const [revistas, setRevistas] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lineasRes, revistasRes, usersRes] = await Promise.all([
          api.lineas.fetchAll(),
          api.revistas.fetchAll(),
          api.usuarios.fetchAll(),
        ]);
        setLineas(Array.isArray(lineasRes) ? lineasRes : []);
        setRevistas(Array.isArray(revistasRes) ? revistasRes : []);
        setAllUsers(Array.isArray(usersRes) ? usersRes : []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const currentUserId = user?.id;
  const availableUsers = useMemo(() => {
    return allUsers.filter((u: any) => u.id !== currentUserId && !form.coauthors.some((c) => c.id === u.id));
  }, [allUsers, currentUserId, form.coauthors]);

  const filteredUsers = useMemo(() => {
    if (!form.coauthorSearch.trim()) return [];
    const term = form.coauthorSearch.toLowerCase();
    return availableUsers.filter((u: any) =>
      (u.cedula?.toLowerCase().includes(term))
    ).slice(0, 5);
  }, [availableUsers, form.coauthorSearch]);

  const selectedRevista: any = revistas.find((r: any) => r.id === form.revistaId);
  const allowedLineaIds: number[] = selectedRevista?.lineas_permitidas || [];
  const filteredLineas = allowedLineaIds.length > 0
    ? lineas.filter((l: any) => allowedLineaIds.includes(l.id))
    : lineas;

  if (!isLoggedIn) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[500px] mx-auto px-6 text-center" style={{ paddingTop: "120px", paddingBottom: "120px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(224,82,82,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <LogIn size={28} color="#e05252" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Inicia sesión para enviar tu manuscrito
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", color: "#666", lineHeight: 1.75, marginBottom: "24px" }}>
            Debes tener una cuenta de investigador para acceder al formulario de envío de manuscritos.
          </p>
          <button onClick={openAuth} className="inline-flex items-center gap-2 px-6 py-3 rounded" style={{ background: "#0b0b0b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 600, border: "none", cursor: "pointer" }}>
            <LogIn size={16} /> Iniciar Sesión
          </button>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999", marginTop: "16px" }}>
            ¿No tienes cuenta?{" "}
            <button onClick={openAuth} style={{ color: "#0b0b0b", fontWeight: 500, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
              Regístrate gratis
            </button>
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const STEPS = [
    { num: 1, title: "Destino" },
    { num: 2, title: "Archivos" },
    { num: 3, title: "Metadatos" },
    { num: 4, title: "Envío" },
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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.revistaId) newErrors.revistaId = "Selecciona una revista";
      if (!form.lineaId) newErrors.lineaId = "Selecciona una línea";
    } else if (step === 2) {
      if (!form.files.manuscript) newErrors["files.manuscript"] = "Requerido";
      if (!form.files.anonymousManuscript) newErrors["files.anonymousManuscript"] = "Requerido";
    } else if (step === 3) {
      if (!form.titleEs.trim()) newErrors.titleEs = "Requerido";
      if (!form.titleEn.trim()) newErrors.titleEn = "Requerido";
      if (form.abstractEs.trim().length < 50) newErrors.abstractEs = "Mínimo 50 caracteres";
      if (!form.keywords.trim()) newErrors.keywords = "Requerido";
    } else if (step === 4) {
      if (!form.firmaOriginalidad) newErrors.firmaOriginalidad = "Debes aceptar la declaración de originalidad";
      if (!form.firmaEtica) newErrors.firmaEtica = "Debes declarar la conformidad ética";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSending(true);
    setSendError("");

    try {
      const fd = new FormData();
      fd.append("revista_id", String(form.revistaId));
      fd.append("linea_id", String(form.lineaId));
      fd.append("titulo_es", form.titleEs);
      fd.append("titulo_en", form.titleEn);
      fd.append("resumen_es", form.abstractEs);
      fd.append("resumen_en", form.abstractEn);
      fd.append("palabras_clave", form.keywords);
      fd.append("firma_originalidad", String(form.firmaOriginalidad));
      fd.append("firma_etica", String(form.firmaEtica));

      if (form.files.manuscript) fd.append("manuscrito_original", form.files.manuscript);
      if (form.files.anonymousManuscript) fd.append("manuscrito_anonimizado", form.files.anonymousManuscript);
      if (form.files.authorsInfo) fd.append("ficha_autores", form.files.authorsInfo);
      if (form.files.supplementaryMaterial) fd.append("material_suplementario", form.files.supplementaryMaterial);
      if (form.files.img) fd.append("img", form.files.img);
      if (form.coauthors.length > 0) fd.append("coautores", JSON.stringify(form.coauthors.map((c) => c.id)));

      await api.articulos.register(fd);

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSendError(err.message || "Error al enviar el manuscrito. Intenta de nuevo.");
    } finally {
      setSending(false);
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
            Hemos recibido tu envío: <strong>{form.titleEs}</strong> para la revista <strong>{selectedRevista?.nombre || ""}</strong>.
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

  const renderFileDrop = (fieldPath: string, label: string, desc: string, required: boolean) => {
    const file: File | null = (form as any).files[fieldPath.split(".")[1]];
    const fileName = file?.name || "";
    const hasError = errors[fieldPath];
    return (
      <div style={{ marginBottom: "16px" }}>
        <p style={labelStyle}>{label}{required && " *"}</p>
        <label style={{
          display: "flex", flexDirection: "row" as const, alignItems: "center", gap: "12px", padding: "16px 20px",
          border: `2px dashed ${hasError ? "#e05252" : fileName ? "#3ecf8e" : "#e0e0e0"}`, borderRadius: "6px",
          cursor: "pointer", background: fileName ? "rgba(62,207,142,0.04)" : "#fafafa", transition: "all 0.2s",
        }}>
          <input type="file" accept={ALLOWED_EXTENSIONS} style={{ display: "none" }} onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const err = validateFile(f);
            if (err) {
              setErrors((prev) => ({ ...prev, [fieldPath]: err }));
              e.target.value = "";
              return;
            }
            handleChange(fieldPath, f);
          }} />
          <div style={{ flex: 1 }}>
            {fileName ? (
              <div className="flex items-center gap-2">
                <FileText size={18} color="#3ecf8e" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#3ecf8e", fontWeight: 500 }}>{fileName}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", marginLeft: "4px" }}>
                  ({(file!.size / 1024 / 1024).toFixed(1)} MB)
                </span>
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
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                {currentStep === 1 && (
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "24px" }}>Paso 1: Selección de Destino</h2>

                    <div className="mb-5">
                      <label style={labelStyle}>Revista de destino *</label>
                      <select value={form.revistaId} onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : "";
                        setForm(p => ({ ...p, revistaId: val, lineaId: "" }));
                      }} style={{ ...inputStyle(focused === "revistaId"), cursor: "pointer", appearance: "none" as const }}>
                        <option value="">Seleccionar revista...</option>
                        {revistas.map((j: any) => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                      </select>
                      {errors.revistaId && <p style={errorStyle}><AlertCircle size={10} />{errors.revistaId}</p>}
                    </div>

                    <div className="mb-5">
                      <label style={labelStyle}>Línea de Investigación *</label>
                      <select value={form.lineaId} onChange={(e) => handleChange("lineaId", e.target.value ? Number(e.target.value) : "")} disabled={!form.revistaId} style={{ ...inputStyle(focused === "lineaId"), cursor: "pointer", appearance: "none" as const, opacity: form.revistaId ? 1 : 0.5 }}>
                        <option value="">{form.revistaId ? "Seleccionar línea de investigación..." : "Primero selecciona una revista"}</option>
                        {filteredLineas.map((l: any) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                      </select>
                      {errors.lineaId && <p style={errorStyle}><AlertCircle size={10} />{errors.lineaId}</p>}
                      {form.revistaId && allowedLineaIds.length > 0 && (
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", marginTop: "4px" }}>
                          {filteredLineas.length} línea{filteredLineas.length !== 1 ? "s" : ""} disponible{filteredLineas.length !== 1 ? "s" : ""} para esta revista
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "8px" }}>Paso 2: Carga de Archivos</h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", marginBottom: "24px" }}>Asegúrate de que tu manuscrito esté anonimizado para la revisión por pares a doble ciego.</p>

                    {renderFileDrop("files.manuscript", "Manuscrito Original", "Resumen, cuerpo y referencias. Incluye nombres de autores.", true)}
                    {renderFileDrop("files.anonymousManuscript", "Manuscrito Anonimizado", "Versión sin nombres de autores para revisión a doble ciego.", true)}
                    {renderFileDrop("files.authorsInfo", "Ficha de Autores", "ORCIDs y contribución CRediT.", false)}
                    {renderFileDrop("files.supplementaryMaterial", "Material Complementario", "Tablas, figuras, datos adicionales (opcional).", false)}

                    <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #efefef" }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600, color: "#333", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "12px" }}>
                        Imagen de Portada del Artículo
                      </p>
                      {(() => {
                        const file: File | null = form.files.img;
                        const fileName = file?.name || "";
                        const hasError = errors["files.img"];
                        return (
                          <div>
                            <label style={{
                              display: "flex", flexDirection: "row" as const, alignItems: "center", gap: "12px", padding: "16px 20px",
                              border: `2px dashed ${hasError ? "#e05252" : fileName ? "#3ecf8e" : "#e0e0e0"}`, borderRadius: "6px",
                              cursor: "pointer", background: fileName ? "rgba(62,207,142,0.04)" : "#fafafa", transition: "all 0.2s",
                            }}>
                              <input type="file" accept={ALLOWED_IMG_EXTENSIONS} style={{ display: "none" }} onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                if (!ALLOWED_IMG_TYPES.includes(f.type)) {
                                  setErrors((prev) => ({ ...prev, "files.img": "Formato no válido. Solo JPG, PNG, SVG o WebP." }));
                                  e.target.value = "";
                                  return;
                                }
                                if (f.size > MAX_IMG_SIZE_MB * 1024 * 1024) {
                                  setErrors((prev) => ({ ...prev, "files.img": `La imagen excede ${MAX_IMG_SIZE_MB}MB.` }));
                                  e.target.value = "";
                                  return;
                                }
                                setErrors((prev) => ({ ...prev, "files.img": "" }));
                                handleChange("files.img", f);
                              }} />
                              <div style={{ flex: 1 }}>
                                {fileName ? (
                                  <div className="flex items-center gap-2">
                                    <FileText size={18} color="#3ecf8e" />
                                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#3ecf8e", fontWeight: 500 }}>{fileName}</span>
                                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", marginLeft: "4px" }}>
                                      ({(file!.size / 1024 / 1024).toFixed(1)} MB)
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Upload size={18} color="#aaa" />
                                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666" }}>Selecciona una imagen de portada...</span>
                                  </div>
                                )}
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa", marginTop: "4px", marginLeft: "26px" }}>
                                  Imagen representativa del artículo. JPG, PNG, SVG o WebP — Máximo {MAX_IMG_SIZE_MB}MB
                                </p>
                              </div>
                            </label>
                            {hasError && <p style={errorStyle}><AlertCircle size={10} />{hasError}</p>}
                          </div>
                        );
                      })()}
                    </div>

                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#888", marginTop: "8px" }}>
                      Formatos aceptados: PDF, DOC, DOCX — Máximo {MAX_SIZE_MB}MB
                    </p>
                  </div>
                )}

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
                      <label style={labelStyle}>Abstract (Inglés)</label>
                      <textarea value={form.abstractEn} onChange={(e) => handleChange("abstractEn", e.target.value)} style={{ ...inputStyle(focused === "abstractEn"), minHeight: "100px", resize: "vertical" }} placeholder="Abstract in English..." />
                    </div>

                    <div className="mb-4">
                      <label style={labelStyle}>Palabras Clave *</label>
                      <input type="text" value={form.keywords} onChange={(e) => handleChange("keywords", e.target.value)} style={inputStyle(focused === "keywords")} placeholder="Ej: Salud, Nutrición, Niños" />
                      {errors.keywords && <p style={errorStyle}><AlertCircle size={10} />{errors.keywords}</p>}
                    </div>

                    <div className="mb-4">
                      <label style={labelStyle}>Coautores</label>
                      <input
                        type="text"
                        value={form.coauthorSearch}
                        onChange={(e) => handleChange("coauthorSearch", e.target.value)}
                        style={inputStyle(focused === "coauthorSearch")}
                        placeholder="Buscar coautor por cédula..."
                      />
                      {filteredUsers.length > 0 && (
                        <div style={{ border: "1px solid #e8e8e8", borderRadius: "4px", marginTop: "4px", background: "#fff", maxHeight: "150px", overflowY: "auto" }}>
                          {filteredUsers.map((u: any) => (
                            <div
                              key={u.id}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  coauthors: [...prev.coauthors, { id: u.id, nombre: u.nombre, apellido: u.apellido, correo: u.correo, cedula: u.cedula }],
                                  coauthorSearch: "",
                                }));
                              }}
                              style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#444" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                            >
                              <span style={{ fontWeight: 600 }}>{u.cedula || '—'}</span> — {u.nombre} {u.apellido} <span style={{ color: "#888", fontSize: "12px" }}>({u.correo})</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {form.coauthors.length > 0 && (
                        <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                          {form.coauthors.map((c) => (
                            <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "#f0f0f0", borderRadius: "12px", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#333" }}>
                              {c.cedula ? <span style={{ fontWeight: 600, marginRight: "4px" }}>{c.cedula}</span> : null}{c.nombre} {c.apellido}
                              <button
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({ ...prev, coauthors: prev.coauthors.filter((x) => x.id !== c.id) }));
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "12px", padding: 0, lineHeight: 1 }}
                                title="Quitar coautor"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", marginBottom: "8px" }}>Paso 4: Declaraciones y Envío</h2>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", marginBottom: "24px" }}>Revisa y acepta las declaraciones antes de enviar tu manuscrito.</p>

                    {sendError && (
                      <div className="flex items-center gap-2 p-4 rounded mb-6" style={{ background: "rgba(224,82,82,0.08)", border: "1px solid rgba(224,82,82,0.2)" }}>
                        <AlertCircle size={16} color="#e05252" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#e05252" }}>{sendError}</span>
                      </div>
                    )}

                    <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "6px", border: "1px solid #efefef", marginBottom: "24px" }}>
                      <label className="flex items-start gap-3 cursor-pointer mb-3">
                        <input type="checkbox" checked={form.firmaOriginalidad} onChange={(e) => handleChange("firmaOriginalidad", e.target.checked)} style={{ marginTop: "3px" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#444", lineHeight: 1.5 }}>
                          Declaro bajo firma digital que este manuscrito es original, inédito y que no ha sido postulado simultáneamente en otras revistas. *
                        </span>
                      </label>
                      {errors.firmaOriginalidad && <p style={errorStyle}><AlertCircle size={10} />{errors.firmaOriginalidad}</p>}

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.firmaEtica} onChange={(e) => handleChange("firmaEtica", e.target.checked)} style={{ marginTop: "3px" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#444", lineHeight: 1.5 }}>
                          Declaro bajo firma digital que el estudio cumple con los lineamientos éticos internacionales para la investigación. *
                        </span>
                      </label>
                      {errors.firmaEtica && <p style={errorStyle}><AlertCircle size={10} />{errors.firmaEtica}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid #f0f0f0" }}>
              <button onClick={handlePrev} style={{ visibility: currentStep === 1 ? "hidden" : "visible", background: "transparent", border: "1px solid #e0e0e0", borderRadius: "4px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#555", cursor: "pointer" }}>
                <ChevronLeft size={14} /> Atrás
              </button>

              {currentStep < 4 ? (
                <button onClick={handleNext} style={{ background: "#0b0b0b", border: "none", color: "#fff", borderRadius: "4px", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 500, cursor: "pointer" }}>
                  Siguiente <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={sending} style={{ background: sending ? "#999" : "#3ecf8e", border: "none", color: "#fff", borderRadius: "4px", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "17px", fontWeight: 600, cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1 }}>
                  {sending ? "Enviando..." : <><CheckCircle size={16} /> Enviar Manuscrito</>}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 hidden lg:block">
            <div style={{ position: "sticky", top: "24px", background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: "6px", padding: "28px" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
                Directrices Rápidas
              </p>
              {[
                { title: "Doble Ciego", desc: "No incluir nombres ni afiliaciones en el documento principal." },
                { title: "Formato", desc: "PDF o DOCX de hasta 25MB." },
                { title: "Referencias", desc: "Estilo APA 7ma edición." },
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
