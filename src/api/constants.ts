export const QUERY_KEYS = {
  PRODUCTS: {
    all: ['products'] as const,
    infinite: (params?: { limit?: number; searchQuery?: string; sort?: 'rating-desc' }) =>
      [...QUERY_KEYS.PRODUCTS.all, 'infinite', params] as const,
  },
  infinite: 'products-infinite',
};
