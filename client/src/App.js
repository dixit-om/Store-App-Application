import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import StoreOwnerDashboard from './components/storeOwner/StoreOwnerDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                user?.role === 'admin' ? <AdminDashboard /> :
                user?.role === 'store_owner' ? <StoreOwnerDashboard /> :
                <UserDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/*" 
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Store owner routes */}
          <Route 
            path="/store-owner/*" 
            element={
              isAuthenticated && user?.role === 'store_owner' ? (
                <StoreOwnerDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } 
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 