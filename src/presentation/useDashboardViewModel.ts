import { useState, useEffect } from 'react';
import { ProductRepository } from '../repositories/ProductRepository';
import { DashboardMetrics } from '../domain/DashboardMetrics';
import type { Product, ProductStatus } from '../domain/types';

export function useDashboardViewModel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchSku, setSearchSku] = useState<string>('');
  const [searchDesc, setSearchDesc] = useState<string>('');
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  
  // Estado para controlar si estamos editando y qué ID se está modificando
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Campos del formulario (compartidos para creación y edición)
  const [modalSku, setModalSku] = useState<string>('');
  const [modalDesc, setModalDesc] = useState<string>('');
  const [modalSub, setModalSub] = useState<string>('');
  const [modalCat, setModalCat] = useState<string>('CARNES');
  const [modalPlu, setModalPlu] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await ProductRepository.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProductStatus) => {
    const index = products.findIndex(p => p.id === id);
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
    const product = products.find(p => p.id === id);
    if (!product) return;

    setEditingProductId(id);
    setModalSku(product.sku);
    setModalPlu(product.plu || '');
    setModalDesc(product.desc);
    setModalSub(product.sub === '-' ? '' : product.sub || '');
    setModalCat(product.cat);
    setIsAddingProduct(true);
  };

  const handleAddProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalSku || !modalDesc || !modalCat) return;
    try {
      const newProductData: Omit<Product, 'id'> = {
        sku: modalSku,
        plu: modalPlu,
        desc: modalDesc.toUpperCase(),
        sub: modalSub ? modalSub.toUpperCase() : '-',
        cat: modalCat,
        status: 'DISPONIBLE'
      };
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

    const currentProduct = products.find(p => p.id === editingProductId);
    if (!currentProduct) return;

    // Estructuramos los datos actualizados conservando el ID y el Estado actual
    const updatedProduct: Product = {
      ...currentProduct,
      sku: modalSku,
      plu: modalPlu,
      desc: modalDesc.toUpperCase(),
      sub: modalSub ? modalSub.toUpperCase() : '-',
      cat: modalCat,
    };

    // Actualización optimista en la UI
    const updatedProducts = products.map(p => p.id === editingProductId ? updatedProduct : p);
    setProducts(updatedProducts);
    resetForm();

    try {
      // Nota: Asegúrate de que tu ProductRepository tenga un método genérico de actualización
      if (ProductRepository.update) {
        await ProductRepository.update(editingProductId, updatedProduct);
      } else {
        // Fallback si solo maneja updateStatus en tu backend actual
        console.warn("ProductRepository.update no está implementado en la infraestructura.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      fetchProducts(); // En caso de fallo, reasincronizamos con el servidor
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
    setModalSku('');
    setModalPlu('');
    setModalDesc('');
    setModalSub('');
    setModalCat('CARNES');
    setIsAddingProduct(false);
  };

  const metrics = DashboardMetrics.calculate(products);
  const filteredProducts = DashboardMetrics.filterProducts(products, searchSku, searchDesc);
  const isNotFound = searchSku.trim() !== '' && filteredProducts.length === 0;

  return {
    state: {
      loading,
      searchSku,
      searchDesc,
      filteredProducts,
      isNotFound,
      metrics,
      isAddingProduct,
      editingProductId, // Expuesto para cambiar los textos dinámicamente en el modal de la vista
      modalSku,
      modalPlu,
      modalDesc,
      modalSub,
      modalCat
    },
    actions: {
      setSearchSku,
      setSearchDesc,
      handleStatusChange,
      handleAddProduct,
      handleUpdateProduct, // Nueva acción expuesta
      loadProductToEdit,   // Nueva acción expuesta
      setModalSku,
      setModalPlu,
      setModalDesc,
      setModalSub,
      setModalCat,
      openModal,
      closeModal
    }
  };
}