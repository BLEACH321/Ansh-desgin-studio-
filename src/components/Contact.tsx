import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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
