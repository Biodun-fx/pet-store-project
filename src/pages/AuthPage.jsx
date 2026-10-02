import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';
const ACCOUNT_DISCOUNT = 10;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    petName: '',
    petType: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pet-haven-user');
    const token = localStorage.getItem('pet-haven-token');
    if (savedUser && token) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const endpoint = mode === 'login' ? '/login' : '/register';
    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Authentication failed');
      }

      localStorage.setItem('pet-haven-token', result.data.token);
      localStorage.setItem('pet-haven-user', JSON.stringify(result.data.user));
      window.dispatchEvent(new Event('pet-haven-auth-changed'));
      setMessage(mode === 'login' ? 'Login successful.' : 'Registration successful.');
      navigate('/profile');
    } catch (error) {
      setMessage(error.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container page-header">
      <div className="page-title">
        <div>
          <span className="eyebrow">Account</span>
          <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        </div>
      </div>

      <div className="auth-shell">
        <div className="auth-tabs" aria-label="Authentication mode">
          <button type="button" className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        <div className="account-benefits">
          <span className="member-badge">Member perk</span>
          <strong>{ACCOUNT_DISCOUNT}% off selected products and care services</strong>
          <small>Sign up to unlock pet care savings, booking reminders, and faster repeat orders.</small>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <div className="account-grid">
              <div className="input-group">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label htmlFor="phone">Phone number</label>
                <input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+234 800 000 0000" />
              </div>

              <div className="input-group full-span">
                <label htmlFor="address">Home address</label>
                <input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="12 Pet Lane" />
              </div>

              <div className="input-group">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Lagos" />
              </div>

              <div className="input-group">
                <label htmlFor="state">State</label>
                <input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="Lagos State" />
              </div>

              <div className="input-group">
                <label htmlFor="postalCode">Postal code</label>
                <input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="100001" />
              </div>

              <div className="input-group">
                <label htmlFor="petName">Pet name</label>
                <input id="petName" name="petName" value={formData.petName} onChange={handleChange} placeholder="Max" />
              </div>

              <div className="input-group">
                <label htmlFor="petType">Pet type</label>
                <input id="petType" name="petType" value={formData.petType} onChange={handleChange} placeholder="Dog, Cat, Rabbit" />
              </div>
            </div>
          ) : null}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={mode === 'register' ? 6 : undefined}
                required
              />
              <button
                className="password-visibility"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {message ? <p className="auth-message">{message}</p> : null}

          <button className="primary-btn full-width" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <p className="text-muted auth-note">
          {mode === 'register' ? (
            <>
              If you've created an account, <button type="button" className="inline-link-btn" onClick={() => setMode('login')}>sign in</button>
            </>
          ) : (
            <>
              Need an account? <button type="button" className="inline-link-btn" onClick={() => setMode('register')}>Create account</button>
              <span> · </span>
              <Link to="/contact">Forgot your password?</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
