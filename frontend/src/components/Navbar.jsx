import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const SERVER = import.meta.env.VITE_SERVER_URL;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user?.role === 'admin'
    ? [
        { path: '/dashboard', label: 'Events' },
        { path: '/admin', label: 'Admin Panel' },
        { path: '/admin/create-event', label: 'Create Event' },
        { path: '/admin/scan', label: 'Scan & Verify' },
      ]
    : [
        { path: '/dashboard', label: 'Events' },
        { path: '/my-tickets', label: 'My Tickets' },
      ];

  return (
    <nav style={{
      background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--gradient-1)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M3 9v13h18V9M3 9l9-6 9 6M9 22V12h6v10"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
            Event<span className="text-gradient">Pass</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 500,
              color: isActive(link.path) ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              background: isActive(link.path) ? 'rgba(34,211,238,0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.photo ? (
              <img src={`${SERVER}${user.photo}`} alt={user.name}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-light)' }} />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
              <span className="badge badge-violet" style={{ fontSize: 10, padding: '1px 6px' }}>{user?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}