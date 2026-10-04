import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/apiBase';
import { formatNaira, USD_TO_NGN } from '../utils/currency';

const emptyProductForm = {
  name: '',
  category: 'Food',
  petType: '',
  price: '',
  stock: '0',
  rating: '4.8',
  image: '',
  tag: '',
  description: '',
};

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('pet-haven-user') || 'null');
  } catch (error) {
    return null;
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(date);
};

const readApiResponse = async (response) => {
  const responseText = await response.text();
  let result;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    const message = response.status === 404
      ? 'The deployed backend is missing this admin API route. Redeploy the latest backend commit on Render.'
      : `The backend returned an unexpected response (HTTP ${response.status}). Check the Render deployment.`;
    const apiError = new Error(message);
    apiError.status = response.status;
    throw apiError;
  }

  if (!response.ok || result.success === false) {
    const apiError = new Error(result.message || `Backend request failed (HTTP ${response.status}).`);
    apiError.status = response.status;
    throw apiError;
  }

  return result;
};

const fetchAdminData = async (path, token) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await readApiResponse(response);
  return result.data;
};

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productMessage, setProductMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem('pet-haven-token');
    const user = readStoredUser();

    if (!token || user?.role !== 'admin') {
      navigate('/auth', { replace: true });
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const [adminUsers, adminOrders, adminProducts] = await Promise.all([
        fetchAdminData('/admin/users', token),
        fetchAdminData('/admin/orders', token),
        fetchAdminData('/admin/products', token),
      ]);
      setUsers(Array.isArray(adminUsers) ? adminUsers : []);
      setOrders(Array.isArray(adminOrders) ? adminOrders : []);
      setProducts(Array.isArray(adminProducts) ? adminProducts : []);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('pet-haven-token');
        localStorage.removeItem('pet-haven-user');
        window.dispatchEvent(new Event('pet-haven-auth-changed'));
        navigate('/auth', { replace: true });
        return;
      }
      setErrorMessage(error.message || 'Unable to load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const revenue = orders.reduce((total, order) => {
    if (['cancelled', 'refunded'].includes(String(order.status).toLowerCase())) return total;
    return total + Number(order.total || 0);
  }, 0);
  const pendingOrders = orders.filter((order) => String(order.status).toLowerCase() === 'pending').length;
  const latestOrders = orders.slice(0, 8);

  const openNewProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
    setProductMessage('');
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || '',
      category: product.category || 'Food',
      petType: product.petType || '',
      price: String(Math.round(Number(product.price || 0) * USD_TO_NGN)),
      stock: String(product.stock ?? 0),
      rating: String(product.rating ?? 4.8),
      image: product.image || '',
      tag: product.tag || '',
      description: product.description || '',
    });
    setProductMessage('');
    setIsProductFormOpen(true);
  };

  const handleProductFieldChange = (event) => {
    const { name, value } = event.target;
    setProductForm((current) => ({ ...current, [name]: value }));
  };

  const handleProductSave = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('pet-haven-token');
    setIsSavingProduct(true);
    setProductMessage('');

    const payload = {
      ...productForm,
      price: Number(productForm.price) / USD_TO_NGN,
      stock: Number(productForm.stock),
      rating: Number(productForm.rating),
    };

    try {
      const path = editingProductId === null ? '/admin/products' : `/admin/products/${editingProductId}`;
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: editingProductId === null ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await readApiResponse(response);

      const savedProduct = result.data;
      setProducts((current) => editingProductId === null
        ? [...current, savedProduct].sort((a, b) => a.id - b.id)
        : current.map((product) => product.id === editingProductId ? savedProduct : product));
      setProductMessage(editingProductId === null ? 'Product added to the store.' : 'Product changes saved.');
      setIsProductFormOpen(false);
      setEditingProductId(null);
      setProductForm(emptyProductForm);
    } catch (error) {
      setProductMessage(error.message || 'Unable to save product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleProductDelete = async (product) => {
    if (!window.confirm(`Delete “${product.name}” from the store? This cannot be undone.`)) return;
    const token = localStorage.getItem('pet-haven-token');
    setProductMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await readApiResponse(response);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setProductMessage('Product deleted from the store.');
    } catch (error) {
      setProductMessage(error.message || 'Unable to delete product.');
    }
  };

  return (
    <section className="container page-header admin-page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Pet Haven management</span>
          <h1>Admin dashboard</h1>
          <p className="text-muted">A live overview of customer accounts and store orders.</p>
        </div>
        <button className="secondary-btn" type="button" onClick={loadDashboard} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh data'}
        </button>
      </div>

      {errorMessage ? (
        <div className="auth-message" role="alert">
          {errorMessage} Check the backend health endpoint and try again. <button className="inline-link-btn" type="button" onClick={loadDashboard}>Retry</button>
        </div>
      ) : null}

      <div className="admin-metrics" aria-live="polite">
        <article className="admin-card"><span>Revenue from orders</span><strong>{loading ? 'Loading…' : formatNaira(revenue)}</strong></article>
        <article className="admin-card"><span>Total orders</span><strong>{loading ? 'Loading…' : orders.length}</strong></article>
        <article className="admin-card"><span>Customer accounts</span><strong>{loading ? 'Loading…' : users.length}</strong></article>
        <article className="admin-card"><span>Pending orders</span><strong>{loading ? 'Loading…' : pendingOrders}</strong></article>
      </div>

      <section className="admin-table-wrap" aria-labelledby="recent-orders-heading">
        <div className="section-heading-row">
          <h2 id="recent-orders-heading">Recent orders</h2>
          <Link to="/shop">View storefront</Link>
        </div>
        {loading ? <p className="text-muted">Loading order data…</p> : latestOrders.length === 0 ? (
          <p className="text-muted">No orders have been placed yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>Customer</th><th>Email</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr key={order._id || order.id}>
                    <td>{order.customerName || 'Customer'}</td>
                    <td>{order.email || '—'}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatNaira(order.total || 0)}</td>
                    <td>{order.status || 'pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-table-wrap admin-products-panel" aria-labelledby="products-heading">
        <div className="section-heading-row admin-products-heading">
          <div>
            <span className="eyebrow">Store catalog</span>
            <h2 id="products-heading">Manage products</h2>
            <p className="text-muted">Add items, change prices and stock, or remove products from the storefront.</p>
          </div>
          <button className="primary-btn" type="button" onClick={openNewProductForm}>
            Add product
          </button>
        </div>

        {productMessage ? <p className="admin-product-message" role="status">{productMessage}</p> : null}

        {isProductFormOpen ? (
          <form className="admin-product-form" onSubmit={handleProductSave}>
            <h3>{editingProductId === null ? 'Add a product' : `Edit product #${editingProductId}`}</h3>
            <div className="admin-product-fields">
              <label>Product name<input name="name" value={productForm.name} onChange={handleProductFieldChange} required minLength={2} maxLength={120} /></label>
              <label>Category<select name="category" value={productForm.category} onChange={handleProductFieldChange} required>
                <option>Food</option><option>Toys</option><option>Care</option><option>Accessories</option>
              </select></label>
              <label>For pet<input name="petType" value={productForm.petType} onChange={handleProductFieldChange} placeholder="Dog, Cat, or leave blank" maxLength={40} /></label>
              <label>Price (₦)<input name="price" type="number" min="0" step="1" value={productForm.price} onChange={handleProductFieldChange} required /></label>
              <label>Stock<input name="stock" type="number" min="0" step="1" value={productForm.stock} onChange={handleProductFieldChange} required /></label>
              <label>Rating<input name="rating" type="number" min="0" max="5" step="0.1" value={productForm.rating} onChange={handleProductFieldChange} required /></label>
              <label>Product tag<input name="tag" value={productForm.tag} onChange={handleProductFieldChange} placeholder="Popular, Premium…" maxLength={50} /></label>
              <label className="admin-product-image-field">Image URL<input name="image" type="url" value={productForm.image} onChange={handleProductFieldChange} placeholder="https://…" /></label>
              <label className="admin-product-description-field">Description<textarea name="description" value={productForm.description} onChange={handleProductFieldChange} rows="3" maxLength={1000} /></label>
            </div>
            <div className="admin-product-form-actions">
              <button className="primary-btn" type="submit" disabled={isSavingProduct}>{isSavingProduct ? 'Saving…' : editingProductId === null ? 'Create product' : 'Save changes'}</button>
              <button className="secondary-btn" type="button" onClick={() => { setIsProductFormOpen(false); setEditingProductId(null); }}>Cancel</button>
            </div>
          </form>
        ) : null}

        {loading ? <p className="text-muted">Loading products…</p> : products.length === 0 ? (
          <p className="text-muted">No products in the catalog yet. Add the first one above.</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.name}</strong><small className="admin-product-subline">#{product.id}{product.petType ? ` · ${product.petType}` : ''}</small></td>
                    <td>{product.category}</td>
                    <td>{formatNaira(product.price || 0)}</td>
                    <td>{product.stock ?? 0}</td>
                    <td><div className="admin-product-actions">
                      <button className="secondary-btn small-btn" type="button" onClick={() => openEditProductForm(product)}>Edit</button>
                      <button className="admin-delete-btn" type="button" onClick={() => handleProductDelete(product)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminDashboardPage;
