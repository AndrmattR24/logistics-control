import { useEffect, useState } from 'react';
import { ProductRepository } from '../repositories/ProductRepository';
import './CategoriesView.css';

// Detect desktop environment (avoid SSR window errors)
const isDesktop = typeof window !== 'undefined' && window.innerWidth > 480;

export const CategoriesView = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Load distinct categories & subcategories once
  useEffect(() => {
    const load = async () => {
      const products = await ProductRepository.getAll();
      setCategories(
        Array.from(new Set(products.map(p => p.cat))).sort()
      );
      setSubcategories(
        Array.from(new Set(products.map(p => p.sub))).sort()
      );
    };
    load();
  }, []);

  const handleEdit = (label: string) => {
    console.log('Editar', label);
    // TODO: abrir modal de edición o redirigir a página de edición
  };

  return (
    <div className="categories-view card">
      <h2 className="view-title">Gestión de Categorías</h2>

      <section className="list-section">
        <h3>Categorías</h3>
        <ul className="category-list">
          {categories.map(c => (
            <li key={c} className="category-item">
              <span>{c}</span>
              {isDesktop && (
                <button
                  className="edit-btn"
                  title="Editar categoría"
                  onClick={() => handleEdit(c)}
                >✏️</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="list-section">
        <h3>Subcategorías</h3>
        <ul className="subcategory-list">
          {subcategories.map(s => (
            <li key={s} className="subcategory-item">
              <span>{s}</span>
              {isDesktop && (
                <button
                  className="edit-btn"
                  title="Editar subcategoría"
                  onClick={() => handleEdit(s)}
                >✏️</button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
