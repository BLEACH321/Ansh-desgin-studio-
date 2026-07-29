import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  client?: string;
  services?: string;
  gallery?: string[];
  type?: 'interior' | 'graphics' | 'architecture';
}

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onProjectChange?: (project: Project) => void;
  allProjects?: Project[];
}

const GalleryImage = ({ src, alt, ratio, onClick }: { src: string, alt: string, ratio?: number, onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div 
      className="gallery-img-wrapper"
      onClick={onClick}
      style={{ 
        position: 'relative', 
        width: '100%', 
        overflow: 'hidden',
        aspectRatio: ratio ? `${ratio}` : '4/3',
        background: 'var(--surface)'
      }}
    >
      {!loaded && (
        <div 
          className="blur-placeholder" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }} 
        />
      )}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          filter: loaded ? 'none' : 'blur(20px)',
          transition: 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease',
          position: 'relative',
          zIndex: 2,
          opacity: loaded ? 1 : 0.8
        }}
      />
    </div>
  );
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose, onProjectChange, allProjects = [] }) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});
  const [numCols, setNumCols] = useState(4);

  // Lightbox Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const galleryImages = useMemo(() => {
    return project.gallery && project.gallery.length > 0 
      ? [project.image, ...project.gallery] 
      : [project.image];
  }, [project]);

  // Handle Columns Count Responsively
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w > 1200) {
        setNumCols(4); // Desktop
      } else if (w > 768) {
        setNumCols(3); // Laptop
      } else if (w > 480) {
        setNumCols(2); // Tablet
      } else {
        setNumCols(1); // Mobile
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine Image Aspect Ratios
  useEffect(() => {
    let isMounted = true;
    galleryImages.forEach((imgUrl) => {
      if (aspectRatios[imgUrl]) return; // Skip if already detected

      const img = new Image();
      img.src = imgUrl;

      const handleLoad = () => {
        if (!isMounted) return;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setAspectRatios(prev => ({
          ...prev,
          [imgUrl]: w / h
        }));
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
  }, [project, galleryImages]);

  // Distribute images into columns horizontally to keep order sequential left-to-right
  const columns = useMemo(() => {
    const cols: string[][] = Array.from({ length: numCols }, () => []);
    galleryImages.forEach((img, idx) => {
      cols[idx % numCols].push(img);
    });
    return cols;
  }, [galleryImages, numCols]);

  // Project Navigation
  const typeProjects = useMemo(() => {
    if (!allProjects || allProjects.length === 0) return [];
    const pType = project.type || 'interior';
    return allProjects.filter(p => (p.type || 'interior') === pType);
  }, [allProjects, project.type]);

  const currentIndex = useMemo(() => {
    return typeProjects.findIndex(p => p.id === project.id);
  }, [typeProjects, project.id]);

  const prevProject = currentIndex > 0 ? typeProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < typeProjects.length - 1 ? typeProjects[currentIndex + 1] : null;

  const handlePrevProject = () => {
    if (prevProject && onProjectChange) {
      onProjectChange(prevProject);
      setIsInfoOpen(false); // Close panel on switch
    }
  };

  const handleNextProject = () => {
    if (nextProject && onProjectChange) {
      onProjectChange(nextProject);
      setIsInfoOpen(false); // Close panel on switch
    }
  };

  // Lightbox Image switching
  const showNextImg = () => {
    if (selectedImgIndex !== null) {
      setSelectedImgIndex((selectedImgIndex + 1) % galleryImages.length);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const showPrevImg = () => {
    if (selectedImgIndex !== null) {
      setSelectedImgIndex((selectedImgIndex - 1 + galleryImages.length) % galleryImages.length);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImgIndex === null) return;
      if (e.key === 'ArrowRight') {
        showNextImg();
      } else if (e.key === 'ArrowLeft') {
        showPrevImg();
      } else if (e.key === 'Escape') {
        setSelectedImgIndex(null);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Lock background scroll while detail page is open
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedImgIndex, galleryImages]);

  // Mouse wheel zoom
  useEffect(() => {
    const element = lightboxRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomLevel(prev => {
        const nextZoom = prev - e.deltaY * 0.005;
        return Math.min(Math.max(nextZoom, 1), 4);
      });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [selectedImgIndex]);

  // Double Click Zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setZoomLevel(2.5);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Pinch Zoom on Mobile
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setInitialTouchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistance !== null) {
      const currentDist = getTouchDistance(e.touches);
      const ratio = currentDist / initialTouchDistance;
      setZoomLevel(prev => Math.min(Math.max(prev * ratio, 1), 4));
      setInitialTouchDistance(currentDist);
    } else if (e.touches.length === 1 && isDragging) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setInitialTouchDistance(null);
    setIsDragging(false);
  };

  return (
    <motion.div 
      initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0.8 }}
      animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      exit={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0.8 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      className="project-detail"
    >
      <div className="detail-gallery-container">
        {/* True Masonry Columns Grid */}
        <div className="detail-gallery-grid-masonry">
          {columns.map((colImages, colIdx) => (
            <div key={colIdx} className="detail-gallery-col">
              {colImages.map((img) => (
                <GalleryImage 
                  key={img}
                  src={img}
                  alt={`${project.title} view`}
                  ratio={aspectRatios[img]}
                  onClick={() => {
                    const originalIdx = galleryImages.indexOf(img);
                    setSelectedImgIndex(originalIdx);
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Floating Glass Info Button */}
        <motion.button 
          className={`floating-info-btn ${isInfoOpen ? 'active' : ''}`}
          onClick={() => setIsInfoOpen(!isInfoOpen)}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.3 }}
        >
          {isInfoOpen ? (
            <X size={24} className="luxury-icon" />
          ) : (
            <Sparkles size={24} className="luxury-icon" />
          )}
        </motion.button>

        {/* Slide-out Side Information Panel */}
        <AnimatePresence>
          {isInfoOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="info-side-panel"
            >
              <div className="panel-content">
                <span className="panel-category">{project.category}</span>
                <h2 className="panel-title">{project.title}</h2>
                
                <div className="panel-metadata-grid">
                  {project.location && (
                    <div className="metadata-item">
                      <span className="metadata-label">LOCATION</span>
                      <span className="metadata-value">{project.location}</span>
                    </div>
                  )}
                  {project.year && (
                    <div className="metadata-item">
                      <span className="metadata-label">YEAR</span>
                      <span className="metadata-value">{project.year}</span>
                    </div>
                  )}
                  {project.area && (
                    <div className="metadata-item">
                      <span className="metadata-label">AREA</span>
                      <span className="metadata-value">{project.area}</span>
                    </div>
                  )}
                  {project.client && (
                    <div className="metadata-item">
                      <span className="metadata-label">CLIENT</span>
                      <span className="metadata-value">{project.client}</span>
                    </div>
                  )}
                  {project.services && (
                    <div className="metadata-item">
                      <span className="metadata-label">SERVICES</span>
                      <span className="metadata-value">{project.services}</span>
                    </div>
                  )}
                </div>

                <div className="panel-divider" />

                <p className="panel-desc">{project.desc}</p>

                <div className="panel-divider" />

                {/* Project Navigation */}
                <div className="panel-nav">
                  <button 
                    className="panel-nav-btn" 
                    onClick={handlePrevProject} 
                    disabled={!prevProject}
                  >
                    <ChevronLeft size={20} />
                    <span>PREV PROJECT</span>
                  </button>
                  <button 
                    className="panel-nav-btn" 
                    onClick={handleNextProject} 
                    disabled={!nextProject}
                  >
                    <span>NEXT PROJECT</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <button className="panel-exit-btn" onClick={onClose}>
                  CLOSE GALLERY
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox Overlay */}
        <AnimatePresence>
          {selectedImgIndex !== null && (
            <motion.div 
              ref={lightboxRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lightbox-overlay"
              onClick={() => setSelectedImgIndex(null)}
            >
              <button className="lightbox-close" onClick={() => setSelectedImgIndex(null)}>✕</button>

              <button className="nav-btn prev" onClick={(e) => { e.stopPropagation(); showPrevImg(); }}>
                <ChevronLeft size={28} />
              </button>

              <div 
                className="lightbox-content"
                style={{ cursor: zoomLevel > 1 ? 'grab' : 'zoom-in' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img 
                  ref={imgRef}
                  src={galleryImages[selectedImgIndex]} 
                  alt={`Lightbox view ${selectedImgIndex + 1}`}
                  onDoubleClick={handleDoubleClick}
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    pointerEvents: 'auto'
                  }}
                />
              </div>

              <button className="nav-btn next" onClick={(e) => { e.stopPropagation(); showNextImg(); }}>
                <ChevronRight size={28} />
              </button>

              <div className="lightbox-info">
                <span className="info-category">{project.category}</span>
                <span className="info-counter">{selectedImgIndex + 1} of {galleryImages.length}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
