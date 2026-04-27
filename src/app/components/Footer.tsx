import { Link } from "react-router";

export function Footer() {
  return (
    <footer
      className="w-full border-t mt-16"
      style={{ borderColor: "#e8e8e8", background: "#fff" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#888",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            © 2024 CIENCIAEDUC. AN EMPIRICAL PUBLICATION FOR GLOBAL SCIENCE.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: "EDITORIAL POLICY", path: "/politica-editorial" },
              { label: "CITATION TOOLS", path: "/herramientas-cita" },
              { label: "OPEN ACCESS", path: "/acceso-abierto" },
              { label: "CONTACT", path: "/contacto" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "#888",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
