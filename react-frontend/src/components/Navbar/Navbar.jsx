import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import sdtLogo from "../../images/sdt-logo.png";
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css'

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="navbar-wrapper m-2">
      <div className="sdt-logo sdt">
        <img className="image-12" src={sdtLogo} alt="Software Discovery Tool Logo" />
      </div>
      <div className="navbar">
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
        <nav className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">Home</Link>
          <Link to="/faq" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">FAQ</Link>
          <a href="https://software-discovery-tool.readthedocs.io/en/latest/index.html" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]" target="_blank" rel="noopener noreferrer">Documentation</a>
        </nav>
      </div>
    </div>
  );
}

export default NavBar;
