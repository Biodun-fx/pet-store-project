import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import SectionTitle from '../components/SectionTitle';
import { categories } from '../data/petData';
import { fetchProducts } from '../services/storeApi';

function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const result = await fetchProducts(selectedCategory);
      setProducts(result);
    };

    loadProducts();
  }, [selectedCategory]);

  return (
    <div className="container page-header">
      <div className="page-title">
        <div>
          <span className="eyebrow">Complete collection</span>
          <h1>Shop our essentials.</h1>
        </div>
        <button className="secondary-btn" type="button">
          Free shipping over ₦50,000
        </button>
      </div>

      <p>
        Discover premium food, soothing care products, engaging toys, and everyday accessories curated for your companion.
      </p>

      <div className="filter-row" aria-label="Product categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <SectionTitle
          eyebrow="Pet picks"
          title="Curated for curious companions."
          subtitle={`${products.length} items ready to ship`}
        />

        {products.length === 0 ? (
          <div className="empty-state">No products found in this category.</div>
        ) : selectedCategory === 'Food' ? (
          <div className="shop-food-groups">
            <div className="shop-food-group">
              <h3 className="shop-food-group-title">Dog Food</h3>
              <div className="shop-grid">
                {products
                  .filter((product) => product.petType === 'Dog')
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </div>

            <div className="shop-food-group">
              <h3 className="shop-food-group-title">Cat Food</h3>
              <div className="shop-grid">
                {products
                  .filter((product) => product.petType === 'Cat')
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="shop-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ShopPage;
