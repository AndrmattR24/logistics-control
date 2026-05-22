import React, { useEffect, useState } from "react";
import { useDashboardViewModel } from "../presentation/useDashboardViewModel";
import "./Dashboard.css";

export default function Dashboard() {
  const { state, actions } = useDashboardViewModel();

  // Estado local para manejar el comportamiento responsive de manera segura (evita errores de hidratación/SSR)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" && window.innerWidth > 768,
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    loading,
    searchSku,
    searchDesc,
    filteredProducts,
    isNotFound,
    metrics,
    isAddingProduct,
    modalSku,
    modalPlu,
    modalDesc,
    modalSub,
    modalCat,
    editingProductId,
  } = state;

  const {
    setSearchSku,
    setSearchDesc,
    handleStatusChange,
    handleAddProduct,
    handleUpdateProduct,
    loadProductToEdit,
    setModalSku,
    setModalPlu,
    setModalDesc,
    setModalSub,
    setModalCat,
    openModal,
    closeModal,
  } = actions;

  // Ejecuta la carga de datos del producto seleccionado hacia el formulario del modal
  const handleEdit = (id: string | number) => {
    loadProductToEdit(String(id));
  };

  // Intercepta el submit para decidir si crea o actualiza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      handleUpdateProduct();
    } else {
      handleAddProduct(e);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="card header-card">
        <div className="header-title">
          <h1>Logistic Control System</h1>
          <p>Sistema de control de disponibilidad y quiebres</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={openModal}>
            Registrar Control
          </button>
          <button className="btn btn-outline">Exportar Reporte Diario</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-title">Disponibilidad</span>
          <span className="stat-value">
            {loading ? "-" : `${metrics.availability}%`}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-title">Productos Críticos</span>
          <span className="stat-value">
            {loading ? "-" : metrics.breaksCount}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-title">Quiebres Hoy</span>
          <span className="stat-value">
            {loading ? "-" : metrics.breaksCount}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-title">Categoría Crítica</span>
          <span className="stat-value">
            {loading ? "-" : metrics.topCriticalCategory}
          </span>
        </div>
      </div>

      {/* Report Section */}
      <div className="card report-section">
        <div className="report-header">
          <div className="report-header-info">
            <h2>Reporte Diario</h2>
            <p>Resumen operativo generado automáticamente</p>
          </div>
          <div className="report-actions">
            <button className="btn btn-excel">Exportar Excel</button>
            <button className="btn btn-pdf">Exportar PDF</button>
          </div>
        </div>
        <div className="report-stats">
          <div className="report-stat-item">
            <span className="stat-title">Fecha</span>
            <span className="stat-value">
              {new Date().toISOString().split("T")[0]}
            </span>
          </div>
          <div className="report-stat-item">
            <span className="stat-title">Productos Revisados</span>
            <span className="stat-value">
              {loading ? "-" : metrics.totalProducts}
            </span>
          </div>
          <div className="report-stat-item">
            <span className="stat-title">Quiebres Detectados</span>
            <span className="stat-value value-danger">
              {loading ? "-" : metrics.breaksCount}
            </span>
          </div>
          <div className="report-stat-item">
            <span className="stat-title">Disponibilidad</span>
            <span className="stat-value value-success">
              {loading ? "-" : `${metrics.availability}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-grid">
        {/* Left Column */}
        <div className="card validation-card">
          <div
            className="validation-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2>Validación de Productos</h2>
              <p>Escanea o ingresa SKU / PLU</p>
            </div>
            <button
              className="btn btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
              onClick={openModal}
            >
              + Nuevo Producto
            </button>
          </div>
          <div className="search-row">
            <input
              type="text"
              placeholder="SKU o PLU"
              className="input-field"
              value={searchSku}
              onChange={(e) => setSearchSku(e.target.value)}
            />
            <input
              type="text"
              placeholder="Buscar descripción"
              className="input-field"
              value={searchDesc}
              onChange={(e) => setSearchDesc(e.target.value)}
            />
          </div>

          <div className="table-container">
            {isNotFound ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                  marginTop: "1rem",
                }}
              >
                <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                  El producto con SKU "{searchSku}" no existe en el sistema.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setModalSku(searchSku);
                    openModal();
                  }}
                >
                  Registrar SKU "{searchSku}"
                </button>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>PLU</th>
                    <th>Descripción</th>
                    <th>Subcategoría</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td data-label="SKU">
                        <strong>{item.sku}</strong>
                      </td>
                      <td data-label="PLU">
                        <strong>{item.plu || "-"}</strong>
                      </td>
                      <td data-label="Descripción">
                        <div className="product-desc">
                          <span className="product-desc-title">
                            {item.desc}
                          </span>
                        </div>
                      </td>
                      <td data-label="Subcategoría">
                        <span className="product-desc-sub">{item.sub}</span>
                      </td>
                      <td data-label="Categoría">{item.cat}</td>
                      <td
                        data-label="Estado"
                        onClick={() => {
                          if (isDesktop) {
                            const newStatus =
                              item.status === "DISPONIBLE"
                                ? "NO DISPONIBLE"
                                : "DISPONIBLE";
                            handleStatusChange(item.id!, newStatus);
                          }
                        }}
                        style={{ cursor: isDesktop ? "pointer" : "default" }}
                      >
                        <span
                          className={`badge ${item.status === "DISPONIBLE" ? "badge-available" : "badge-break"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div
                          className="action-container"
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation(); // Detiene la propagación del evento táctil en móvil
                              handleEdit(item.id!);
                            }}
                            title="Editar"
                            style={{
                              padding: "0.6rem",
                              fontSize: "1.1rem",
                              minWidth: "40px",
                              minHeight: "40px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✏️
                          </button>
                          {!isDesktop && (
                            <div
                              className="action-btns"
                              style={{ display: "flex", gap: "0.25rem" }}
                            >
                              <button
                                className="action-btn action-btn-success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item.id!, "DISPONIBLE");
                                }}
                              >
                                Disponible
                              </button>
                              <button
                                className="action-btn action-btn-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item.id!, "NO DISPONIBLE");
                                }}
                              >
                                Quiebre
                              </button>
                              <button
                                className="action-btn action-btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item.id!);
                                }}
                              >
                                Editar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="sidebar">
          <div className="card critical-items-card">
            <h2>Productos Críticos</h2>
            <div className="critical-list">
              {metrics.criticalProducts?.map((item, idx) => (
                <div key={idx} className="critical-item">
                  <div className="critical-item-info">
                    <span className="critical-item-title">{item.desc}</span>
                    <span className="critical-item-cat">{item.sub}</span>
                  </div>
                  <span className="badge badge-break">QUIEBRE</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card category-break-card">
            <h2>Quiebres por Categoría</h2>
            <div className="category-list">
              {metrics.categoryBreaks?.map((item, idx) => {
                const percentage = (item.current / item.total) * 100;
                return (
                  <div key={idx} className="category-item">
                    <div className="cat-header">
                      <span>{item.cat}</span>
                      <span className="cat-count">
                        &nbsp;{item.current}/{item.total}
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isAddingProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingProductId
                  ? "Editar Producto"
                  : "Registrar Nuevo Producto"}
              </h2>
              <button className="btn-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div className="form-group">
                <label>SKU *</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={modalSku}
                  onChange={(e) => setModalSku(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>PLU</label>
                <input
                  type="text"
                  className="input-field"
                  value={modalPlu}
                  onChange={(e) => setModalPlu(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Descripción *</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Subcategoría</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Opcional"
                  value={modalSub}
                  onChange={(e) => setModalSub(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Categoría *</label>
                <select
                  className="input-field"
                  value={modalCat}
                  onChange={(e) => setModalCat(e.target.value)}
                >
                  <option value="CARNES">CARNES</option>
                  <option value="PESCADOS Y MARISCOS">
                    PESCADOS Y MARISCOS
                  </option>
                  <option value="FRUTAS">FRUTAS</option>
                  <option value="VERDURAS">VERDURAS</option>
                  <option value="LACTEOS">LÁCTEOS</option>
                  <option value="BEBIDAS">BEBIDAS</option>
                  <option value="CUIDADO PERSONAL">CUIDADO PERSONAL</option>
                  <option value="LIMPIEZA">LIMPIEZA</option>
                  <option value="PANADERIA">PANADERÍA</option>
                  <option value="PLATOS PREPARADOS">PLATOS PREPARADOS</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
              >
                {editingProductId ? "Actualizar Cambios" : "Guardar Producto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
