import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHero } from '../hooks/useHero';
import './Hero.css';

const Hero = ({ onProjectClick }: { onProjectClick?: (project: any) => void }) => {
  const { slides } = useHero();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides]);

  const prevSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides]);

  const handleExploreProject = () => {
    if (onProjectClick && slides[currentIndex]) {
      onProjectClick({
        ...slides[currentIndex],
        desc: slides[currentIndex].description || ''
      });
    }
  };

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setInterval(nextSlide, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [nextSlide, slides]);

  // Graceful return for empty state after all hooks are called
  if (!slides || slides.length === 0) {
    return <section id="home" className="hero-fullscreen" style={{ height: '100vh', background: '#000' }} />;
  }

  return (
    <section id="home" className="hero-fullscreen">
      {/* Fullscreen Ken Burns Background Image */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="hero-fullscreen-bg"
          style={{ backgroundImage: `url(${slides[currentIndex].image})` }}
        />
      </AnimatePresence>

      {/* Dark Vignette Overlay */}
      <div className="hero-overlay-vignette" />

      {/* Content Container */}
      <div className="hero-content-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="hero-slide-info"
          >
            <span className="hero-slide-category">
              {slides[currentIndex].category || 'Interior Design'}
            </span>
            <h1 className="hero-slide-title">
              {slides[currentIndex].title || 'ANSH DESIGN STUDIO'}
            </h1>
            <p className="hero-slide-description">
              {slides[currentIndex].description || 'Crafting sophisticated living spaces that blend modern aesthetics with ultimate comfort.'}
            </p>
            
            <div className="hero-slide-actions">
              <button onClick={handleExploreProject} className="hero-cta-btn primary">
                EXPLORE CASE STUDY
              </button>
              <a href="#contact" className="hero-cta-btn secondary">
                CONTACT US
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Metadata Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
            className="hero-slide-meta"
          >
            <div className="meta-item">
              <span className="meta-label">LOCATION</span>
              <span className="meta-value">{slides[currentIndex].location || 'New Delhi, India'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">YEAR</span>
              <span className="meta-value">{slides[currentIndex].year || '2025'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">AREA</span>
              <span className="meta-value">{slides[currentIndex].area || '450 SQFT'}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation and Progress Indicators */}
      <div className="hero-navigation-bar">
        <button onClick={prevSlide} className="hero-nav-arrow prev" aria-label="Previous slide">
          ←
        </button>

        <div className="hero-pagination-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot-item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            >
              <span className="dot-number">0{index + 1}</span>
              <div className="dot-line-wrapper">
                <div className="dot-line" />
                {index === currentIndex && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    key={currentIndex}
                    transition={{ duration: 5, ease: "linear" }}
                    className="dot-line-progress"
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        <button onClick={nextSlide} className="hero-nav-arrow next" aria-label="Next slide">
          →
        </button>
      </div>
    </section>
  );
};

export default Hero;
