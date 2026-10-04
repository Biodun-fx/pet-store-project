import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/apiBase';

const fallbackProvider = {
  id: 'pethaven-care-team',
  name: 'Pet Haven Care Team',
  specialty: 'Company care',
  location: 'Lekki, Lagos, Nigeria',
  rating: 4.9,
  services: [
    { name: 'General Consultation' },
    { name: 'Vaccination' },
    { name: 'Grooming' },
    { name: 'Pet Care Advice' },
  ],
};

function BookAppointmentPage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    petName: '',
    serviceName: '',
    appointmentDate: '',
    appointmentTime: '10:00',
    notes: '',
  });

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/company/booking`);
        const result = await response.json();
        if (result.success) {
          setProvider(result.data);
          setServices(result.data.services || []);
          if (result.data.services?.[0]) {
            setForm((current) => ({ ...current, serviceName: result.data.services[0].name }));
          }
        }
      } catch (error) {
        setProvider(fallbackProvider);
        setServices(fallbackProvider.services);
        setForm((current) => ({ ...current, serviceName: fallbackProvider.services[0].name }));
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('pet-haven-token');

    if (!token) {
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerId: provider._id || provider.id,
          ...form,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to book appointment');
      }

      navigate('/appointments');
    } catch (error) {
      setMessage(error.message === 'Failed to fetch'
        ? 'The booking service is offline. Start the local backend and try again.'
        : error.message || 'Unable to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container page-header empty-state">Loading booking form...</div>;
  }

  if (!provider) {
    return (
      <div className="container page-header">
        <div className="empty-state">
          <span className="eyebrow">Unavailable</span>
          <h1>Company booking is unavailable.</h1>
          <Link to="/contact" className="primary-btn">Contact Pet Haven</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-header">
      <div className="page-title">
        <div>
          <span className="eyebrow">Book appointment</span>
          <h1>Book care with Pet Haven.</h1>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="petName">Pet name</label>
            <input id="petName" name="petName" value={form.petName} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="serviceName">Service</label>
            <select id="serviceName" name="serviceName" value={form.serviceName} onChange={handleChange} required>
              {services.map((item) => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="appointmentDate">Preferred date</label>
            <input id="appointmentDate" type="date" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="appointmentTime">Preferred time</label>
            <input id="appointmentTime" type="time" name="appointmentTime" value={form.appointmentTime} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows="4" placeholder="Anything our care team should know?" />
          </div>

          {message ? <p className="auth-message">{message}</p> : null}

          <button className="primary-btn full-width" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Booking...' : 'Book appointment'}
          </button>
        </form>

        <aside className="order-summary">
          <h3>Pet Haven care</h3>
          <div className="summary-row compact">
            <span>Booked with</span>
            <strong>{provider.name}</strong>
          </div>
          <div className="summary-row compact">
            <span>Care team</span>
            <strong>{provider.specialty}</strong>
          </div>
          <div className="summary-row compact">
            <span>Location</span>
            <strong>{provider.location}</strong>
          </div>
          <div className="summary-row total">
            <span>Star rating</span>
            <strong>★ {provider.rating}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BookAppointmentPage;
