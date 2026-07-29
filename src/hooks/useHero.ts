import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  category: string;
  description: string;
  link: string;
  type?: string;
}

export const useHero = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/projects.php?type=hero&t=${Date.now()}`); 
      if (res.data && Array.isArray(res.data)) {
        const cleanUrl = (url: string) => {
          if (!url) return url;
          if (url.startsWith('data:')) return url;
          const uploadsIdx = url.indexOf('uploads/');
          if (uploadsIdx !== -1) {
            return `${API_BASE_URL}/${url.substring(uploadsIdx)}`;
          }
          return url;
        };
        setSlides(res.data.map((s: any) => ({
          ...s,
          image: cleanUrl(s.image),
          gallery: Array.isArray(s.gallery) ? s.gallery.map(cleanUrl) : []
        })));
      } else {
        setSlides([]);
      }
    } catch (e) {
      console.error("Error loading slides:", e);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const addSlide = async (slide: Omit<HeroSlide, 'id'>) => {
    await axios.post(`${API_BASE_URL}/projects.php?type=hero`, slide);
    await loadSlides();
  };

  const updateSlide = async (id: string, updated: Partial<HeroSlide>) => {
    await axios.post(`${API_BASE_URL}/projects.php?id=${id}&action=update`, updated);
    await loadSlides();
  };

  const deleteSlide = async (id: string) => {
    await axios.post(`${API_BASE_URL}/projects.php?id=${id}&action=delete`);
    await loadSlides();
  };

  const restoreDefaultSlides = () => {
    // Logic to restore defaults
  };

  return { 
    slides, 
    loading,
    addSlide, 
    updateSlide, 
    deleteSlide,
    restoreDefaultSlides
  };
};
