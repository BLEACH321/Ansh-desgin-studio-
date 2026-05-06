import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProjectDetail.css';

interface Project {
  id: string | number;
  title: string;
  category: string;
  image: string;
  desc: string;
  location?: string;
  year?: string;
  area?: string;
  gallery?: string[];
}

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
  const [selectedImgIndex, setSelectedImgIndex] = React.useState<number | null>(null);

  const galleryImages = project.gallery && project.gallery.length > 0 
    ? [project.image, ...project.gallery] 
    : [project.image];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImgIndex !== null) {
      setSelectedImgIndex((selectedImgIndex + 1) % galleryImages.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImgIndex !== null) {
      setSelectedImgIndex((selectedImgIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  const titleWords = project.title.split(' ');

  return (
    <motion.div 
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ clipPath: 'circle(0% at 50% 50%)' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      className="project-detail"
    >
      {/* Lightbox Overlay */}
      <AnimatePresence mode="wait">
        {selectedImgIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox-overlay"
            onClick={() => setSelectedImgIndex(null)}
          >
            <motion.button 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              transition={{ delay: 0.3 }}
              className="lightbox-close" 
              onClick={() => setSelectedImgIndex(null)}
            >
              ✕
            </motion.button>
            
            <motion.button 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="nav-btn prev" 
              onClick={handlePrev}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>

            <motion.div 
              key={selectedImgIndex}
              initial={{ scale: 0.9, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 1.1, opacity: 0, filter: 'blur(20px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lightbox-content"
            >
              <img src={galleryImages[selectedImgIndex]} alt="Gallery view" />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="lightbox-info"
              >
                <span className="info-category">{project.category}</span>
                <span className="info-counter">{selectedImgIndex + 1} of {galleryImages.length}</span>
              </motion.div>
            </motion.div>

            <motion.button 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="nav-btn next" 
              onClick={handleNext}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="detail-sidebar">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="detail-close" 
          onClick={onClose}
        >
          BACK TO PROJECTS
        </motion.div>
        <div className="detail-header">
          <motion.span 
            initial={{ opacity: 0, letterSpacing: '1em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="detail-category"
          >
            {project.category}
          </motion.span>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="detail-title"
          >
            {project.title}
          </motion.h2>



          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="detail-info-grid"
          >
            {project.location && (
              <div className="info-item">
                <span className="info-label">LOCATION</span>
                <span className="info-value">{project.location}</span>
              </div>
            )}
            {project.year && (
              <div className="info-item">
                <span className="info-label">YEAR</span>
                <span className="info-value">{project.year}</span>
              </div>
            )}
            {project.area && (
              <div className="info-item">
                <span className="info-label">AREA</span>
                <span className="info-value">{project.area}</span>
              </div>
            )}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="detail-desc"
          >
            {project.desc}
          </motion.p>

        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          style={{ fontSize: '0.7rem', color: 'var(--secondary)', letterSpacing: '0.1em', marginTop: '6rem', paddingBottom: '4rem' }}
        >
          &copy; 2026 ANSH DESIGN STUDIO
        </motion.div>
      </div>

      <div className="detail-main">
        <div className="detail-gallery-grid">
          {galleryImages.map((img, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="gallery-img-wrapper"
              onClick={() => setSelectedImgIndex(i)}
              style={{ cursor: 'zoom-in' }}
            >
              <img src={img} alt={`${project.title} view ${i + 1}`} />
              <motion.div 
                initial={{ x: '-100%' }}
                whileInView={{ x: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  zIndex: 2
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
