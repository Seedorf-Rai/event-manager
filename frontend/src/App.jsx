import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import ScanVerify from './pages/ScanVerify';
import Navbar from './components/Navbar';
import ScannerModal from './components/ScannerModal';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { user } = useAuth();
  return (
    <div style={{ minHeight: '100vh' }}>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-event" element={<ProtectedRoute adminOnly><CreateEvent /></ProtectedRoute>} />
        <Route path="/admin/scan" element={<ProtectedRoute adminOnly><ScanVerify /></ProtectedRoute>} />
        <Route path="/verify/:ticketId" element={<ScannerModal></ScannerModal>}></Route>
      </Routes>
    </div>
  );
}