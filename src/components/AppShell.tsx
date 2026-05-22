import { useState } from "react";
import Dashboard from "./Dashboard";
import { Sidebar } from "./Sidebar";
import { CategoriesView } from "./CategoriesView";
import "./Sidebar.css";

export const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<
    "dashboard" | "reports" | "categories"
  >("dashboard");
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSelect = (s: "dashboard" | "reports" | "categories") => {
    setSection(s);
    setSidebarOpen(false);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Botón hamburguesa siempre visible */}
      <button
        className="btn btn-outline"
        style={{ position: "fixed", top: "1rem", left: "1rem", zIndex: 10 }}
        onClick={toggleSidebar}
      >
        ☰ Menú
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelect}
      />

      {/* Renderiza la sección elegida */}
      {section === "dashboard" && <Dashboard />}
      {section === "reports" && <div>📈 Reportes (pendiente)</div>}
      {section === "categories" && <CategoriesView />}
    </div>
  );
};
