import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectDetail from './ProjectDetail';
import { useProjects } from '../hooks/useProjects';
import './InteriorGallery.css';

const categories = ['ALL', 'RESIDENTIAL', 'COMMERCIAL', 'HOSPITALITY'];

const InteriorGallery = ({ onProjectClick }: { onProjectClick: (project: any) => void }) => {
  const { projects } = useProjects();
  const [filter, setFilter] = useState('ALL');
  const [orientations, setOrientations] = useState<Record<string, 'landscape' | 'portrait' | 'square'>>({});

  const interiorProjects = projects.filter(p => p.type === 'interior');

  const filteredItems = filter === 'ALL' 
    ? interiorProjects 
    : interiorProjects.filter(item => item.category === filter);

  useEffect(() => {
    let isMounted = true;
    interiorProjects.forEach((project) => {
      if (!project.image) return;
      const img = new Image();
      img.src = project.image;
      
      const handleLoad = () => {
        if (!isMounted) return;
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        let orientation: 'landscape' | 'portrait' | 'square' = 'square';
        if (width > height) {
          orientation = 'landscape';
        } else if (height > width) {
          orientation = 'portrait';
        }
        setOrientations(prev => {
          if (prev[project.id] === orientation) return prev;
          return { ...prev, [project.id]: orientation };
        });
      };

      if (img.complete && img.naturalWidth) {
        handleLoad();
      } else {
        img.onload = handleLoad;
      }
    });
    return () => {
      isMounted = false;
    };
  }, [projects]);

  return (
    <section id="interior-design" className="portfolio">
      <div className="portfolio-header">
        <motion.span 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          className="section-subtitle"
        >
          CURATED SPACES
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="section-title"
        >
          Interior <span>Design</span>
        </motion.h2>

        <div className="portfolio-filters">
          {categories.map((cat) => (
            <button 
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="portfolio-grid">
        <AnimatePresence mode='popLayout'>
          {filteredItems.map((item, idx) => (
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
              className={`portfolio-item ${orientations[item.id] ? `orientation-${orientations[item.id]}` : 'orientation-square'}`}
              onClick={() => onProjectClick(item)}
            >
              <div className="portfolio-item-inner">
                <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                <div className="portfolio-overlay">
                  <div className="overlay-content">
                    <span className="project-category">{item.category}</span>
                    <h3 className="project-title">{item.title}</h3>
                    <p className="project-desc">
                      {item.desc?.split(' ').length > 20 
                        ? item.desc.split(' ').slice(0, 20).join(' ') + '...' 
                        : item.desc}
                    </p>
                    <div className="project-line" />
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

export default InteriorGallery;
