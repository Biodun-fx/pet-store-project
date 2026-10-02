import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../services/apiBase';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAppointments = async () => {
    const token = localStorage.getItem('pet-haven-token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      setAppointments(result.success ? result.data : []);
    } catch (error) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const cancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem('pet-haven-token');

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to cancel appointment');
      }

      setMessage('Appointment cancelled successfully');
      loadAppointments();
    } catch (error) {
      setMessage(error.message || 'Unable to cancel appointment');
    }
  };

  if (!localStorage.getItem('pet-haven-token')) {
    return (
      <div className="container page-header">
        <div className="empty-state">
          <span className="eyebrow">Please sign in</span>
          <h1>Log in to view your appointments.</h1>
          <Link to="/auth" className="primary-btn">Go to login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container page-header empty-state">Loading appointments...</div>;
  }

  return (
    <div className="container page-header">
      <div className="page-title">
        <div>
          <span className="eyebrow">Your bookings</span>
          <h1>Appointments</h1>
        </div>
      </div>

      {message ? <p className="auth-message">{message}</p> : null}

      {appointments.length === 0 ? (
        <div className="empty-state">No appointments yet. <Link to="/book">Book care with Pet Haven</Link></div>
      ) : (
        <div className="appointment-list">
          {appointments.map((appointment) => (
            <div className="appointment-card" key={appointment._id}>
              <div>
                <p className="provider-specialty">{appointment.status}</p>
                <h3>{appointment.providerId?.name || 'Pet Haven Care Team'}</h3>
                <p className="text-muted">{appointment.serviceName}</p>
              </div>

              <div className="appointment-meta">
                <span>{appointment.petName}</span>
                <span>{new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`).toLocaleString()}</span>
              </div>

              <button
                type="button"
                className="ghost-btn small-btn"
                onClick={() => cancelAppointment(appointment._id)}
                disabled={appointment.status === 'cancelled'}
              >
                {appointment.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
