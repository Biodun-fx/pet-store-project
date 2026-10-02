import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/storeApi';
import { formatNaira } from '../utils/currency';

function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      const products = await fetchProducts();
      const selectedProduct = products.find((item) => item.id === Number(id));
      setProduct(selectedProduct ?? null);
    };

    loadProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="container page-header" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Not found</span>
        <h1>Product unavailable.</h1>
        <Link to="/shop" className="primary-btn">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-header product-detail-page">
      <div className="product-detail-card">
        <div
          className="product-detail-image"
          style={{ backgroundImage: `url(${product.image})` }}
          aria-label={product.name}
        />

        <div className="product-detail-body">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="text-muted">{product.description}</p>

          <div className="product-detail-meta">
            <strong className="product-price">{formatNaira(product.price)}</strong>
            <span className="text-muted">★ {product.rating}</span>
          </div>

          <div className="product-actions detail-actions">
            <button className="primary-btn" type="button" onClick={() => addToCart(product)}>
              Add to cart
            </button>
            <Link to="/shop" className="ghost-btn">
              Continue shopping
            </Link>
          </div>

          <div className="detail-feature-list">
            <div>
              <strong>Made for:</strong>
              <span>Daily play, restful sleep, and better care</span>
            </div>
            <div>
              <strong>Delivery:</strong>
              <span>2–4 day shipping nationwide</span>
            </div>
            <div>
              <strong>Returns:</strong>
              <span>Easy 30-day return policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
