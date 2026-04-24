import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';
import toast from 'react-hot-toast';

const formatDate = (d) =>
  new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });




export default function ScanVerify() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('camera');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const SERVER = import.meta.env.VITE_SERVER_URL;

  const startScanner = async () => {
    if (!scannerRef.current) return;
    try {
      const html5Qr = new Html5Qrcode('qr-scanner-region');
      html5QrRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await html5Qr.stop();
          setScanning(false);
          await verifyTicket(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      toast.error('Camera access denied or not available');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { if (html5QrRef.current) { html5QrRef.current.stop().catch(() => {}); } };
  }, []);

  const verifyTicket = async (qrData) => {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/tickets/verify', { qrData });
      setResult({ ...data, type: 'success' });
      toast.success('Ticket verified!');
    } catch (err) {
      const errData = err.response?.data;
      setResult({ ...errData, type: 'error' });
      toast.error(errData?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    await verifyTicket(manualInput.trim());
  };

  const reset = () => { setResult(null); setManualInput(''); };
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <span className="badge badge-violet" style={{ marginBottom: 10 }}>Admin Tool</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800 }}>
          Scan & <span className="text-gradient">Verify</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Scan a QR code or enter the payload manually to verify a ticket</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content' }}>
            {['camera', 'manual'].map(m => (
              <button key={m} onClick={() => { setMode(m); if (m === 'manual') stopScanner(); }} style={{
                padding: '7px 18px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
                border: 'none', background: mode === m ? 'var(--gradient-1)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}>{m === 'camera' ? '📷 Camera' : '⌨ Manual'}</button>
            ))}
          </div>

          {mode === 'camera' && (
            <div className="card" style={{ padding: 24 }}>
              <div id="qr-scanner-region" ref={scannerRef} style={{
                width: '100%', minHeight: 280, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {!scanning && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                      <rect x="7" y="7" width="10" height="10"/>
                    </svg>
                    <p style={{ fontSize: 14 }}>Camera preview appears here</p>
                  </div>
                )}
                {scanning && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, border: '2px solid var(--accent-cyan)', borderRadius: 8, boxShadow: '0 0 0 9999px rgba(2,8,23,0.7)' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent-cyan)', animation: 'scanLine 2s ease-in-out infinite', boxShadow: '0 0 8px var(--accent-cyan)' }} />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                {!scanning ? (
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={startScanner} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                    Start Camera
                  </button>
                ) : (
                  <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={stopScanner}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/>
                    </svg>
                    Stop Scanner
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16, fontSize: 16 }}>Manual QR Data Entry</h3>
              <form onSubmit={handleManualVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">QR Code JSON Payload</label>
                  <textarea className="form-input" value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder={'{"ticketId":"TKT-XXXXX","userId":"...","eventId":"..."}'} rows={5} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Verifying...</> : 'Verify Ticket'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div>
          {loading && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Verifying ticket...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <rect x="7" y="7" width="10" height="10"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8 }}>Awaiting Scan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Scan a QR code or enter the payload to verify a ticket</p>
            </div>
          )}

          {!loading && result && (
            <div className="card" style={{ overflow: 'visible', animation: 'fadeIn 0.4s ease', borderColor: result.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(244,63,94,0.3)' }}>
              <div style={{ padding: '16px 20px', background: result.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(244,63,94,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: result.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {result.type === 'success' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-rose)" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: result.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: 15 }}>
                    {result.type === 'success' ? '✓ Ticket Valid' : '✗ Ticket Rejected'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{result.message}</div>
                </div>
              </div>

              {result.ticket && (
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
                    {result.ticket.user?.photo ? (
                      <img src={`${SERVER}${result.ticket.user.photo}`} alt={result.ticket.user.name}
                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-light)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {result.ticket.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{result.ticket.user?.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{result.ticket.user?.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Registration No.', value: result.ticket.user?.registrationNo, color: 'var(--accent-cyan)' },
                      { label: 'Ticket ID', value: result.ticket.ticketId, color: 'var(--text-primary)' },
                      { label: 'Event', value: result.ticket.event?.name, color: 'var(--accent-violet)' },
                      { label: 'Venue', value: result.ticket.event?.venue, color: 'var(--text-secondary)' },
                      { label: 'Event Date', value: result.ticket.event?.date ? formatDate(result.ticket.event.date) : '—', color: 'var(--text-secondary)' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: item.color, textAlign: 'right', maxWidth: '55%' }}>{item.value}</span>
                      </div>
                    ))}
                    {result.usedAt && (
                      <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--accent-rose)', textAlign: 'center' }}>
                        Used at: {formatDate(result.usedAt)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ padding: '0 24px 24px' }}>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={reset}>
                  Scan Another Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}