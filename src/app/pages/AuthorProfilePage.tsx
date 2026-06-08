import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { User, Mail, Building2, FileText, Download, BookOpen, ChevronRight, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { api, BASE_URL } from "../api/api";

interface AutorProfile {
  id: number;
  nombre: string;
  segundo_nombre?: string;
  apellido: string;
  segundo_apellido?: string;
  cedula?: string;
  correo: string;
  oncti?: string;
  afiliacion_institucional: string;
  rol: string;
  cv?: string;
  created_at?: string;
  articulos_principales?: any[];
  articulos_secundarios?: any[];
}

export function AuthorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [autor, setAutor] = useState<AutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAutor = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.autores.fetchProfile(id!);
        setAutor(data.data || data);
      } catch (err: any) {
        setError("Error al cargar el perfil del autor: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAutor();
  }, [id]);

  const fullName = autor
    ? [autor.nombre, autor.segundo_nombre, autor.apellido, autor.segundo_apellido].filter(Boolean).join(" ")
    : "";

  const allArticles = [
    ...(autor?.articulos_principales || []).map((a: any) => ({ ...a, rol_autor: "Autor principal" })),
    ...(autor?.articulos_secundarios || []).map((a: any) => ({ ...a, rol_autor: "Autor secundario" }))
  ].sort((a: any, b: any) => new Date(b.fecha_recepcion || b.fecha_publicacion || 0).getTime() - new Date(a.fecha_recepcion || a.fecha_publicacion || 0).getTime());

  if (loading) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="flex items-center justify-center py-40">
          <Loader2 size={24} color="#888" className="animate-spin" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginLeft: "12px" }}>Cargando perfil...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !autor) {
    return (
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <Header theme="light" />
        <div className="max-w-[800px] mx-auto px-6 py-40 text-center">
          <AlertCircle size={48} color="#e05252" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: "#0b0b0b", marginBottom: "10px" }}>
            Autor no encontrado
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", color: "#888", marginBottom: "24px" }}>
            {error || "El perfil que buscas no existe o fue movido."}
          </p>
          <Link to="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "17px", color: "#0b0b0b", fontWeight: 500, textDecoration: "underline" }}>
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <Header theme="light" />

      {/* Breadcrumb */}
      <div className="border-b" style={{ borderColor: "#f0f0f0" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-2">
          <Link to="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa", textDecoration: "none", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Inicio
          </Link>
          <ChevronRight size={11} color="#ddd" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Autor
          </span>
          <ChevronRight size={11} color="#ddd" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {fullName}
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
          {/* MAIN CONTENT */}
          <main>
            {/* Profile header */}
            <div className="flex items-start gap-5 mb-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#f0f0f0" }}>
                <User size={32} color="#888" />
              </div>
              <div className="flex-1">
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  {fullName}
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#888", marginBottom: "4px" }}>
                  {autor.afiliacion_institucional}
                </p>
                {autor.oncti && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>
                    ONCTI: {autor.oncti}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "#f0f0f0", marginBottom: "32px" }} />

            {/* Articles list */}
            <div className="mb-8">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600, color: "#0b0b0b", letterSpacing: "-0.01em", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                Artículos Publicados ({allArticles.length})
              </h2>

              {allArticles.length === 0 ? (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#999", padding: "20px 0" }}>
                  Este autor aún no tiene artículos publicados.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {allArticles.map((articulo: any) => (
                    <div key={articulo.id} className="p-4 rounded" style={{ border: "1px solid #f0f0f0", background: "#fafafa" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span style={{ padding: "2px 8px", borderRadius: "10px", background: articulo.rol_autor === "Autor principal" ? "rgba(62,207,142,0.12)" : "rgba(108,142,191,0.12)", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, color: articulo.rol_autor === "Autor principal" ? "#3ecf8e" : "#6c8ebf", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              {articulo.rol_autor}
                            </span>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#bbb" }}>
                              {articulo.status}
                            </span>
                          </div>
                          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, marginBottom: "6px" }}>
                            {articulo.titulo_es || articulo.titulo || "Sin título"}
                          </h3>
                          {articulo.resumen_es && (
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#666", lineHeight: 1.5, marginBottom: "8px" }}>
                              {articulo.resumen_es.substring(0, 200)}{articulo.resumen_es.length > 200 ? "..." : ""}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            {articulo.fecha_recepcion && (
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>
                                Recibido: {new Date(articulo.fecha_recepcion).toLocaleDateString("es-VE")}
                              </span>
                            )}
                            {articulo.fecha_publicacion && (
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#aaa" }}>
                                Publicado: {new Date(articulo.fecha_publicacion).toLocaleDateString("es-VE")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link to={`/articulo/${articulo.titulo_es?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "-").replace(/[^a-z0-9-]/g, "") || `articulo-${articulo.id}`}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#3ecf8e", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                          Ver <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            {/* Personal info card */}
            <div className="rounded p-5" style={{ border: "1px solid #e8e8e8", background: "#ffffff", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div className="flex items-center gap-2 mb-4">
                <User size={13} color="#aaa" />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Datos Personales
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={14} color="#bbb" />
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>Nombre completo</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333" }}>{fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={14} color="#bbb" />
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>Correo electrónico</p>
                    <a href={`mailto:${autor.correo}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#3ecf8e", textDecoration: "none" }}>
                      {autor.correo}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 size={14} color="#bbb" />
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>Afiliación institucional</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333" }}>{autor.afiliacion_institucional}</p>
                  </div>
                </div>

                {autor.cedula && (
                  <div className="flex items-center gap-3">
                    <FileText size={14} color="#bbb" />
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>Cédula</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333" }}>{autor.cedula}</p>
                    </div>
                  </div>
                )}

                {autor.oncti && (
                  <div className="flex items-center gap-3">
                    <FileText size={14} color="#bbb" />
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#aaa" }}>Registro ONCTI</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#333" }}>{autor.oncti}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CV Card */}
            {autor.cv && (
              <div className="rounded p-5" style={{ border: "1px solid #e8e8e8", background: "#fafafa" }}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={13} color="#aaa" />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Currículum Vitae
                  </p>
                </div>
                <a
                  href={`${BASE_URL}/${autor.cv}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded w-full justify-center"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", background: "#3ecf8e", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "none", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  <Download size={14} />
                  Descargar CV
                </a>
              </div>
            )}

            {/* Contact Card */}
            <div className="rounded p-5" style={{ background: "#0b0b0b" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>
                Contactar Autor
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: "12px" }}>
                Envía un correo directamente al autor.
              </p>
              <a
                href={`mailto:${autor.correo}?subject=Contacto desde SaberUnerg`}
                className="w-full py-2 rounded flex items-center justify-center"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 500, color: "#0b0b0b", background: "#3ecf8e", border: "none", cursor: "pointer", letterSpacing: "0.02em", textDecoration: "none" }}
              >
                <Mail size={14} style={{ marginRight: "8px" }} />
                Enviar Correo
              </a>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
