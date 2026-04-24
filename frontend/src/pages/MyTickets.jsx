import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  const SERVER = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    api.get('/tickets/my-tickets')
      .then(r => setTickets(r.data))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>
          My <span className="text-gradient">Tickets</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} generated</p>
      </div>

      {tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}>
            <path d="M20 12V22H4V12M22 7H2v5h20V7zM12 22V7"/>
          </svg>
          <p>No tickets yet. Browse events to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {tickets.map((ticket, i) => (
            <div key={ticket._id} className="card" style={{ cursor: 'pointer', animation: `fadeIn 0.4s ease ${i * 0.08}s both`, borderColor: ticket.isUsed ? 'rgba(244,63,94,0.2)' : 'var(--border)' }}
              onClick={() => setSelected(selected?._id === ticket._id ? null : ticket)}>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <span className={`badge ${ticket.isUsed ? 'badge-rose' : 'badge-emerald'}`} style={{ marginBottom: 8 }}>
                      {ticket.isUsed ? 'Used' : 'Valid'}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{ticket.event?.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{ticket.ticketId}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ transform: selected?._id === ticket._id ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>📅 {formatDate(ticket.event?.date)}</span>
                  <span>📍 {ticket.event?.venue}</span>
                </div>
              </div>

              {selected?._id === ticket._id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: 20, animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16, display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
                    <img src={ticket.qrCodeImage} alt="QR Code" style={{ width: '100%', display: 'block', maxWidth: 220, margin: '0 auto' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 14 }}>
                    {user?.photo ? (
                      <img src={`${SERVER}${user.photo}`} alt={user.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Reg: {user?.registrationNo}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: ticket.isUsed ? 'rgba(244,63,94,0.08)' : 'rgba(52,211,153,0.08)', border: `1px solid ${ticket.isUsed ? 'rgba(244,63,94,0.2)' : 'rgba(52,211,153,0.2)'}`, textAlign: 'center', fontSize: 13, fontWeight: 600, color: ticket.isUsed ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {ticket.isUsed ? `⚠ Used on ${formatDate(ticket.usedAt)}` : '✓ Valid — Ready to Scan'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}