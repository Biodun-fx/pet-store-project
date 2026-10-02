import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

function CartPage() {
  const { cart, updateQty, removeItem, subtotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container page-header cart-empty-page">
        <div className="cart-empty">
          <span className="eyebrow">Empty cart</span>
          <h1>Your cart is waiting for a few favorites.</h1>
          <Link to="/shop" className="primary-btn">
            Explore products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-header cart-page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Your cart</span>
          <h1>Ready for checkout.</h1>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div
                className="cart-thumb"
                style={{ backgroundImage: `url(${item.image})` }}
                aria-label={item.name}
              />

              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>{item.category}</p>
                <strong>{formatNaira(item.price)}</strong>
              </div>

              <div className="quantity-controls">
                <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>
                  −
                </button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>
                  +
                </button>
              </div>

              <button className="ghost-btn" type="button" onClick={() => removeItem(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <aside className="order-summary">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatNaira(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <strong>Free</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatNaira(subtotal)}</strong>
          </div>

          <Link to="/checkout" className="primary-btn full-width">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
