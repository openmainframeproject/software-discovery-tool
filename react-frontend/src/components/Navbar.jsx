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
        <Link to="/" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">Home</Link>
        <Link to="/faq" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">FAQ</Link>
        <Link to="/blog" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">Blog</Link>
        <Link to="/contact" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]">Contact</Link>
        <a href="https://software-discovery-tool.readthedocs.io/en/latest/index.html" className="navbar-link poppins-bold-black-20px hover:text-[#044FC0]" target="_blank" rel="noopener noreferrer">Documentation</a>
      </div>
    </div>
  );
}

export default NavBar;