import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';

function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setOrderPlaced(true);
    clearCart();
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container page-header">
        <div className="cart-empty">
          <span className="eyebrow">No order</span>
          <h1>Your cart is empty.</h1>
          <Link to="/shop" className="primary-btn">
            Shop now
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container page-header">
        <div className="cart-empty">
          <span className="eyebrow">Order placed</span>
          <h1>Thank you for shopping with Pet Haven.</h1>
          <p className="text-muted">A confirmation email is on the way with your order details.</p>
          <Link to="/shop" className="primary-btn">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-header checkout-page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Complete your order.</h1>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" placeholder="Jane Doe" required />
          </div>

          <div className="input-group">
            <label htmlFor="address">Address</label>
            <input id="address" type="text" placeholder="34 Willow Road" required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="jane@email.com" required />
          </div>

          <div className="input-group">
            <label htmlFor="cardNumber">Card number</label>
            <input id="cardNumber" type="text" placeholder="4242 4242 4242 4242" required />
          </div>

          <button className="primary-btn full-width" type="submit">
            Place order
          </button>
        </form>

        <aside className="order-summary">
          <h3>Order summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="summary-row compact">
              <span>
                {item.name} x {item.qty}
              </span>
              <strong>{formatNaira(item.price * item.qty)}</strong>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatNaira(subtotal)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
