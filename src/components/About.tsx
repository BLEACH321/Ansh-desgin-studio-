import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about-header">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-subtitle"
        >
          ABOUT US
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="section-title"
        >
          Transforming <span>Visions</span> into Reality
        </motion.h2>
      </div>

      <div className="about-item">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="about-image-box"
        >
          <img src="/director_new.jpg" alt="Our Studio" />
        </motion.div>

        <div className="about-content">

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="about-category"
          >
            OUR STORY
          </motion.span>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="about-text"
          >
            Ansh Design Studio was founded with a clear vision: to create beautiful and inspiring spaces that transcend the ordinary. Over the years, we have become renowned for our passion for design and expertise across a diverse portfolio—from private luxury villas to high-end restaurants and wellness centers.
            <br /><br />
            Our team of talented professionals strives to create unique, innovative spaces that reflect our clients' distinct personalities and needs. We blend intimate knowledge of the latest trends with meticulous attention to detail, ensuring every project is executed flawlessly.
          </motion.p>

          <div className="about-stats">
            {[
              { value: '500+', label: 'Projects Done' },
              { value: '34+', label: 'Cities' },
              { value: '20+', label: 'Years Experience' }

            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
                className="stat-item"
              >
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
