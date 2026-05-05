import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Home, Layout, PenTool, ClipboardCheck } from 'lucide-react';
import './Services.css';

const services = [
  {
    id: '01',
    title: 'ARCHITECTURE',
    desc: 'Innovative architectural solutions that blend creativity with functionality. We design structures that stand the test of time.',
    icon: Home
  },
  {
    id: '02',
    title: 'INTERIOR DESIGN',
    desc: 'Elegant interiors tailored to your lifestyle and preferences. Our design philosophy focuses on comfort and aesthetics.',
    icon: Layout
  },
  {
    id: '03',
    title: 'GRAPHICS & EXHIBITIONS',
    desc: 'Creative exhibition and branding solutions that make an impact. We bring your brand to life through immersive visuals.',
    icon: PenTool
  }
];

const ServiceCard = ({ service, index }: { service: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="service-card-wrapper">
      <motion.div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        initial={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
        className="service-card"
      >
        <div className="service-icon-box">
          <service.icon size={32} color="var(--accent)" strokeWidth={1.5} />
        </div>

        <div className="service-info">
          <motion.div
            style={{ overflow: 'hidden' }}
          >
            <motion.span 
              initial={{ y: 0 }}
              className="service-number"
            >
              {service.id}
            </motion.span>
          </motion.div>
          <h3 className="service-title">{service.title}</h3>
        </div>

        <p className="service-desc">{service.desc}</p>
        
        <div className="service-line" />
      </motion.div>
    </div>
  );
};

const Services = () => {
  return (
    <section id="services" className="services">
      <div className="services-header">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-subtitle"
        >
          EXPERTISE
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="section-title"
        >
          Our <span>Services</span>
        </motion.h2>
      </div>

      <div className="services-container">
        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceCard 
              key={`${service.id}-${index}`} 
              service={service} 
              index={index} 
            />
          ))}
        </div>
      </div>

      <div className="services-progress-wrapper mobile-only">
        <span className="scroll-hint">SWIPE TO EXPLORE</span>
      </div>
    </section>
  );
};

export default Services;
