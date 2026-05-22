import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
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
    await updateDoc(productRef, dataToUpdate);
  }
}