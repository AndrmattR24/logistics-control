import type { Product, DashboardMetricsData, CategoryBreak } from './types';

export class DashboardMetrics {
  static calculate(products: Product[]): DashboardMetricsData {
    const totalProducts = products.length;
    const criticalProducts = products.filter(p => p.status === 'NO DISPONIBLE');
    const breaksCount = criticalProducts.length;
    const availability = totalProducts > 0 
      ? Math.round(((totalProducts - breaksCount) / totalProducts) * 100) 
      : 0;
    
    const categoryStats = products.reduce((acc: Record<string, { current: number; total: number }>, curr) => {
      if (!acc[curr.cat]) acc[curr.cat] = { current: 0, total: 0 };
      acc[curr.cat].total += 1;
      if (curr.status === 'NO DISPONIBLE') acc[curr.cat].current += 1;
      return acc;
    }, {});

    const categoryBreaks: CategoryBreak[] = Object.entries(categoryStats)
      .map(([cat, stats]) => ({ cat, ...stats }))
      .sort((a, b) => b.current - a.current);

    const topCriticalCategory = categoryBreaks.length > 0 && categoryBreaks[0].current > 0 
      ? categoryBreaks[0].cat 
      : '-';

    return {
      totalProducts,
      criticalProducts,
      breaksCount,
      availability,
      categoryBreaks,
      topCriticalCategory
    };
  }

  static filterProducts(products: Product[], searchSku: string, searchDesc: string): Product[] {
    return products.filter(item => {
      const matchSku = item.sku?.toLowerCase().includes(searchSku.toLowerCase());
      const matchPlu = (item.plu?.toString() ?? '').toLowerCase().includes(searchSku.toLowerCase());
      const matchDesc = item.desc?.toLowerCase().includes(searchDesc.toLowerCase());
      return (matchSku || matchPlu) && matchDesc;
    });
  }


}