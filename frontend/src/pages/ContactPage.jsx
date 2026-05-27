import { useState } from 'react';
import { messagesAPI } from '../services/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Try to send via API first (now DB-backed — message is saved to MySQL)
      const resp = await messagesAPI.send(formData);

      // If DB insert succeeded, also store in localStorage
      // so the admin dashboard shows the message immediately
      // without waiting for the next API poll.
      try {
        const existing = JSON.parse(localStorage.getItem('lc_msg') || '[]')
        // Use id returned from API if available, else fallback
        const apiData = resp?.data || {}
        const newMsg = {
          ...formData,
          id: apiData.id || 'm' + Date.now(),
          createdAt: (apiData.created_at
                      || apiData.createdAt
                      || new Date().toISOString().split('T')[0]),
        }
        existing.unshift(newMsg)
        localStorage.setItem('lc_msg', JSON.stringify(existing))
      } catch(localErr) {
        console.warn('Local cache could not be updated:', localErr)
      }
      setSuccess(true);
    } catch (apiError) {
      console.warn('API message send failed, localStorage only:', apiError.message);
      // Fallback: store in localStorage only
      try {
        const existing = JSON.parse(localStorage.getItem('lc_msg') || '[]')
        const newMsg = {
          ...formData,
          id: 'm' + Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        }
        existing.unshift(newMsg)
        localStorage.setItem('lc_msg', JSON.stringify(existing))
      } catch(localErr) {
        console.error('Local save error:', localErr)
        setError('Failed to save message. Please try again.');
        setLoading(false);
        return;
      }
      setSuccess(true);
    }

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      phone: '',
    });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: '68px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1a6b4a 0%, #2d9e72 100%)',
        padding: '60px 20px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '12px',
        }}>
          Contact Us
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Have questions or need more information? We'd love to hear from you.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '40px' 
        }}>
          {/* Contact Info */}
          <div style={{ 
            background: 'var(--card)', 
            borderRadius: '20px', 
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: 'var(--text)', 
              marginBottom: '24px',
            }}>
              Get in Touch
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  background: 'rgba(26,107,74,0.1)', 
                  borderRadius: '12px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg style={{ width: 24, height: 24, color: '#1a6b4a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Location</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Dagum Purok 7, Road 5, Milaflor Village<br />Calbayog City, Samar, Philippines</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  background: 'rgba(26,107,74,0.1)', 
                  borderRadius: '12px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg style={{ width: 24, height: 24, color: '#1a6b4a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Email</h3>
                  <p style={{ color: 'var(--muted)' }}>jemwelcastilllo05@gmail.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  background: 'rgba(26,107,74,0.1)', 
                  borderRadius: '12px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg style={{ width: 24, height: 24, color: '#1a6b4a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Phone</h3>
                  <p style={{ color: 'var(--muted)' }}>09359952153</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ 
            background: 'var(--card)', 
            borderRadius: '20px', 
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: 'var(--text)', 
              marginBottom: '24px',
            }}>
              Send a Message
            </h2>
            
            {success && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(34, 197, 94, 0.1)', 
                color: '#16a34a',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}>
                ✅ Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#dc2626',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--muted)', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  placeholder="Your name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: 'var(--muted)', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: 'var(--muted)', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--muted)', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--muted)', 
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '16px 32px',
                  background: loading ? 'var(--border)' : 'linear-gradient(135deg, #1a6b4a 0%, #2d9e72 100%)',
                  color: loading ? 'var(--muted)' : '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(26,107,74,0.32)',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
