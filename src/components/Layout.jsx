import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import { useCart } from '../context/CartContext';

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('pet-haven-user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
};

function Layout() {
  const navigate = useNavigate();
  const { itemCount, toggleCart } = useCart();
  const [theme, setTheme] = useState(() => localStorage.getItem('pet-haven-theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('pet-haven-theme', theme);
  }, [theme]);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    window.addEventListener('storage', syncUser);
    window.addEventListener('pet-haven-auth-changed', syncUser);
    syncUser();

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('pet-haven-auth-changed', syncUser);
    };
  }, []);

  const accountText = currentUser ? `Hi, ${currentUser.name?.split(' ')[0] || 'friend'}` : 'Account';

  const handleLogout = () => {
    localStorage.removeItem('pet-haven-token');
    localStorage.removeItem('pet-haven-user');
    setCurrentUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event('pet-haven-auth-changed'));
    navigate('/auth');
  };

  return (
    <div>
      <header className="site-header">
        <div className="container navbar">
          <button
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            type="button"
            aria-label={menuOpen ? 'Close page menu' : 'Open page menu'}
            aria-expanded={menuOpen}
            aria-controls="page-menu"
            title={menuOpen ? 'Close page menu' : 'Open page menu'}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <NavLink to="/" className="brand" aria-label="Pet Haven home">
            <span className="brand-mark">🐾</span>
            <span>Pet Haven</span>
          </NavLink>

          <nav id="page-menu" className="page-menu" aria-label="All pages" hidden={!menuOpen}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
            <NavLink to="/book" onClick={() => setMenuOpen(false)}>Book care</NavLink>
            <NavLink to="/appointments" onClick={() => setMenuOpen(false)}>Appointments</NavLink>
            <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
            <NavLink to="/cart" onClick={() => setMenuOpen(false)}>Cart</NavLink>
            <NavLink to="/checkout" onClick={() => setMenuOpen(false)}>Checkout</NavLink>
            <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>
            {currentUser ? (
              <button className="page-menu-action" type="button" onClick={handleLogout}>Log out</button>
            ) : (
              <NavLink to="/auth" onClick={() => setMenuOpen(false)}>Sign in / Register</NavLink>
            )}
          </nav>

          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/book">Book care</NavLink>
            <NavLink to="/appointments">Appointments</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>

          <div className="nav-actions">
            <button
              className="ghost-btn"
              type="button"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? '☾' : '☀'}
            </button>
            <button type="button" className="nav-cart" onClick={toggleCart}>
              Cart
              {itemCount > 0 ? <span className="cart-badge">{itemCount}</span> : null}
            </button>
            <Link to={currentUser ? '/profile' : '/auth'} className="ghost-btn" aria-label="Login or register">
              {accountText}
            </Link>
            {currentUser ? (
              <button className="ghost-btn logout-button" type="button" onClick={handleLogout}>
                Log out
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <CartDrawer />

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Pet Haven</strong>
            <div className="text-muted">Better care for happy companions.</div>
          </div>

          <div className="social-links" aria-label="Social media links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Twitter/X"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="https://wa.me/15551234567" target="_blank" rel="noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
            <a href="https://telegram.org" target="_blank" rel="noreferrer" aria-label="Telegram"><i className="fa-brands fa-telegram"></i></a>
          </div>

          <div className="text-muted">© 2026 Pet Haven. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
