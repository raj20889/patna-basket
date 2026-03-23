import React from "react";
import "./Footer.css"; // Assuming you want to style the footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Patna Basket. All rights reserved.</p>
        <nav>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;