import { createBrowserRouter, Link } from "react-router";
import { Root } from "./Root";
// ── Public features ────────────────────────────────
import { HomePage } from "./features/home/HomePage";
import { ArticlePage } from "./features/article/ArticlePage";
import { ArchivesPage } from "./features/archives/ArchivesPage";
import { CategoryPage } from "./features/category/CategoryPage";
import { AboutPage } from "./features/about/AboutPage";
import { SearchPage } from "./features/search/SearchPage";
import { PublishPage } from "./features/publish/PublishPage";
// ── Dashboard features ─────────────────────────────
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { InvestigadorDashboard } from "./features/dashboard/InvestigadorDashboard";
import { EditorDashboard } from "./features/dashboard/EditorDashboard";
import { JuradoDashboard } from "./features/dashboard/JuradoDashboard";
import { AdminDashboard } from "./features/dashboard/AdminDashboard";

function NotFound() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-40 text-center">
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "80px", fontWeight: 700, color: "#f0f0f0", lineHeight: 1, marginBottom: "24px" }}>
          404
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, color: "#0b0b0b", marginBottom: "10px" }}>
          Página no encontrada
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#888", marginBottom: "24px" }}>
          El contenido que buscas no existe o fue movido.
        </p>
        <Link to="/" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#0b0b0b", fontWeight: 500, textDecoration: "underline" }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "articulo/:slug", Component: ArticlePage },
      { path: "archivos", Component: ArchivesPage },
      { path: "categoria/:slug", Component: CategoryPage },
      { path: "acerca", Component: AboutPage },
      { path: "buscar", Component: SearchPage },
      { path: "publicar", Component: PublishPage },
      // ── Dashboards (feature folder) ──
      { path: "dashboard", Component: DashboardPage },
      { path: "dashboard/investigador", Component: InvestigadorDashboard },
      { path: "dashboard/editor", Component: EditorDashboard },
      { path: "dashboard/jurado", Component: JuradoDashboard },
      { path: "dashboard/admin", Component: AdminDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);