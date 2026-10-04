import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import SectionTitle from '../components/SectionTitle';
import nutritionImage from '../data/nutrition1.jpg';
import groomingImage from '../data/grooming.jpg';
import expertSupportImage from '../data/expert support.webp';
import { petProducts } from '../data/petData';

const featureCards = [
  {
    image: nutritionImage,
    title: 'Nutrition-first formulas',
    description: 'Thoughtfully selected food and supplements designed for daily health, energy, and happy tails.',
  },
  {
    image: groomingImage,
    title: 'Grooming essentials',
    description: 'Keep coats soft, paws cared for, and routines simple with gentle grooming kits and care products.',
  },
  {
    image: expertSupportImage,
    title: 'Expert support',
    description: 'From carriers to harnesses, our accessories make walks, trips, and home life smoother for pets and people.',
  },
];

const featuredProducts = petProducts.slice(0, 6);

function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div>
      <HeroSection
        eyebrow="Premium essentials"
        title="Fresh food, care, and comfort for every companion."
        description="Curated nutrition, playful toys, wellness care, and travel-ready accessories for dogs and cats alike."
        primaryAction="Shop now"
        secondaryAction="Learn more"
      />

      <section className="section">
        <SectionTitle
          className="home-why-heading"
          eyebrow="Why Pet Haven"
          title="Built for healthy routines and happier tails."
          subtitle="Thoughtful products, trusted ingredients, and convenience in one place."
        />

        <div className="info-grid">
          {featureCards.map((item) => (
            <div key={item.title} className="info-card">
              <img className="feature-image" src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionTitle
          eyebrow="Bestsellers"
          title="Our top customer picks."
          subtitle="A few favorites for everyday pet care."
        />

        <div className="product-carousel">
          <div
            className="product-carousel-track"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {featuredProducts.map((product) => (
              <div className="product-slide" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-dots" aria-label="Featured product navigation">
          {featuredProducts.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={`dot ${index === activeSlide ? 'active' : ''}`}
              aria-label={`Show product ${index + 1}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="shop-banner">
          <div>
            <span className="eyebrow">New arrival</span>
            <h2>Give your pet something they’ll really love.</h2>
          </div>
          <Link to="/shop" className="primary-btn">
            Browse essentials
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
