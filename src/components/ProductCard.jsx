import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const badgeText = product.petType ? `${product.petType} ${product.category}` : product.category;

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div
          className="product-image"
          style={{ backgroundImage: `url(${product.image})` }}
          aria-label={product.name}
        >
          <div className="product-image-overlay">
            <span className="product-badge">{badgeText}</span>
            <h3>{product.name}</h3>
            <div className="product-overlay-meta">
              <span className="product-price">{formatNaira(product.price)}</span>
              <span className="text-muted">★ {product.rating}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="product-content">
        <p>{product.description}</p>

        <div className="product-actions">
          <Link to={`/product/${product.id}`} className="ghost-btn small-btn">
            Details
          </Link>
          <button className="primary-btn small-btn" type="button" onClick={() => addToCart(product)}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
