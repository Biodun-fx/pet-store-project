import { describe, expect, it } from 'vitest';
import { fetchProducts } from './storeApi.js';

describe('fetchProducts', () => {
  it('loads backend catalog when available', async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => [
        {
          id: 999,
          name: 'Remote Cat Food',
          category: 'Food',
          price: 50,
          stock: 12,
          description: 'A backend-sourced product.',
        },
      ],
    });

    const products = await fetchProducts('All', 1000);

    expect(products.some((product) => product.id === 999)).toBe(true);
    expect(products[0].category).toBe('Food');
  });
});
