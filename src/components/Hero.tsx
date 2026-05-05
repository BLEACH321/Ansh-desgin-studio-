import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHero } from '../hooks/useHero';
import './Hero.css';

const Hero = () => {
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
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide, slides]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 35 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 35 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Graceful return for empty state after all hooks are called
  if (!slides || slides.length === 0) {
    return <section id="home" className="hero-premium" style={{ height: '100vh', background: '#000' }} />;
  }

  return (
    <section id="home" className="hero-premium">
      <div className="hero-background-blur">
        <motion.img
          key={currentIndex}
          src={slides[currentIndex].image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.2 }}
          className="blur-bg-img"
        />
      </div>

      <div className="card-container">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="image-card-wrapper"
          >
            <div className="image-card-inner">
              <img
                src={slides[currentIndex].image}
                alt={`Slide ${currentIndex + 1}`}
                className="main-hero-img"
              />
              <div className="card-glass-overlay"></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pagination-v2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`pagination-v2-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
          >
            <span className="page-num">0{index + 1}</span>
            <div className="page-line-wrapper">
              <div className="page-line"></div>
              {index === currentIndex && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  key={currentIndex}
                  transition={{ duration: 4.5, ease: "linear" }}
                  className="page-line-progress"
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
