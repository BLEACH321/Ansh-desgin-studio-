import { useState, useEffect } from 'react';

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  category: string;
  description: string;
  link: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: '/ansh11.jpeg',
    title: 'URBAN ELEGANCE',
    category: 'Interior Design',
    description: 'Crafting sophisticated living spaces that blend modern aesthetics with ultimate comfort.',
    link: '#interior'
  },
  {
    id: 2,
    image: '/ansh12.jpeg',
    title: 'MURAL HOUSE',
    category: 'Architecture',
    description: 'A bold architectural statement where form meets function in perfect harmony.',
    link: '#architecture'
  },
  {
    id: 3,
    image: '/ansh13.jpeg',
    title: 'SERENE SPACES',
    category: 'Residential',
    description: 'Creating peaceful sanctuaries designed to inspire and rejuvenate the soul.',
    link: '#residential'
  },
  {
    id: 4,
    image: '/ansh14.jpeg',
    title: 'MODERN VISTA',
    category: 'Exhibition',
    description: 'Innovative exhibition designs that captivate audiences and tell compelling stories.',
    link: '#exhibition'
  }
];

export const useHero = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  const loadSlides = () => {
    const saved = localStorage.getItem('hero_slides');
    if (saved) {
      setSlides(JSON.parse(saved));
    } else {
      setSlides(DEFAULT_SLIDES);
      localStorage.setItem('hero_slides', JSON.stringify(DEFAULT_SLIDES));
    }
  };

  useEffect(() => {
    loadSlides();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hero_slides') {
        loadSlides();
      }
    };
    
    const handleLocalUpdate = () => loadSlides();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('heroUpdated', handleLocalUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('heroUpdated', handleLocalUpdate);
    };
  }, []);

  const notifyUpdate = () => {
    window.dispatchEvent(new Event('heroUpdated'));
  };

  const updateSlide = (updatedSlide: HeroSlide) => {
    const updated = slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    localStorage.setItem('hero_slides', JSON.stringify(updated));
    setSlides(updated);
    notifyUpdate();
  };

  const addSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide = { ...slide, id: Date.now() };
    const updated = [newSlide, ...slides];
    localStorage.setItem('hero_slides', JSON.stringify(updated));
    setSlides(updated);
    notifyUpdate();
  };

  const deleteSlide = (id: number) => {
    const updated = slides.filter(s => s.id !== id);
    localStorage.setItem('hero_slides', JSON.stringify(updated));
    setSlides(updated);
    notifyUpdate();
  };

  const restoreDefaultSlides = () => {
    localStorage.setItem('hero_slides', JSON.stringify(DEFAULT_SLIDES));
    setSlides(DEFAULT_SLIDES);
    notifyUpdate();
  };

  return { 
    slides, 
    updateSlide, 
    addSlide, 
    deleteSlide, 
    restoreDefaultSlides 
  };
};
