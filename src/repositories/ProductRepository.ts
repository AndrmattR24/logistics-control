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
}
