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

    // Optimistic update
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
      setModalSku('');
      setModalPlu('');
      setModalDesc('');
      setModalSub('');
      setIsAddingProduct(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const openModal = () => setIsAddingProduct(true);
  const closeModal = () => setIsAddingProduct(false);

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
