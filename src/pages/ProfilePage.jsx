import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';
const ACCOUNT_DISCOUNT = 10;
const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  petName: '',
  petType: '',
  petBreed: '',
  petBirthday: '',
  profilePhoto: '',
};

function ProfilePage() {
  const photoInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PROFILE);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('pet-haven-token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          if (response.status === 401 || response.status === 404) {
            localStorage.removeItem('pet-haven-token');
            localStorage.removeItem('pet-haven-user');
          }
          throw new Error(result.message || 'Unable to load profile');
        }

        setProfile(result.data);
        setFormData({ ...EMPTY_PROFILE, ...result.data });
        localStorage.setItem('pet-haven-user', JSON.stringify(result.data));
        window.dispatchEvent(new Event('pet-haven-auth-changed'));
      } catch (error) {
        setMessage(error.message || 'Unable to load profile');
        setMessageIsError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setMessage('');
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Choose an image file for your profile photo.');
      setMessageIsError(true);
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Choose an image smaller than 5 MB.');
      setMessageIsError(true);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 480;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        setFormData((current) => ({ ...current, profilePhoto: canvas.toDataURL('image/jpeg', 0.82) }));
        setMessage('Photo ready. Save your profile to keep it.');
        setMessageIsError(false);
      };
      image.onerror = () => {
        setMessage('That image could not be opened. Try a different photo.');
        setMessageIsError(true);
      };
      image.src = reader.result;
    };
    reader.onerror = () => {
      setMessage('Unable to read that photo. Try again.');
      setMessageIsError(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('pet-haven-token');

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to update profile');
      }

      setProfile(result.data);
      setFormData({ ...EMPTY_PROFILE, ...result.data });
      localStorage.setItem('pet-haven-user', JSON.stringify(result.data));
      window.dispatchEvent(new Event('pet-haven-auth-changed'));
      setMessage('Your profile has been saved.');
      setMessageIsError(false);
    } catch (error) {
      setMessage(error.message || 'Unable to update profile');
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  };

  if (!localStorage.getItem('pet-haven-token')) {
    return (
      <div className="container page-header">
        <div className="empty-state">
          <span className="eyebrow">Access required</span>
          <h1>Please log in to manage your profile.</h1>
          <Link to="/auth" className="primary-btn">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container page-header empty-state">Loading profile...</div>;
  }

  return (
    <div className="container page-header profile-page">
      <div className="page-title">
        <div>
          <span className="eyebrow">Your account</span>
          <h1>Client profile</h1>
        </div>
      </div>

      <section className="profile-banner" aria-label="Profile overview">
        <div className="profile-identity">
          <button className="profile-photo-button" type="button" onClick={() => photoInputRef.current?.click()} aria-label="Choose profile photo">
            {formData.profilePhoto ? (
              <img className="profile-photo" src={formData.profilePhoto} alt="Your profile" />
            ) : (
              <span className="profile-photo-placeholder" aria-hidden="true">{formData.name?.charAt(0)?.toUpperCase() || '?'}</span>
            )}
            <span className="profile-photo-edit" aria-hidden="true">+</span>
          </button>
          <input ref={photoInputRef} className="visually-hidden" type="file" accept="image/*" onChange={handlePhotoChange} />
          <div>
            <span className="eyebrow">Pet Haven member</span>
            <h2>{formData.name || 'Your name'}</h2>
            <p>{formData.email || 'Add your email address'}</p>
          </div>
        </div>
        <div className="profile-membership">
          <span>Membership benefit</span>
          <strong>{profile?.memberDiscount || ACCOUNT_DISCOUNT}% off selected care</strong>
          <small>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'today'}</small>
        </div>
      </section>

      <form className="profile-form" onSubmit={handleSubmit}>
        <section className="profile-section">
          <div className="profile-section-heading">
            <span className="eyebrow">01 / Client details</span>
            <h2>Personal information</h2>
          </div>
          <div className="account-grid">
            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} minLength="2" required />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading">
            <span className="eyebrow">02 / Delivery details</span>
            <h2>Address</h2>
          </div>
          <div className="account-grid">
            <div className="input-group full-span">
              <label htmlFor="address">Street address</label>
              <input id="address" name="address" autoComplete="street-address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="city">City</label>
              <input id="city" name="city" autoComplete="address-level2" value={formData.city} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="state">State / region</label>
              <input id="state" name="state" autoComplete="address-level1" value={formData.state} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="postalCode">Postal code</label>
              <input id="postalCode" name="postalCode" autoComplete="postal-code" value={formData.postalCode} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading">
            <span className="eyebrow">03 / Companion details</span>
            <h2>About your pet</h2>
          </div>
          <div className="account-grid">
            <div className="input-group">
              <label htmlFor="petName">Pet name</label>
              <input id="petName" name="petName" value={formData.petName} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="petType">Animal type</label>
              <input id="petType" name="petType" placeholder="Dog, cat, rabbit..." value={formData.petType} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="petBreed">Breed</label>
              <input id="petBreed" name="petBreed" value={formData.petBreed} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="petBirthday">Birthday</label>
              <input id="petBirthday" type="date" name="petBirthday" value={formData.petBirthday} onChange={handleChange} />
            </div>
          </div>
        </section>

        {message ? <p className={`profile-message ${messageIsError ? 'error' : ''}`} role="status">{message}</p> : null}

        <div className="profile-save-row">
          <span className="text-muted">Your profile details are private to your account.</span>
          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
