import { useEffect, useState } from "react";
import { useDashboardViewModel } from "../presentation/useDashboardViewModel";
import "./Dashboard.css";

export default function Dashboard() {
  const { state, actions } = useDashboardViewModel();

  // CONTROL DE SECUENCIA: Estado para el Spinner de pantalla completa inicial
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
    currentPage,
    totalPages,
  } = state;

  // EFECTO DE TRANSICIÓN: El spinner se apaga y le cede el paso al layout con Skeletons
  useEffect(() => {
    if (!loading && isInitialLoading) {
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
    setCurrentPage,
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
  // PASO 2 Y 3: DASHBOARD PRINCIPAL
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
              <TableSkeleton />
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
              <>
                {/* INTERFAZ UNIFICADA EN BLOQUES RESPONSIVOS CON LÁPIZ UBICUO */}
                <div
                  className="products-mobile-list"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  {filteredProducts.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="product-mobile-card"
                      style={{
                        padding: "1.25rem",
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        position: "relative", // Clave para el posicionamiento absoluto del lápiz
                        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                        transition: "box-shadow 0.2s ease",
                      }}
                    >
                      {/* Fila superior: Identificadores y Badge de Estado */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.75rem",
                          paddingRight: "2.5rem", // Evita colisiones con el lápiz superior/lateral si la card es pequeña
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.2rem",
                          }}
                        >
                          <span
                            style={{ fontSize: "0.85rem", color: "#64748b" }}
                          >
                            SKU:{" "}
                            <strong style={{ color: "#1e293b" }}>
                              {item.sku}
                            </strong>
                          </span>
                          {item.plu && (
                            <span
                              style={{
                                fontSize: "0.80rem",
                                color: "#64748b",
                              }}
                            >
                              PLU:{" "}
                              <strong style={{ color: "#475569" }}>
                                {item.plu}
                              </strong>
                            </span>
                          )}
                        </div>
                        <span
                          className={`badge ${item.status === "DISPONIBLE" ? "badge-available" : "badge-break"}`}
                          onClick={() => {
                            const newStatus =
                              item.status === "DISPONIBLE"
                                ? "NO DISPONIBLE"
                                : "DISPONIBLE";
                            handleStatusChange(item.id!, newStatus);
                          }}
                          style={{
                            cursor: "pointer",
                            userSelect: "none",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          }}
                          title="Click para cambiar estado rápido"
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Descripción del Producto */}
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          margin: "0 0 0.35rem 0",
                          color: "#1e293b",
                          lineHeight: "1.4",
                          paddingRight: "2.5rem", // Espacio de resguardo para que el texto no toque el botón
                        }}
                      >
                        {item.desc}
                      </h3>

                      {/* Jerarquía de Categorías */}
                      <p
                        style={{
                          fontSize: "0.85rem",
                          margin: "0",
                          color: "#64748b",
                          paddingRight: "2.5rem", // Protección del área del lápiz
                        }}
                      >
                        {item.cat} {item.sub && ` > ${item.sub}`}
                      </p>

                      {/* ACCIÓN ÚNICA: Lápiz de edición universal (Mobile & Desktop) */}
                      <button
                        className="action-btn-edit-universal"
                        onClick={() => handleEdit(item.id!)}
                        title="Editar producto"
                        style={{
                          position: "absolute",
                          bottom: "1.25rem",
                          right: "1.25rem",
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "1rem",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                </div>

                {/* BLOQUE DE PAGINACIÓN */}
                {totalPages > 1 && (
                  <div
                    className="pagination-controls"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "1.5rem",
                      padding: "0.5rem 0",
                    }}
                  >
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="page-btn"
                      style={{
                        padding: "0.4rem 0.8rem",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      {"<<"}
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="page-btn"
                      style={{
                        padding: "0.4rem 0.8rem",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      {"<"}
                    </button>
                    <span
                      className="page-info"
                      style={{ fontSize: "0.9rem", margin: "0 0.5rem" }}
                    >
                      Página <strong>{currentPage}</strong> de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="page-btn"
                      style={{
                        padding: "0.4rem 0.8rem",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {">"}
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="page-btn"
                      style={{
                        padding: "0.4rem 0.8rem",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {">>"}
                    </button>
                  </div>
                )}
              </>
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

// SUBCOMPONENTE DE SKELETON EMBELLECIDO Y COHERENTE
function TableSkeleton() {
  const skeletonPulseStyle = {
    animation: "pulse 1.5s infinite ease-in-out",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    height: "20px",
  };

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
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            position: "relative",
          }}
        >
          <div
            style={{ ...skeletonPulseStyle, width: "35%", height: "14px" }}
          />
          <div
            style={{ ...skeletonPulseStyle, width: "25%", height: "12px" }}
          />
          <div
            style={{ ...skeletonPulseStyle, width: "75%", height: "20px" }}
          />
          <div
            style={{ ...skeletonPulseStyle, width: "50%", height: "14px" }}
          />
          {/* Esqueleto del botón flotante en la misma posición relativa exacta */}
          <div
            style={{
              position: "absolute",
              bottom: "1.25rem",
              right: "1.25rem",
            }}
          >
            <div
              style={{
                ...skeletonPulseStyle,
                width: "36px",
                height: "36px",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
