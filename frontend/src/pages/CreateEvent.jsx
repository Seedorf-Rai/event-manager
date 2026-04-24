import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const [form, setForm] = useState({ name: '', description: '', venue: '', date: '', capacity: '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleThumb = e => {
    const file = e.target.files[0];
    if (file) { setThumbnail(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event created successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div style={{ marginBottom: 32 }}>
        <span className="badge badge-violet" style={{ marginBottom: 10 }}>Admin</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>
          Create <span className="text-gradient">New Event</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Fill in the details below to publish a new event</p>
      </div>

      <div className="card" style={{ padding: 36 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>Event Thumbnail</label>
            <label htmlFor="thumb-upload" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{
                height: 200, borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', background: 'var(--bg-elevated)', transition: 'border-color 0.2s',
                position: 'relative'
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p style={{ fontSize: 13 }}>Click to upload thumbnail</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>
            </label>
            <input id="thumb-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumb} />
          </div>

          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input name="name" className="form-input" placeholder="e.g. Annual Tech Summit 2025" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-input" placeholder="Describe the event, agenda, speakers, highlights..." value={form.description} onChange={handleChange} required rows={6} />
          </div>

          <div className="grid-2" style={{ gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Venue *</label>
              <input name="venue" className="form-input" placeholder="e.g. Main Auditorium, Block A" value={form.venue} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input name="date" type="datetime-local" className="form-input" value={form.date} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Capacity *</label>
            <input name="capacity" type="number" className="form-input" placeholder="Max number of attendees" value={form.capacity} onChange={handleChange} required min={1} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Creating...</> : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Publish Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}