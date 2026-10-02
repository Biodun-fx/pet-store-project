import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle';
import { faqItems } from '../data/petData';

const storyHighlights = [
  {
    label: 'Our mission',
    title: 'Pet care that feels personal.',
    description: 'We combine premium nutrition, wellness support, and gentle guidance to help every pet feel safe and loved.',
  },
  {
    label: 'Local roots',
    title: 'Built by people who adore animals.',
    description: 'From rescue adoptions to everyday essentials, we support pet families with a warm and practical approach.',
  },
  {
    label: 'Quality promise',
    title: 'Thoughtful products, honest advice.',
    description: 'We handpick products that are safe, durable, and created to simplify the routines pets and humans share.',
  },
];

function AboutPage() {
  return (
    <div className="container page-header">
      <div className="page-title">
        <div>
          <span className="eyebrow">About us</span>
          <h1>Made for real pet life.</h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="story-grid">
          {storyHighlights.map((item) => (
            <div key={item.title} className="story-card">
              <span className="label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <SectionTitle
          eyebrow="Frequently asked"
          title="Helpful answers for pet parents."
          subtitle="Support from our team, without the guesswork."
        />

        <div className="faq-list">
          {faqItems.map((item) => (
            <div key={item.question} className="faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shop-banner">
          <div>
            <h3 className="section-title" style={{ fontSize: '2rem' }}>
              Want to meet the family behind the brand?
            </h3>
            <p className="text-muted">We are here to help you choose the right products and routines.</p>
          </div>
          <Link to="/contact" className="primary-btn">
            Talk to our team
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
