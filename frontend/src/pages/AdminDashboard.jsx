import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();
  const SERVER = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    Promise.all([api.get('/tickets/all'), api.get('/events')])
      .then(([tRes, eRes]) => { setTickets(tRes.data); setEvents(eRes.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    totalEvents: events.length,
    totalTickets: tickets.length,
    usedTickets: tickets.filter(t => t.isUsed).length,
    validTickets: tickets.filter(t => !t.isUsed).length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, color: 'var(--accent-cyan)', bg: 'rgba(34,211,238,0.06)' },
    { label: 'Total Tickets', value: stats.totalTickets, color: 'var(--accent-violet)', bg: 'rgba(129,140,248,0.06)' },
    { label: 'Valid Tickets', value: stats.validTickets, color: 'var(--accent-emerald)', bg: 'rgba(52,211,153,0.06)' },
    { label: 'Used Tickets', value: stats.usedTickets, color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.06)' },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-violet" style={{ marginBottom: 8 }}>Admin Panel</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>
            Control <span className="text-gradient">Center</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/scan')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
              <rect x="7" y="7" width="10" height="10"/>
            </svg>
            Scan Tickets
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/create-event')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Event
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {statCards.map((stat, i) => (
          <div key={i} className="card" style={{ padding: 24, background: stat.bg, borderColor: `${stat.color}20` }}>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content' }}>
        {['overview', 'tickets'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
            border: 'none', background: tab === t ? 'var(--gradient-1)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s', cursor: 'pointer',
            textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>All Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map(event => (
              <div key={event._id} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                {event.thumbnail ? (
                  <img src={`${SERVER}${event.thumbnail}`} alt={event.name} style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{event.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{event.venue} — {new Date(event.date).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-cyan)' }}>{event.registeredCount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Registered</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)' }}>{event.capacity}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Capacity</div>
                  </div>
                  <span className={`badge ${event.isActive ? 'badge-emerald' : 'badge-rose'}`}>{event.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tickets' && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>All Tickets</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Reg. No', 'Event', 'Ticket ID', 'Generated', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {ticket.user?.photo ? (
                          <img src={`${SERVER}${ticket.user.photo}`} alt={ticket.user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                            {ticket.user?.name?.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontWeight: 500 }}>{ticket.user?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{ticket.user?.registrationNo}</td>
                    <td style={{ padding: '12px 14px' }}>{ticket.event?.name}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>{ticket.ticketId}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${ticket.isUsed ? 'badge-rose' : 'badge-emerald'}`}>{ticket.isUsed ? 'Used' : 'Valid'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}