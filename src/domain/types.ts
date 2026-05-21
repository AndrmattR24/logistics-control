export type ProductStatus = 'DISPONIBLE' | 'NO DISPONIBLE';

export interface Product {
  id?: string;
  sku: string;
  plu: string;
  desc: string;
  sub: string;
  cat: string;
  status: ProductStatus;
}

export interface CategoryBreak {
  cat: string;
  current: number;
  total: number;
}

export interface DashboardMetricsData {
  totalProducts: number;
  criticalProducts: Product[];
  breaksCount: number;
  availability: number;
  categoryBreaks: CategoryBreak[];
  topCriticalCategory: string;
}
