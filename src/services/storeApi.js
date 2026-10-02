import { petProducts } from '../data/petData.js';
import { formatNaira } from '../utils/currency.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const API_BASE_URL = 'http://localhost:5000/api';

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
    image: localProduct.image ?? backendProduct.image ?? '',
    petType: localProduct.petType ?? backendProduct.petType,
    tag: localProduct.tag ?? backendProduct.tag ?? 'Shop',
  };
};

export const fetchProducts = async (category = 'All') => {
  await wait(250);

  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error('Failed to fetch products from the backend');
    }

    const backendProducts = await response.json();
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
