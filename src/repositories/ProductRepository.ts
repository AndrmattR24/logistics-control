import { collection, getDocs, doc, updateDoc, addDoc, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Product, ProductStatus } from '../domain/types';

export class ProductRepository {
  static async getAll(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  }

  // Traer solo los últimos 30 productos modificados o creados para agilizar la carga inicial
  static async getRecent(): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      
      // Creamos la consulta explícita con el límite
      const q = query(productsRef, orderBy("desc", "asc"), limit(30));

      const querySnapshot = await getDocs(q);
      
      // Imprime esto en la consola de tu navegador para ver si llegan 0 o más
      console.log("Documentos recuperados de Firestore:", querySnapshot.docs.length);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error("Error directo en getRecent:", error);
      return [];
    }
  }

  static async updateStatus(id: string, status: ProductStatus): Promise<void> {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, { status });
  }

  static async create(product: Omit<Product, 'id'>): Promise<Product> {
    const docRef = await addDoc(collection(db, 'products'), product);
    return { id: docRef.id, ...product };
  }

  // NUEVO MÉTODO CORREGIDO PARA LA EDICIÓN COMPLETA
  static async update(id: string, product: Product): Promise<void> {
    const productRef = doc(db, 'products', id);
    
    // Desestructuramos para separar el 'id' del resto de los datos.
    // Firebase Firestore rechaza o duplica de manera limpia si mandas el id en el cuerpo.
    const { id: _, ...dataToUpdate } = product;

    // Enviamos a Firestore únicamente los campos modificables (sku, plu, desc, sub, cat, status)
    await updateDoc(productRef, dataToUpdate);
  }
}