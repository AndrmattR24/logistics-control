import React, { useEffect, useState } from "react";
import { useDashboardViewModel } from "../presentation/useDashboardViewModel";
import "./Dashboard.css";

export default function Dashboard() {
  const { state, actions } = useDashboardViewModel();

  // Estado para controlar el responsive de manera segura
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" && window.innerWidth > 768,
  );

  // CONTROL DE SECUENCIA: Estado para el Spinner de pantalla completa inicial
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // EFECTO DE TRANSICIÓN: El spinner se apaga y le cede el paso al layout con Skeletons
  useEffect(() => {
    if (!loading && isInitialLoading) {
      // Un pequeño delay de 300ms para suavizar la salida de la pantalla de bienvenida
      const timer = setTimeout(() => setIsInitialLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [loading, isInitialLoading]);

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

  const handleEdit = (id: string | number) => {
    loadProductToEdit(String(id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      handleUpdateProduct();
    } else {
      handleAddProduct(e);
    }
  };

  // ==========================================
  // PASO 1: SPINNER DE PANTALLA COMPLETA
  // ==========================================
  if (isInitialLoading) {
    return (
      <div className="app-splash-screen">
        <div className="spinner-container">
          <div className="loading-spinner"></div>
          <h2>Logistic Control System</h2>
          <p>Conectando con la base de datos...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PASO 2 Y 3: DASHBOARD PRINCIPAL (CON SKELETONS INTEGRADOS)
  // ==========================================
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
            + Nuevo Producto
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
            {loading ? (
              // SEGUNDO PASO DE CARGA: El esqueleto animado toma el control de la tabla
              <TableSkeleton isDesktop={isDesktop} />
            ) : isNotFound ? (
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
                {/* 1. Mensaje dinámico según el filtro utilizado */}
                <p
                  style={{
                    marginBottom: "1rem",
                    color: "var(--text-muted)",
                    fontSize: "0.95rem",
                  }}
                >
                  {searchSku.trim() !== "" ? (
                    <>
                      El producto con SKU/PLU <strong>"{searchSku}"</strong> no
                      existe en el sistema.
                    </>
                  ) : (
                    <>
                      No se encontraron productos que coincidan con la
                      descripción <strong>"{searchDesc}"</strong>.
                    </>
                  )}
                </p>

                {/* 2. Botón adaptativo que precarga el campo correspondiente en el modal */}
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (searchSku.trim() !== "") {
                      setModalSku(searchSku);
                    } else if (searchDesc.trim() !== "") {
                      setModalDesc(searchDesc.toUpperCase());
                    }
                    openModal();
                  }}
                >
                  {searchSku.trim() !== ""
                    ? `Registrar SKU "${searchSku}"`
                    : `Registrar Producto: "${searchDesc.toUpperCase()}"`}
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
                          {isDesktop && (
                            <button
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
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
                          )}

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

        {/* Right Column (Sidebar) */}
        <div className="sidebar">
          <div className="card critical-items-card">
            <h2>Productos Críticos</h2>
            <div className="critical-list">
              {loading
                ? [1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="critical-item skeleton-pulse"
                      style={{
                        height: "48px",
                        background: "#e2e8f0",
                        border: "none",
                        marginBottom: "0.5rem",
                        borderRadius: "6px",
                      }}
                    ></div>
                  ))
                : metrics.criticalProducts?.map((item, idx) => (
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
              {loading
                ? [1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="category-item skeleton-pulse"
                      style={{
                        height: "35px",
                        background: "#e2e8f0",
                        marginBottom: "0.75rem",
                        borderRadius: "4px",
                      }}
                    ></div>
                  ))
                : metrics.categoryBreaks?.map((item, idx) => {
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

// SUBCOMPONENTE DE SKELETON RESPONSIVE REUTILIZABLE
function TableSkeleton({ isDesktop }: { isDesktop: boolean }) {
  const skeletonPulseStyle = {
    animation: "pulse 1.5s infinite ease-in-out",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    height: "20px",
  };

  if (!isDesktop) {
    return (
      <div
        className="skeleton-mobile-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="card"
            style={{
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{ ...skeletonPulseStyle, width: "40%", height: "16px" }}
            />
            <div
              style={{ ...skeletonPulseStyle, width: "85%", height: "22px" }}
            />
            <div
              style={{ ...skeletonPulseStyle, width: "60%", height: "14px" }}
            />
            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              <div style={{ ...skeletonPulseStyle, flex: 1, height: "34px" }} />
              <div style={{ ...skeletonPulseStyle, flex: 1, height: "34px" }} />
              <div style={{ ...skeletonPulseStyle, flex: 1, height: "34px" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table style={{ marginTop: "1rem" }}>
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
        {[1, 2, 3, 4].map((n) => (
          <tr key={n}>
            <td>
              <div style={{ ...skeletonPulseStyle, width: "70px" }} />
            </td>
            <td>
              <div style={{ ...skeletonPulseStyle, width: "50px" }} />
            </td>
            <td>
              <div style={{ ...skeletonPulseStyle, width: "180px" }} />
            </td>
            <td>
              <div style={{ ...skeletonPulseStyle, width: "100px" }} />
            </td>
            <td>
              <div style={{ ...skeletonPulseStyle, width: "90px" }} />
            </td>
            <td>
              <div
                style={{
                  ...skeletonPulseStyle,
                  width: "85px",
                  borderRadius: "20px",
                  height: "24px",
                }}
              />
            </td>
            <td>
              <div
                style={{ ...skeletonPulseStyle, width: "40px", height: "35px" }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
