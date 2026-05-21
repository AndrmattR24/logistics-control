import React, { useEffect } from 'react';
import { ProductRepository } from '../repositories/ProductRepository';
import './Sidebar.css';
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (section: 'dashboard' | 'reports' | 'categories') => void;
};

export const Sidebar = ({ isOpen, onClose, onSelect }: Props) => {
  const [categories, setCategories] = React.useState<string[]>([]);
  const [subcategories, setSubcategories] = React.useState<string[]>([]);

  // Cargar datos una sola vez
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

  // Cerrar con ESC
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  // No renderizar nada si está cerrado (optimiza SSR)
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay – fade in/out */}
      <div className={isOpen ? 'sidebar-overlay open' : 'sidebar-overlay'} onClick={onClose} />

      <aside className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={onClose}>×</button>

        <ul className="menu-list">
          <li onClick={() => { onSelect?.('dashboard'); onClose(); }}>
            📊 Dashboard
          </li>
          <li onClick={() => { onSelect?.('reports'); onClose(); }}>
            📈 Reportes
          </li>
          <li onClick={() => { onSelect?.('categories'); onClose(); }}>
            🗂️ Categorías
          </li>
        </ul>

        <section className="data-section">
          <h3>Categorías</h3>
          <ul>
            {categories.map(c => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <h3>Subcategorías</h3>
          <ul>
            {subcategories.map(s => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      </aside>
    </>
  );
};
