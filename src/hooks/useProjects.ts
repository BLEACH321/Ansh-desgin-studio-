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

export interface Project {
  id: string;
  title: string;
  category: string;
  type: 'interior' | 'graphics' | 'architecture';
  image: string;
  gallery: string[];
  desc: string;
  location?: string;
  year?: string;
  area?: string;
  size?: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time synchronization with Firestore
    const q = query(collection(db, 'projects'), orderBy('title', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'projects'), project);
      return docRef.id;
    } catch (e) {
      console.error("Error adding project to Firebase:", e);
      throw e;
    }
  };

  const updateProject = async (id: string, updated: Partial<Project>) => {
    try {
      const projectRef = doc(db, 'projects', id);
      await updateDoc(projectRef, updated);
    } catch (e) {
      console.error("Error updating project in Firebase:", e);
      throw e;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const projectRef = doc(db, 'projects', id);
      await deleteDoc(projectRef);
    } catch (e) {
      console.error("Error deleting project from Firebase:", e);
      throw e;
    }
  };

  return { 
    projects, 
    loading,
    addProject, 
    updateProject, 
    deleteProject 
  };
};
