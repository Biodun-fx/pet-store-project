import { Link } from 'react-router-dom';

function HeroSection({ eyebrow, title, description, primaryAction, secondaryAction }) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
          <p className="hero-subtitle">{description}</p>

          <div className="hero-actions">
            {primaryAction ? (
              <Link to="/shop" className="primary-btn">
                {primaryAction}
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link to="/about" className="secondary-btn">
                {secondaryAction}
              </Link>
            ) : null}
          </div>

          <div className="hero-stats">
            <div className="stat-pill">
              <strong>12k+</strong>
              <span>happy pets</span>
            </div>
            <div className="stat-pill">
              <strong>4.9/5</strong>
              <span>customer care</span>
            </div>
            <div className="stat-pill">
              <strong>48h</strong>
              <span>delivery</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <div className="pet-hero-image" aria-label="Premium dog food essentials" />
            <div className="floating-badge">
              <span className="badge-icon">✨</span>
              <div>
                <strong>New arrivals</strong>
                <div className="text-muted">Fresh picks this week</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
