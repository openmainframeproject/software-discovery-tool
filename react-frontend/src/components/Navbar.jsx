import React from 'react';
import { Link } from 'react-router-dom'
import sdtLogo from "../images/sdt-logo.png";

function NavBar() {
  return (
    <div className="navbar-wrapper">
      <div className="sdt-logo sdt">
        <img className="image-12" src={sdtLogo} alt="Software Discovery Tool Logo" />
      </div>
      <div className="navbar">
        <Link to="/" className="navbar-link poppins-bold-black-20px">Home</Link>
        <Link to="/faq" className="navbar-link poppins-bold-black-20px">FAQ</Link>
        <Link to="/blog" className="navbar-link poppins-bold-black-20px">Blog</Link>
        <Link to="/contact" className="navbar-link poppins-bold-black-20px">Contact</Link>
        <a href="/documentation" className="navbar-link poppins-bold-black-20px" target="_blank" rel="noopener noreferrer">Documentation</a>
      </div>
    </div>
  );
}

export default NavBar;