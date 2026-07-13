import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Team from './components/Team'
import InteriorGallery from './components/InteriorGallery'
import GraphicsExhibition from './components/GraphicsExhibition'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Preloader from './components/Preloader'
import Admin from './components/Admin'
import ProjectDetail from './components/ProjectDetail'
import ArchitectureGallery from './components/ArchitectureGallery'
import FloatingSocials from './components/FloatingSocials'

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Simple routing for admin
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (window.location.pathname === '/admin') {
      setIsAdminOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'a') {
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader onFinish={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdminOpen && (
          <Admin onExit={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>

      <main style={{ position: 'relative' }}>
        <Navbar 
          onAdminClick={() => setIsAdminOpen(true)} 
          hideNav={!!selectedProject} 
        />
        <Hero />
        <About />
        <Services />
        <Team />
        <ArchitectureGallery onProjectClick={setSelectedProject} />
        <InteriorGallery onProjectClick={setSelectedProject} />
        <GraphicsExhibition onProjectClick={setSelectedProject} />
        <Contact />
        <Footer onAdminClick={() => setIsAdminOpen(true)} />
        <FloatingSocials />
      </main>

    </>
  )
}


export default App
