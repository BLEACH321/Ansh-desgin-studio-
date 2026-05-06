import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectDetail from './ProjectDetail';
import { useProjects } from '../hooks/useProjects';
import './GraphicsExhibition.css';

const GraphicsExhibition = ({ onProjectClick }: { onProjectClick: (project: any) => void }) => {
  const { projects } = useProjects();

  const graphicsProjects = projects.filter(p => p.type === 'graphics');

  return (
    <section id="graphics-exhibitions" className="exhibition">
      <div className="exhibition-header">
        <motion.span 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          className="section-subtitle"
        >
          STALLS & BRANDING
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="section-title"
        >
          Graphics & <span>Exhibition</span>
        </motion.h2>
      </div>

      <div className="exhibition-list">
        {graphicsProjects.map((project, index) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`exhibition-item ${index % 2 !== 0 ? 'reverse' : ''}`}
          >
            <div className="exhibition-image-box" onClick={() => onProjectClick(project)}>
              <img src={project.image} alt={project.title} />
            </div>

            <div className="exhibition-content">
              <span className="exhibition-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="exhibition-category">{project.category}</span>
              <h3 className="exhibition-title">{project.title}</h3>
              <p className="exhibition-desc">
                {project.desc?.split(' ').length > 20 
                  ? project.desc.split(' ').slice(0, 20).join(' ') + '...' 
                  : project.desc}
              </p>
              


              <div 
                className="exhibition-btn" 
                onClick={() => onProjectClick(project)}
                style={{ cursor: 'pointer' }}
              >
                EXPLORE CASE STUDY
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};


export default GraphicsExhibition;
