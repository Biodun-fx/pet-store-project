import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

function CartDrawer() {
  const { cart, isCartOpen, toggleCart, updateQty, removeItem, subtotal } = useCart();

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? 'visible' : ''}`}
        onClick={toggleCart}
        aria-hidden={!isCartOpen}
      />

      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`} aria-label="Shopping cart">
        <div className="drawer-header">
          <h3>Your cart</h3>
          <button type="button" className="close-btn" onClick={toggleCart}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="primary-btn" onClick={toggleCart}>
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {cart.map((item) => (
                <div key={item.id} className="drawer-item">
                  <div
                    className="drawer-thumb"
                    style={{ backgroundImage: `url(${item.image})` }}
                    aria-label={item.name}
                  />

                  <div className="drawer-item-info">
                    <h4>{item.name}</h4>
                    <p>{formatNaira(item.price)}</p>
                    <div className="quantity-controls compact">
                      <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>
                        +
                      </button>
                    </div>
                  </div>

                  <button type="button" className="remove-link" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="drawer-footer">
              <div className="summary-row total">
                <span>Total</span>
                <strong>{formatNaira(subtotal)}</strong>
              </div>

              <div className="drawer-actions">
                <Link to="/cart" className="ghost-btn full-width" onClick={toggleCart}>
                  View cart
                </Link>
                <Link to="/checkout" className="primary-btn full-width" onClick={toggleCart}>
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
