import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', registrationNo: '', role: 'user' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePhoto = e => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      const { data } = await api.post('/auth/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      login(data.user, data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Join <span className="text-gradient">EventPass</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Create your account to get started</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', border: '2px dashed var(--border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', transition: 'border-color 0.2s',
                  background: preview ? 'transparent' : 'var(--bg-elevated)'
                }}>
                  {preview ? (
                    <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ display: 'block', margin: '0 auto 4px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                      </svg>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Upload Photo</span>
                    </div>
                  )}
                </div>
              </label>
              <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            </div>
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Registration No.</label>
                <input name="registrationNo" className="form-input" placeholder="REG-001" value={form.registrationNo} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select name="role" className="form-input" value={form.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Creating account...</> : 'Create Account'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}