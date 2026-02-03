import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Join from './pages/Join';
import Squad from './pages/Squad';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import Success from './pages/Success';
import Impressum from './pages/Impressum';
import Privacy from './pages/Privacy';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Join />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/team" element={<Navigate to="/squad" replace />} />
          <Route path="/stats" element={<Navigate to="/squad" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/success" element={<Success />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
