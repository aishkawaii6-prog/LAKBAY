import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI } from '../services/api';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = category !== 'all' ? { category } : {};
      const data = await newsAPI.getAll(params);
      setNews(data.news);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await newsAPI.getAll({ category: category !== 'all' ? category : undefined, search: searchTerm });
      setNews(data.news);
    } catch (error) {
      console.error('Error searching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'event', label: 'Events' },
    { value: 'update', label: 'Updates' },
    { value: 'travel-tip', label: 'Travel Tips' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'promo', label: 'Promos' },
  ];

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
          Latest News & Updates
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Stay updated with the latest events, travel tips, and announcements about your favorite destinations.
        </p>
      </div>

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {/* Search and Filter */}
        <div style={{ 
          background: 'var(--card)', 
          padding: '24px', 
          borderRadius: '16px',
          marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '0.95rem',
                minWidth: '160px',
                cursor: 'pointer',
              }}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '0.95rem',
                minWidth: '250px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #1a6b4a 0%, #2d9e72 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s, opacity 0.2s',
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* News Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              border: '4px solid #e4dfd5', 
              borderTopColor: '#1a6b4a', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: 'var(--muted)' }}>Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>No news found.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '24px' 
          }}>
            {news.map((item) => (
              <article key={item._id} style={{ 
                background: 'var(--card)', 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      background: 'rgba(26,107,74,0.1)', 
                      color: '#1a6b4a',
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                    }}>
                      {item.category}
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {new Date(item.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 style={{ 
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    color: 'var(--text)', 
                    marginBottom: '8px',
                    lineHeight: 1.3,
                  }}>{item.title}</h2>
                  <p style={{ 
                    color: 'var(--muted)', 
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>{item.summary}</p>
                  <Link
                    to={`/news/${item._id}`}
                    style={{ 
                      color: '#1a6b4a', 
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NewsPage;
