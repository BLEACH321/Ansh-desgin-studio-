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
