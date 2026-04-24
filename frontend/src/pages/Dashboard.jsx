import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const SERVER = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    api.get('/events')
      .then(r => setEvents(r.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loading-spinner" style={{ width: 36, height: 36, margin: '0 auto 12px', borderWidth: 3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading events...</p>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 6 }}>Hello, {user?.name} 👋</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>
            Upcoming <span className="text-gradient">Events</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{events.length} events available</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            padding: '10px 18px', fontSize: 13, color: 'var(--text-secondary)'
          }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginRight: 4 }}>{events.length}</span> Active Events
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No events yet</p>
          {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => navigate('/admin/create-event')}>Create First Event</button>}
        </div>
      ) : (
        <div className="grid-3">
          {events.map((event, i) => (
            <div key={event._id} className="card" style={{ cursor: 'pointer', animation: `fadeIn 0.4s ease ${i * 0.08}s both` }}
              onClick={() => navigate(`/events/${event._id}`)}>
              <div style={{ height: 180, overflow: 'hidden', position: 'relative', background: 'var(--bg-elevated)' }}>
                {event.thumbnail ? (
                  <img src={`${SERVER}${event.thumbnail}`} alt={event.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                ) : (
                  <div style={{
                    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, hsl(${i * 60}, 50%, 12%), hsl(${i * 60 + 40}, 50%, 8%))`
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                )}
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span className="badge badge-emerald">{event.registeredCount < event.capacity ? 'Open' : 'Full'}</span>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 8, lineHeight: 1.3 }}>{event.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {event.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(event.date)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-violet)" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {event.venue}
                  </div>
                </div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{event.registeredCount}</span>/{event.capacity} registered
                  </div>
                  <div style={{ height: 4, width: 80, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%`, background: 'var(--gradient-1)', borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}