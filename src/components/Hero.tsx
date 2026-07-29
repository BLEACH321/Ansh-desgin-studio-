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

  // Parallax sliding transitions variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
      opacity: 0,
      zIndex: 1
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 2
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-20%" : dir < 0 ? "20%" : 0,
      opacity: 0,
      zIndex: 0
    })
  };

  return (
    <section id="home" className="hero-fullscreen">
      {/* Fullscreen Parallax Sliding Background Image Wrapper */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 180, damping: 24, mass: 0.8 },
            opacity: { duration: 0.6, ease: "easeOut" }
          }}
          className="hero-fullscreen-bg-wrapper"
        >
          {/* Inner image with continuous slow Ken Burns Zoom */}
          <div 
            className="hero-fullscreen-bg-inner" 
            style={{ backgroundImage: `url(${slides[currentIndex].image})` }} 
          />
        </motion.div>
      </AnimatePresence>

      {/* Softer Dark Vignette Overlay */}
      <div className="hero-overlay-vignette" />

      {/* Navigation and Progress Indicators (Centered pagination numbers only) */}
      <div className="hero-navigation-bar">
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
      </div>
    </section>
  );
};

export default Hero;
