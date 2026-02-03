import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Join from './pages/Join';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Stats from './pages/Stats';
import ScrollToTop from './components/ScrollToTop';
import Success from './pages/Success';
import Impressum from './pages/Impressum';
import Privacy from './pages/Privacy';
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
          <Route path="/team" element={<Team />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/success" element={<Success />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
