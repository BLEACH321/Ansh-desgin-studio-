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
}

export const useHero = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/projects.php?type=hero&t=${Date.now()}`); 
      if (res.data && Array.isArray(res.data)) {
        setSlides(res.data);
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
    await axios.put(`${API_BASE_URL}/projects.php?id=${id}`, updated);
    await loadSlides();
  };

  const deleteSlide = async (id: string) => {
    await axios.delete(`${API_BASE_URL}/projects.php?id=${id}`);
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
