import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAdminClick, hideNav }: { onAdminClick: () => void, hideNav?: boolean }) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
    const navLinks = [
    { name: 'HOME', id: 'home' },
    { name: 'ABOUT', id: 'about' },
    { name: 'ARCHITECTURE', id: 'architecture' },
    { name: 'INTERIOR DESIGN', id: 'interior-design' },
    { name: 'GRAPHICS & EXHIBITIONS', id: 'graphics-exhibitions' },
    { name: 'CONTACT', id: 'contact' }
  ];

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    // Force dark mode as default even if user previously had light mode
    const initialTheme = savedTheme === 'light' ? 'dark' : (savedTheme || 'dark');
    if (savedTheme === 'light') localStorage.setItem('theme', 'dark'); 
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  if (hideNav) return null;

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}
      >
        <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="nav-logo-link">
          <div className="nav-logo">
            <img src="/logo.png" alt="Ansh Design Studio" className="nav-logo-image" />
          </div>
        </a>

        <div className="nav-right">
          <ul className="nav-list desktop-only" onMouseLeave={() => setHoveredIndex(null)}>
            {navLinks.map((link, i) => (
              <li 
                key={link.name} 
                className="nav-item"
                onMouseEnter={() => setHoveredIndex(i)}
              >
                <a 
                  href={`#${link.id}`} 
                  onClick={(e) => handleNavClick(e, link.id)} 
                  className="nav-link"
                >
                  <motion.span
                    initial="initial"
                    whileHover="hovered"
                    style={{ display: 'inline-block', position: 'relative', overflow: 'hidden' }}
                  >
                    <motion.div
                      variants={{
                        initial: { y: 0 },
                        hovered: { y: "-100%" },
                      }}
                    >
                      {link.name}
                    </motion.div>
                    <motion.div
                      style={{ position: 'absolute', top: '100%', left: 0 }}
                      variants={{
                        initial: { y: 0 },
                        hovered: { y: "-100%" },
                      }}
                    >
                      {link.name}
                    </motion.div>
                  </motion.span>
                </a>
                <AnimatePresence>
                  {hoveredIndex === i && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="nav-indicator"
                      initial={{ opacity: 0, scaleX: 0.5 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.5 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 25,
                        mass: 0.8
                      }}
                    />
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button onClick={toggleTheme} className="theme-toggle">
              <motion.div
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </motion.div>
            </button>

            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-menu"
          >
            <div className="mobile-menu-content">
              <ul className="mobile-nav-list">
                {navLinks.map((link, i) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    <a 
                      href={`#${link.id}`} 
                      className="mobile-nav-link"
                      onClick={(e) => {
                        handleNavClick(e, link.id);
                        document.body.style.overflow = 'unset';
                      }}
                    >
                      <span className="link-num">0{i + 1}</span>
                      <span className="link-text">{link.name}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mobile-menu-footer">
                <div className="mobile-socials">
                  <span>FACEBOOK</span>
                  <span>LINKEDIN</span>
                </div>
                <p>© 2026 ANSH DESIGN STUDIO</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;


