import SectionTitle from '../components/SectionTitle';

const contactList = [
  { icon: 'fa-solid fa-location-dot', title: 'Visit us', description: 'Lekki, Lagos, Nigeria' },
  { icon: 'fa-solid fa-phone', title: 'Call', description: '+234 834 111 7654' },
  { icon: 'fa-solid fa-envelope', title: 'Email', description: 'pethaven@gmail.com' },
];

function ContactPage() {
  return (
    <div className="container page-header">
      <div className="page-title">
        <div>
          <span className="eyebrow">Contact</span>
          <h1>We’re here to help.</h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="contact-grid">
          <div className="contact-list">
            {contactList.map((item) => (
              <div key={item.title} className="contact-card">
                <div className="contact-icon">
                  <i className={item.icon} aria-hidden="true" />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-card">
            <form className="contact-form">
              <div className="input-group">
                <label htmlFor="name">Name</label>
                <input id="name" type="text" placeholder="Your name" />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="Your email" />
              </div>

              <div className="input-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="Tell us how we can help" />
              </div>

              <button className="primary-btn" type="submit">
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <SectionTitle
          eyebrow="Support hours"
          title="Open for pet care advice."
          subtitle="Mon–Sat, 9:00 AM to 6:00 PM"
        />
      </section>
    </div>
  );
}

export default ContactPage;
