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

  // NUEVO: Estado para controlar la página actual
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

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

  // NUEVO: Cada vez que el usuario escriba en los buscadores, reiniciamos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchSku, searchDesc]);

  const fetchProducts = async () => {
    setLoading(true); 
    try {
      const fullData = await ProductRepository.getAll();
      console.log("fullData", fullData);
      setProducts(fullData);
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

      const newProduct = await ProductRepository.create(newProductData);
      setProducts([newProduct, ...products]);
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId || !modalSku || !modalDesc || !modalCat) return;

    const currentProduct = products.find((p) => p.id === editingProductId);
    if (!currentProduct) return;

    const updatedProduct: Product = {
      ...currentProduct,
      sku: modalSku,
      plu: modalPlu,
      desc: modalDesc.toUpperCase(),
      sub: modalSub ? modalSub.toUpperCase() : "-",
      cat: modalCat,
    };

    const updatedProducts = products.map((p) =>
      p.id === editingProductId ? updatedProduct : p,
    );
    setProducts(updatedProducts);

    try {
      await ProductRepository.update(editingProductId, updatedProduct);
      resetForm();
    } catch (error) {
      console.error("Error updating product in database:", error);
      fetchProducts();
      alert("No se pudieron consolidar los cambios en el servidor. La vista ha sido revertida.");
    }
  };

  const openModal = () => {
    setEditingProductId(null);
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

  // 1. Las métricas siguen leyendo TODOS los productos de la BD de forma global
  const metrics = useMemo(() => {
    return DashboardMetrics.calculate(products);
  }, [products]);

  // 2. Primero filtramos todos los productos según los inputs del operador
  const allFilteredProducts = useMemo(() => {
    return DashboardMetrics.filterProducts(products, searchSku, searchDesc);
  }, [products, searchSku, searchDesc]);

  // NUEVO: 3. Calculamos la cantidad total de páginas necesarias
  const totalPages = useMemo(() => {
    return Math.ceil(allFilteredProducts.length / ITEMS_PER_PAGE) || 1;
  }, [allFilteredProducts]);

  // MODIFICADO: 4. Cortamos usando índices dinámicos dependientes de 'currentPage'
  const filteredProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allFilteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allFilteredProducts, currentPage]);

  const isNotFound = (searchSku.trim() !== "" || searchDesc.trim() !== "") && allFilteredProducts.length === 0;

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
      currentPage, // NUEVO: Enviamos al componente visual
      totalPages,  // NUEVO: Enviamos al componente visual
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
      setCurrentPage, // NUEVO: Acción para cambiar de página desde los botones
    },
  };
}