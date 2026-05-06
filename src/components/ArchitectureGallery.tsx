import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../hooks/useProjects';
import './ArchitectureGallery.css';


const ArchitectureGallery = ({ onProjectClick }: { onProjectClick: (project: any) => void }) => {
  const { projects } = useProjects();
  const architectureProjects = projects.filter(p => p.type === 'architecture');

  return (
    <section id="architecture" className="arch-portfolio">
      <div className="arch-header">
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          className="section-subtitle"
        >

        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="section-title"
        >
          Architectural <span>Design</span>
        </motion.h2>
      </div>

      <motion.div layout className="arch-grid">
        <AnimatePresence mode='popLayout'>
          {architectureProjects.map((item, idx) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: (idx % 3) * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={`arch-item ${item.size || 'item-medium'}`}
              onClick={() => onProjectClick(item)}
            >
              <div className="arch-item-inner">
                <img src={item.image} alt={item.title} />
                <div className="arch-overlay">
                  <div className="arch-overlay-content">
                    <span className="arch-project-category">{item.category}</span>
                    <h3 className="arch-project-title">{item.title}</h3>
                    <p className="arch-project-desc">
                      {item.desc?.split(' ').length > 20 
                        ? item.desc.split(' ').slice(0, 20).join(' ') + '...' 
                        : item.desc}
                    </p>
                    <div className="arch-project-line"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default ArchitectureGallery;
