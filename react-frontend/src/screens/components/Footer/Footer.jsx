import React from "react";
import "./Footer.css";
import logo from '../../../images/sdt-logo.png'; 
import styled from "styled-components";
import {
  FaEnvelope,
  FaArrowRight,
  FaTwitter,
  FaFacebook,
  FaWhatsapp,
  FaInstagram,
  FaGooglePlusG,
} from "react-icons/fa";

const Logo = styled.a`
  display: flex;
  align-items: center;
  width: 2rem;
  height: auto;
  cursor: pointer;
  img {
    margin-right: 0.5rem;
  }
`;

const Footer = () => {
  return (
    <div>
      <footer>
        <div className="row">
          <div className="col">
            <Logo>
              <img src={logo} alt="Rozgaarr" />
              <h1>Rozgaarr</h1>
            </Logo>{" "}
          </div>
          <div className="col">
            <h3>
              Office{" "}
              <div className="underline">
                <span></span>
              </div>
            </h3>
            <p>VJTI college</p>
            <p>Matunga,Mumbai-400019,Maharashtra,India</p>
            <p className="email-id">rozgarr22@gmail.com</p>
            <h4>+91-4754478444</h4>
          </div>
          <div className="col">
            <h3>
              Links
              <div className="underline">
                <span></span>
              </div>
            </h3>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/">About Us</a>
              </li>
              <li>
                <a href="/">Services</a>
              </li>
              <li>
                <a href="/jobs">Jobs</a>
              </li>
              <li>
                <a href="/faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div className="col">
            <h3>
              Newsletter
              <div className="underline">
                <span></span>
              </div>
            </h3>
            <form className="newsletter">
              <div className="icon">
                <FaEnvelope />
              </div>
              <input
                type="email"
                placeholder="Enter your email id"
                name=""
                required
              ></input>
              <button type="submit" name="">
                <div className="arrow">
                  <FaArrowRight />
                </div>
              </button>
            </form>
            <div className="social-icons">
              <a href="/">
                <div className="social-icon">
                  {" "}
                  <FaTwitter />
                </div>
              </a>
              <a href="/">
                <div className="social-icon">
                  <FaInstagram />
                </div>{" "}
              </a>
              <a href="/">
                <div className="social-icon">
                  <FaWhatsapp />
                </div>
              </a>

              <a href="/">
                <div className="social-icon">
                  {" "}
                  <FaFacebook />
                </div>
              </a>

              <a href="/">
                <div className="social-icon">
                  <FaGooglePlusG />
                </div>
              </a>
            </div>
          </div>
        </div>
        <hr />
        <p className="copyright">Rozgaarr,Copyright &#169; 2022</p>
      </footer>
    </div>
  );
};

export default Footer;