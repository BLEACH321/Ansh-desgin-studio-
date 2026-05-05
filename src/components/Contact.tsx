import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import './Contact.css';

const SocialIcon = ({ d, label, href, color }: { d: string, label: string, href?: string, color?: string }) => (
  <motion.a
    href={href || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon-btn"
    style={{ '--brand-color': color } as any}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    whileHover={{
      y: -4,
      transition: { duration: 0.3, ease: "easeOut" }
    }}
    whileTap={{ scale: 0.9 }}
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "currentColor"}>
      <path d={d} />
    </svg>
    <span className="social-tooltip" style={{ background: color || 'var(--accent)' }}>{label}</span>
  </motion.a>
);

const Contact = () => {
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // SheetDB API Endpoint
      const endpoint = 'https://sheetdb.io/api/v1/emmdwokjsmwi8';

      const payload = {
        data: [{
          Name: formData.name,
          Email: formData.email,
          Subject: formData.subject,
          Message: formData.message
        }]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.type === 'opaque') {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("SheetDB Error:", errorData || response.statusText);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-header-full">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-subtitle"
        >
          LET'S TALK
        </motion.span>
        <div className="contact-title-wrapper">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-title"
          >
            Start Your <span>Journey</span>
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.4
                }
              }
            }}
            className="header-socials"
          >
            <SocialIcon
              label="Instagram"
              href="https://www.instagram.com/anshdesignstudio/"
              color="#E4405F"
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            />
            <SocialIcon
              label="Facebook"
              href="https://www.facebook.com/people/anshdesignstudio/100090792608048/?mibextid=ZbWKwL"
              color="#1877F2"
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
            <SocialIcon
              label="WhatsApp"
              href="https://wa.me/8591277020 "
              color="#25D366"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.969c0 2.112.551 4.173 1.597 5.991L0 24l6.163-1.617a11.822 11.822 0 005.883 1.579h.005c6.604 0 11.967-5.364 11.97-11.97a11.82 11.82 0 00-3.41-8.445"
            />

          </motion.div>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-info">

          <div className="contact-cards">
            {[
              {
                icon: MapPin,
                title: 'OFFICE',
                value: 'Ladiwala Bhavan Society, Kamala Nehru Rd, Kandivali West, Mumbai 400067',
                delay: 0.4
              },
              { icon: Phone, title: 'PHONE', value: '+91 8591277020', delay: 0.5 },
              { icon: Mail, title: 'EMAIL', value: 'anshsdesignstudio@gmail.com', delay: 0.6 }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay }}
                className="contact-card"
              >
                <div className="card-icon">
                  <item.icon size={20} />
                </div>
                <div className="card-details">
                  <span className="card-label">{item.title}</span>
                  <p className="card-value">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="contact-map"
          >
            <iframe
              src="https://maps.google.com/maps?q=Ladiwala%20Bhavan%20Socitey,%20Kamala%20Nehru%20Rd,%20Kandivali%20West,%20Mumbai%20400067&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              className="map-iframe"
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </motion.div>
        </div>

        <div className="form-wrapper" style={{ perspective: '1000px' }}>
          <motion.div
            ref={formRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="contact-form-container"
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              {status === 'success' && (
                <div className="form-status success">
                  <CheckCircle size={20} />
                  <span>Message sent successfully!</span>
                </div>
              )}
              {status === 'error' && (
                <div className="form-status error">
                  <AlertCircle size={20} />
                  <span>Something went wrong. Please try again.</span>
                </div>
              )}

              <div className="form-group">
                <input type="text" id="name" required placeholder=" " value={formData.name} onChange={handleChange} disabled={status === 'submitting'} />
                <label htmlFor="name">YOUR NAME*</label>
                <div className="input-line" />
              </div>

              <div className="form-group">
                <input type="email" id="email" required placeholder=" " value={formData.email} onChange={handleChange} disabled={status === 'submitting'} />
                <label htmlFor="email">YOUR EMAIL*</label>
                <div className="input-line" />
              </div>

              <div className="form-group">
                <input type="text" id="subject" placeholder=" " value={formData.subject} onChange={handleChange} disabled={status === 'submitting'} />
                <label htmlFor="subject">SUBJECT</label>
                <div className="input-line" />
              </div>

              <div className="form-group">
                <textarea id="message" required rows={4} placeholder=" " value={formData.message} onChange={handleChange} disabled={status === 'submitting'}></textarea>
                <label htmlFor="message">YOUR MESSAGE*</label>
                <div className="input-line" />
              </div>

              <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                <span>{status === 'submitting' ? 'SENDING...' : 'SEND MESSAGE'}</span>
                <Send size={18} />
                <div className="btn-glow" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
