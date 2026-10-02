import { useEffect, useState } from 'react';
import { fetchDashboardData, fetchProducts } from '../services/storeApi';
import { formatNaira } from '../utils/currency';

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [dashboard, productList] = await Promise.all([
        fetchDashboardData(),
        fetchProducts(),
      ]);

      setStats(dashboard);
      setProducts(productList);
    };

    load();
  }, []);

  if (!stats) {
    return <div className="container page-header"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="container page-header admin-page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Store dashboard.</h1>
        </div>
      </div>

      <div className="admin-metrics">
        <div className="admin-card">
          <span>Revenue</span>
          <strong>{stats.revenue}</strong>
        </div>
        <div className="admin-card">
          <span>Orders</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="admin-card">
          <span>Conversion</span>
          <strong>{stats.conversion}</strong>
        </div>
        <div className="admin-card">
          <span>Low stock</span>
          <strong>{stats.lowStock}</strong>
        </div>
      </div>

      <div className="admin-table-wrap">
        <h3>Inventory snapshot</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatNaira(product.price)}</td>
                <td>{product.price > 35 ? 'High demand' : 'In stock'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
