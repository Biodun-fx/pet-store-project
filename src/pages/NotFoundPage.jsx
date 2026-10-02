import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container page-header" style={{ textAlign: 'center', paddingTop: '6rem' }}>
      <span className="eyebrow">404</span>
      <h1 style={{ marginBottom: '1rem' }}>This page wandered off.</h1>
      <p className="text-muted" style={{ maxWidth: '620px', margin: '0 auto 2rem' }}>
        The page you were looking for isn’t here, but our pet essentials collection is ready for a new adventure.
      </p>
      <Link to="/" className="primary-btn">
        Back to home
      </Link>
    </div>
  );
}

export default NotFoundPage;
