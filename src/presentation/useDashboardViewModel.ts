import { useState, useEffect, useMemo } from "react";
import { ProductRepository } from "../repositories/ProductRepository";
import { DashboardMetrics } from "../domain/DashboardMetrics";
import type { Product, ProductStatus } from "../domain/types";

export function useDashboardViewModel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchSku, setSearchSku] = useState<string>("");
  const [searchDesc, setSearchDesc] = useState<string>("");
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  // Estado para controlar si estamos editando y qué ID se está modificando
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Campos del formulario (compartidos para creación y edición)
  const [modalSku, setModalSku] = useState<string>("");
  const [modalDesc, setModalDesc] = useState<string>("");
  const [modalSub, setModalSub] = useState<string>("");
  const [modalCat, setModalCat] = useState<string>("CARNES");
  const [modalPlu, setModalPlu] = useState<string>("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // MODIFICADO: Ahora usa el método optimizado getRecent()
  const fetchProducts = async () => {
    setLoading(true); // Asegúrate de que el estado de carga se active al iniciar la petición
    try {
      // 1. Pide solo los 30 más recientes
      const data = await ProductRepository.getRecent();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProductStatus) => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return;
    const product = products[index];
    if (product.status === newStatus) return;

    const newData = [...products];
    newData[index].status = newStatus;
    setProducts(newData);

    try {
      if (product.id) {
        await ProductRepository.updateStatus(product.id, newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const revertedData = [...products];
      revertedData[index].status = product.status;
      setProducts(revertedData);
    }
  };

  // Carga los datos de un producto existente en el formulario y abre el modal
  const loadProductToEdit = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    setEditingProductId(id);
    setModalSku(product.sku);
    setModalPlu(product.plu || "");
    setModalDesc(product.desc);
    setModalSub(product.sub === "-" ? "" : product.sub || "");
    setModalCat(product.cat);
    setIsAddingProduct(true);
  };

  const handleAddProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalSku || !modalDesc || !modalCat) return;
    try {
      const newProductData: Omit<Product, "id"> = {
        sku: modalSku,
        plu: modalPlu,
        desc: modalDesc.toUpperCase(),
        sub: modalSub ? modalSub.toUpperCase() : "-",
        cat: modalCat,
        status: "DISPONIBLE",
      };

      // CORREGIDO: Cambiado ProductProductRepository por ProductRepository
      const newProduct = await ProductRepository.create(newProductData);

      setProducts([newProduct, ...products]);
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Procesa los cambios editados y los guarda en el repositorio
  const handleUpdateProduct = async () => {
    if (!editingProductId || !modalSku || !modalDesc || !modalCat) return;

    const currentProduct = products.find((p) => p.id === editingProductId);
    if (!currentProduct) return;

    // 1. Estructuramos los datos actualizados conservando el ID y el Estado actual
    const updatedProduct: Product = {
      ...currentProduct,
      sku: modalSku,
      plu: modalPlu,
      desc: modalDesc.toUpperCase(),
      sub: modalSub ? modalSub.toUpperCase() : "-",
      cat: modalCat,
    };

    // 2. Actualización optimista inmediata en la UI para mantenerla fluida
    const updatedProducts = products.map((p) =>
      p.id === editingProductId ? updatedProduct : p,
    );
    setProducts(updatedProducts);

    try {
      // 3. Forzamos la llamada real a la persistencia eliminando el condicional silencioso
      await ProductRepository.update(editingProductId, updatedProduct);

      // 4. Limpiamos y cerramos el modal SÓLO si la base de datos confirmó el éxito
      resetForm();
    } catch (error) {
      console.error("Error updating product in database:", error);

      // 5. Rollback: Si la API falla, revertimos la UI consultando el estado real del servidor
      fetchProducts();
      alert(
        "No se pudieron consolidar los cambios en el servidor. La vista ha sido revertida.",
      );
    }
  };

  const openModal = () => {
    setEditingProductId(null); // Nos aseguramos de limpiar cualquier ID previo para que asuma creación
    setIsAddingProduct(true);
  };

  const closeModal = () => {
    resetForm();
  };

  const resetForm = () => {
    setEditingProductId(null);
    setModalSku("");
    setModalPlu("");
    setModalDesc("");
    setModalSub("");
    setModalCat("CARNES");
    setIsAddingProduct(false);
  };

  // Las métricas SÓLO se recalculan si el array original de productos cambia
  const metrics = useMemo(() => {
    return DashboardMetrics.calculate(products);
  }, [products]);

  // El filtrado SÓLO se procesa si cambian los productos o los términos de búsqueda
  const filteredProducts = useMemo(() => {
    return DashboardMetrics.filterProducts(products, searchSku, searchDesc);
  }, [products, searchSku, searchDesc]);

  const isNotFound = searchSku.trim() !== "" && filteredProducts.length === 0;

  return {
    state: {
      loading,
      searchSku,
      searchDesc,
      filteredProducts,
      isNotFound,
      metrics,
      isAddingProduct,
      editingProductId,
      modalSku,
      modalPlu,
      modalDesc,
      modalSub,
      modalCat,
    },
    actions: {
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
    },
  };
}
