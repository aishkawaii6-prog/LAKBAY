// src/components/NewsSection.jsx — latest news preview card on the homepage
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { newsAPI } from '../services/api'

export default function NewsSection() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await newsAPI.getAll({ featured: true, published: true })
        setArticles((data.news || []).slice(0, 3))
      } catch {
        // silently fall back to empty list when API is unavailable
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section style={{ padding: '80px 20px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#1a6b4a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Stay Updated</div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:700, color:'var(--text)', lineHeight:1.15 }}>
              📰 News &amp; Announcements
            </h2>
          </div>
          <Link
            to="/news"
            style={{ padding:'10px 24px', borderRadius:10, background:'linear-gradient(135deg,#1a6b4a,#2d9e72)', color:'#fff', fontSize:'0.9rem', fontWeight:700, textDecoration:'none', fontFamily:"'DM Sans',system-ui,sans-serif", boxShadow:'0 3px 12px rgba(26,107,74,0.3)', whiteSpace:'nowrap' }}
          >
            View All News →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
            <div style={{ width:40, height:40, margin:'0 auto 12px', border:'3px solid var(--border)', borderTopColor:'#1a6b4a', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}></div>
            <p>Loading latest news…</p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--muted)' }}>
            <div style={{ fontSize:'3rem', marginBottom:12 }}>📰</div>
            <p style={{ fontWeight:600 }}>No news yet</p>
            <p style={{ fontSize:'0.9rem', marginTop:4 }}>Check back soon for the latest updates.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:24 }}>
            {articles.map((item) => (
              <article
                key={item._id || item.id}
                style={{
                  background: 'var(--card)', borderRadius: 16, overflow: 'hidden',
                  border:'1px solid var(--border)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'transform 0.25s,box-shadow 0.25s',
                }}
              >
                {item.image && (
                  <div style={{ position:'relative', height:200, overflow:'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }}
                    />
                    {item.featured && (
                      <span style={{
                        position:'absolute', top:10, left:10,
                        background:'#e8a020', color:'#fff',
                        fontSize:'0.65rem', fontWeight:700,
                        padding:'3px 9px', borderRadius:20, textTransform:'uppercase',
                      }}>⭐ Featured</span>
                    )}
                  </div>
                )}
                <div style={{ padding:'22px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{
                      padding:'3px 10px', background:'rgba(26,107,74,0.1)', color:'#1a6b4a',
                      fontSize:'0.7rem', fontWeight:700, borderRadius:20, textTransform:'uppercase',
                    }}>{item.category || 'News'}</span>
                    <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>
                      {new Date(item.publishDate || item.publishedDate || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily:"'Playfair Display',Georgia,serif",
                    fontSize:'1.15rem', fontWeight:700, color:'var(--text)',
                    marginBottom:8, lineHeight:1.3,
                  }}>{item.title}</h3>
                  <p style={{
                    fontSize:'0.88rem', color:'var(--muted)', lineHeight:1.7,
                    display:'-webkit-box', WebkitLineClamp:2,
                    WebkitBoxOrient:'vertical', overflow:'hidden',
                    marginBottom:16,
                  }}>{item.summary || item.excerpt || item.content || ''}</p>
                  <Link
                    to={`/news/${item._id || item.id}`}
                    style={{
                      color:'#1a6b4a', fontWeight:700, fontSize:'0.85rem',
                      textDecoration:'none',
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
    </section>
  )
}
