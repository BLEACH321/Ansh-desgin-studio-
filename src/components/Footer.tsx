import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = ({ onAdminClick }: { onAdminClick: () => void }) => {
  return (
    <footer className="footer">
      <div className="footer-copyright">
        © {new Date().getFullYear()} ANSH DESIGN STUDIO. ALL RIGHTS RESERVED.
      </div>

      <div className="footer-admin" onClick={onAdminClick} style={{ cursor: 'pointer' }}>
        STUDIO ACCESS
      </div>

      <div className="footer-brand">
        DESIGNED BY <span>SSCREATIVES</span>
      </div>
    </footer>
  );
};

export default Footer;
