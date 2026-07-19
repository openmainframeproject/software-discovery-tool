import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import LandingPage from './screens/LandingPage';
import Faq from './screens/Faq/Faq';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar />
      <div className='page'>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/faq' element={<Faq />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
