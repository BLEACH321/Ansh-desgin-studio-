import { motion } from 'framer-motion';
import './Team.css';

import { useTeam } from '../hooks/useTeam';

const Team = () => {
  const { members } = useTeam();
  // Duplicate the list to create a seamless loop
  const duplicatedMembers = [...members, ...members];

  return (
    <section id="about-us" className="team">
      <div className="team-header">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-subtitle"
        >
          MEET THE EXPERTS
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="section-title"
        >
          Our <span>Creative</span> Minds
        </motion.h2>
      </div>

      <div className="team-container">
        <motion.div
          className="team-track"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {duplicatedMembers.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="team-card"
            >
              <div className="team-image-wrapper">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <span className="team-role">{member.role}</span>
              </div>

            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Team;
