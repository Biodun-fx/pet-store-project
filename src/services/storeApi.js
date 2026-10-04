import { petProducts } from '../data/petData.js';
import { formatNaira } from '../utils/currency.js';
import { API_BASE_URL } from './apiBase.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const normalizeApiProduct = (backendProduct, fallbackProduct) => {
  const localProduct = fallbackProduct ??
    petProducts.find(
      (product) =>
        Number(product.id) === Number(backendProduct.id) ||
        product.name.toLowerCase() === String(backendProduct.name).toLowerCase()
    ) ??
    {};

  return {
    ...localProduct,
    ...backendProduct,
    id: Number(backendProduct.id ?? localProduct.id ?? 0),
    name: backendProduct.name ?? localProduct.name ?? 'Product',
    category: backendProduct.category ?? localProduct.category ?? 'General',
    price: Number(backendProduct.price ?? localProduct.price ?? 0),
    description: backendProduct.description ?? localProduct.description ?? '',
    rating: Number(backendProduct.rating ?? localProduct.rating ?? 4.8),
    stock: Number(backendProduct.stock ?? localProduct.stock ?? 0),
    image: backendProduct.image || localProduct.image || '',
    petType: backendProduct.petType ?? localProduct.petType,
    tag: backendProduct.tag || localProduct.tag || 'Shop',
  };
};

export const fetchProducts = async (category = 'All') => {
  await wait(250);

  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error('Failed to fetch products from the backend');
    }

    const result = await response.json();
    const backendProducts = Array.isArray(result) ? result : result.data;

    if (!Array.isArray(backendProducts)) {
      throw new Error('The backend returned an invalid product list');
    }

    const normalizedProducts = backendProducts.map((product) =>
      normalizeApiProduct(product, petProducts.find((localProduct) => Number(localProduct.id) === Number(product.id)))
    );

    const filtered = normalizedProducts.filter((product) => {
      return category === 'All' || product.category === category;
    });

    return filtered.length > 0 ? filtered : normalizedProducts;
  } catch (error) {
    const filtered = petProducts.filter((product) => {
      return category === 'All' || product.category === category;
    });

    return filtered;
  }
};

export const fetchDashboardData = async () => {
  await wait(300);

  return {
    revenue: formatNaira(45280),
    orders: 128,
    conversion: '4.8%',
    lowStock: 3,
    topCategory: 'Food',
    bestSelling: 'Salmon Bites',
  };
};
