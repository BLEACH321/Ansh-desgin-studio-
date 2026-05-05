import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Portfolio.css';

const categories = ['ALL', 'INTERIOR', 'STALLS', 'BRANDING', 'ENVIRONMENTAL'];

const portfolioItems = [
  { 
    id: 1, 
    title: 'Vintec Stall 2020', 
    category: 'STALLS', 
    size: 'item-large', 
    image: '/p1.png',
    desc: 'Hexagonal futuristic structures with integrated LED lighting.'
  },
  { 
    id: 2, 
    title: 'Obsidian Penthouse', 
    category: 'INTERIOR', 
    size: 'item-medium', 
    image: '/g1.png',
    desc: 'Luxury residential design with panoramic views.'
  },
  { 
    id: 3, 
    title: 'Gujrat Ambuja HQ', 
    category: 'ENVIRONMENTAL', 
    size: 'item-tall', 
    image: '/about.png',
    desc: 'Corporate mission walls and premium acrylic signage.'
  },
  { 
    id: 4, 
    title: 'Sams Pizza Branding', 
    category: 'BRANDING', 
    size: 'item-medium', 
    image: '/p2.png',
    desc: 'Cohesive retail identity and environmental graphics.'
  },
  { 
    id: 5, 
    title: 'Mark Preschool', 
    category: 'ENVIRONMENTAL', 
    size: 'item-wide', 
    image: '/p3.png',
    desc: 'Theme-based wall murals for educational spaces.'
  },
  { 
    id: 6, 
    title: 'Velvet Hotel Lobby', 
    category: 'INTERIOR', 
    size: 'item-small', 
    image: '/g2.png',
    desc: 'Sophisticated hospitality environment.'
  },
];

const Portfolio = () => {
  const [filter, setFilter] = useState('ALL');

  const filteredItems = filter === 'ALL' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === filter);

  return (
    <section id="portfolio" className="portfolio">
      <div className="portfolio-header">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-subtitle"
        >
          CURATED WORKS
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="section-title"
        >
          Selected <span>Portfolio</span>
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
          {filteredItems.map((item) => (
            <motion.div 
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className={`portfolio-item ${item.size}`}
            >
              <div className="portfolio-item-inner">
                <img src={item.image} alt={item.title} />
                <div className="portfolio-overlay">
                  <div className="overlay-content">
                    <span className="project-id">{String(item.id).padStart(2, '0')}</span>
                    <span className="project-category">{item.category}</span>
                    <h3 className="project-title">{item.title}</h3>
                    <p className="project-desc">{item.desc}</p>
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

export default Portfolio;
