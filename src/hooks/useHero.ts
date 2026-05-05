import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

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

  useEffect(() => {
    const q = query(collection(db, 'hero'), orderBy('title', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slidesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HeroSlide[];
      setSlides(slidesData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addSlide = async (slide: Omit<HeroSlide, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'hero'), slide);
      return docRef.id;
    } catch (e) {
      console.error("Error adding slide to Firebase:", e);
      throw e;
    }
  };

  const updateSlide = async (id: string, updated: Partial<HeroSlide>) => {
    try {
      const slideRef = doc(db, 'hero', id);
      await updateDoc(slideRef, updated);
    } catch (e) {
      console.error("Error updating slide in Firebase:", e);
      throw e;
    }
  };

  const deleteSlide = async (id: string) => {
    try {
      const slideRef = doc(db, 'hero', id);
      await deleteDoc(slideRef);
    } catch (e) {
      console.error("Error deleting slide from Firebase:", e);
      throw e;
    }
  };

  return { 
    slides, 
    loading,
    addSlide, 
    updateSlide, 
    deleteSlide 
  };
};
