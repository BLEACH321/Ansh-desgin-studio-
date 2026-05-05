import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './Projects.css';

const projects = [
  { id: 1, name: 'Vintec Stall 2020', category: 'Graphics & Exhibition', image: '/p1.png' },
  { id: 2, name: 'Private Luxury Villa', category: 'Interior Design', image: '/p2.png' },
  { id: 3, name: 'Modern Office Suite', category: 'Commercial Design', image: '/p3.png' },
];

const Projects = () => {
  return (
    <section id="interior-design" className="projects">
      <div className="projects-header">
        <motion.h2 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="projects-title"
        >
          Latest <span style={{ color: 'var(--accent)' }}>Projects</span>
        </motion.h2>
        
        <motion.button 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.975rem', 
            color: 'var(--accent)',
            fontSize: '0.9rem',
            letterSpacing: '0.1em',
            fontWeight: 600
          }}
        >
          VIEW ALL PROJECTS
          <ArrowRight size={20} />
        </motion.button>
      </div>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="project-card"
          >
            <img src={project.image} alt={project.name} />
            <div className="project-overlay">
              <span className="project-category">{project.category}</span>
              <h3 className="project-name">{project.name}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
