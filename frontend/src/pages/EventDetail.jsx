import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const SERVER = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [evRes, tkRes] = await Promise.all([api.get(`/events/${id}`), api.get('/tickets/my-tickets')]);
        setEvent(evRes.data);
        const existing = tkRes.data.find(t => t.event._id === id || t.event === id);
        if (existing) setTicket(existing);
      } catch {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const downloadTicket = () => {
    const link = document.createElement('a');
    link.href = ticket.qrCodeImage;
    link.download = `${ticket.ticketId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const generateTicket = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/tickets/generate', { eventId: id });
      setTicket(data);
      toast.success('Ticket generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate ticket');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
    </div>
  );
  if (!event) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Event not found.</div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        <div>
          {event.thumbnail && (
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 28, height: 280 }}>
              <img src={`${SERVER}${event.thumbnail}`} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: 10 }}>Live Event</span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, lineHeight: 1.2 }}>{event.name}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
            {[
              { icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>, color: 'var(--accent-violet)', text: event.venue },
              { icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, color: 'var(--accent-cyan)', text: formatDate(event.date) },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" dangerouslySetInnerHTML={{ __html: '' }}>
                </svg>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>About This Event</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 20 }}>
            {[
              { label: 'Total Capacity', value: event.capacity, color: 'var(--accent-cyan)' },
              { label: 'Registered', value: event.registeredCount, color: 'var(--accent-violet)' },
              { label: 'Available', value: event.capacity - event.registeredCount, color: 'var(--accent-emerald)' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: 90 }}>
          {ticket ? (
            <div className="card glow-cyan" style={{ padding: 28, borderColor: 'rgba(34,211,238,0.2)' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span className="badge badge-emerald" style={{ marginBottom: 12 }}>✓ Ticket Confirmed</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Your Ticket</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>{ticket.ticketId}</p>
              </div>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
                <img src={ticket.qrCodeImage} alt="QR Code" style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                {user?.photo ? (
                  <img src={`${SERVER}${user.photo}`} alt={user.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Reg: {user?.registrationNo}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: ticket.isUsed ? 'rgba(244,63,94,0.08)' : 'rgba(52,211,153,0.08)', borderRadius: 'var(--radius-sm)', border: `1px solid ${ticket.isUsed ? 'rgba(244,63,94,0.2)' : 'rgba(52,211,153,0.2)'}`, textAlign: 'center', fontSize: 13, fontWeight: 600, color: ticket.isUsed ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                {ticket.isUsed ? '⚠ Already Used' : '✓ Valid & Ready to Scan'}
              </div>
              
              <button
                className="btn btn-primary  "
                style={{ width: '100%', justifyContent: 'center', marginBottom: 12 , marginTop:15}}
                onClick={downloadTicket}
              >
                📥 Save Ticket to Photos
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={() => navigate('/my-tickets')}>
                View All Tickets
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 28 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, background: 'var(--gradient-1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 30px rgba(34,211,238,0.25)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Get Your Ticket</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                  Generate your unique QR code ticket for this event. Present it at entry for instant verification.
                </p>
              </div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
                {[
                  { label: 'Name', value: user?.name },
                  { label: 'Reg. No', value: user?.registrationNo },
                  { label: 'Email', value: user?.email },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              {event.registeredCount >= event.capacity ? (
                <div style={{ padding: '14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--accent-rose)', fontSize: 14, fontWeight: 600 }}>
                  Event is at full capacity
                </div>
              ) : (
                <button className="btn btn-primary btn-lg" disabled={generating} onClick={generateTicket} style={{ width: '100%', justifyContent: 'center' }}>
                  {generating ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Generating...</> : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01" />
                      </svg>
                      Generate My Ticket
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}