import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Preloader.css';

const Preloader = ({ onFinish }: { onFinish: () => void }) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  const brandName = "ANSH DESIGN STUDIO";

  return (
    <motion.div 
      className="preloader"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="preloader-content">
        <div className="logo-container">
          <motion.img 
            src="/logo.png" 
            alt="Logo"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="preloader-logo"
          />
          <div className="logo-glow" />
        </div>

        <div className="preloader-info">
          <div className="preloader-bar-container">
            <motion.div 
              className="preloader-bar"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <motion.div 
            className="preloader-status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="status-text">INITIALIZING STUDIO</span>
            <span className="preloader-percentage">{percentage}%</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
