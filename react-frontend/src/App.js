import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar'
import Footer from './components/Footer/Footer'
import LandingPage from './screens/LandingPage'
import Faq from './screens/Faq/Faq'

function App() {
  return (
    <Router>
      <div className='page'>
        <Navbar />
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/faq' element={<Faq />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  )
}

export default App